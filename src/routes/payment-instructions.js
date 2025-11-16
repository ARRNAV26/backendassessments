/* eslint-disable camelcase */
const parseInstruction = require('../parser/parser');
const { validateCurrency } = require('../validator/currency');
const { shouldExecute } = require('../validator/date');
const { executeTransaction } = require('../engine/executeTransaction');
const scheduleTransaction = require('../engine/scheduleTransaction');

// Helper to find account
function findAccount(accounts, id) {
  return accounts.find((acc) => acc.id === id);
}

async function paymentInstructions({ accounts, instruction }) {
  console.log('Accounts received:', accounts);
  console.log('Instruction:', instruction);
  const parsed = parseInstruction(instruction);
  console.log('Parsed:', parsed);
  if (parsed.error) {
    return {
      type: null,
      amount: null,
      currency: null,
      debit_account: null,
      credit_account: null,
      execute_by: null,
      status: 'failed',
      status_reason: parsed.message || 'Validation error',
      status_code: parsed.error,
      accounts: [],
    };
  }

  // Since parsing already validates format, now business validations
  const { type, amount, currency, debit_account, credit_account, execute_by } = parsed;

  if (!validateCurrency(currency)) {
    return {
      type,
      amount,
      currency,
      debit_account,
      credit_account,
      execute_by,
      status: 'failed',
      status_reason: 'Unsupported currency. Only NGN, USD, GBP, and GHS are supported',
      status_code: 'CU02',
      accounts: [],
    };
  }

  const debitAcc = findAccount(accounts, debit_account);
  const creditAcc = findAccount(accounts, credit_account);

  if (!debitAcc || !creditAcc) {
    return {
      type,
      amount,
      currency,
      debit_account,
      credit_account,
      execute_by,
      status: 'failed',
      status_reason: `${debitAcc ? 'Debit' : 'Credit'} account not found`,
      status_code: 'AC03',
      accounts: debitAcc && creditAcc ? [debitAcc, creditAcc] : [],
    };
  }

  if (
    debitAcc.currency.toUpperCase() !== currency ||
    creditAcc.currency.toUpperCase() !== currency
  ) {
    return {
      type,
      amount,
      currency,
      debit_account,
      credit_account,
      execute_by,
      status: 'failed',
      status_reason: 'Account currency mismatch',
      status_code: 'CU01',
      accounts: [debitAcc, creditAcc].sort((a, b) => accounts.indexOf(a) - accounts.indexOf(b)),
    };
  }

  if (debitAcc.balance < amount) {
    return {
      type,
      amount,
      currency,
      debit_account,
      credit_account,
      execute_by,
      status: 'failed',
      status_reason: `Insufficient funds in account ${debitAcc.id}: has ${debitAcc.balance} ${currency}, needs ${amount} ${currency}`,
      status_code: 'AC01',
      accounts: [debitAcc, creditAcc].sort((a, b) => accounts.indexOf(a) - accounts.indexOf(b)),
    };
  }

  if (debit_account === credit_account) {
    return {
      type,
      amount,
      currency,
      debit_account,
      credit_account,
      execute_by,
      status: 'failed',
      status_reason: 'Debit and credit accounts cannot be the same',
      status_code: 'AC02',
      accounts: [debitAcc],
    };
  }

  const execute = shouldExecute(execute_by);

  let result;
  if (execute) {
    result = executeTransaction(accounts, debit_account, credit_account, amount);
  } else {
    result = scheduleTransaction();
  }

  const { status, status_code, status_reason, updatedAccounts } = result;

  const updated = (updatedAccounts || [debitAcc, creditAcc])
    .sort((a, b) => accounts.indexOf(a) - accounts.indexOf(b))
    .map((acc) => ({
      id: acc.id,
      balance: acc.balance,
      balance_before: acc.balance_before || acc.balance + (status === 'successful' ? amount : 0),
      currency: acc.currency.toUpperCase(),
    }));

  return {
    type,
    amount,
    currency,
    debit_account,
    credit_account,
    execute_by,
    status,
    status_reason,
    status_code,
    accounts: updated,
  };
}

module.exports = paymentInstructions;
