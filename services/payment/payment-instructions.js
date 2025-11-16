// No validator spec needed, simple function

const currencies = ['NGN', 'USD', 'GBP', 'GHS'];

function isValidAccountId(accountId) {
  // letters, numbers, hyphens, periods, at symbols
  if (!accountId || accountId.length === 0) return false;
  const allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-@';
  for (let i = 0; i < accountId.length; i++) {
    if (allowedChars.indexOf(accountId[i]) == -1) return false;
  }
  return true;
}

function parseInstruction(instruction) {
  const instr = instruction.trim().replace(/\s+/g, ' ');
  const tokens = instr.split(' ');

  if (tokens.length < 8) {
    return { error: 'SY03', message: 'Malformed instruction: unable to parse keywords' };
  }

  // Check type case insensitively
  const typeLower = tokens[0].toLowerCase();
  if (typeLower !== 'debit' && typeLower !== 'credit') {
    return { error: 'SY03', message: 'Malformed instruction: unknown type' };
  }

  const amountStr = tokens[1];
  if (!amountStr || isNaN(amountStr) || amountStr.includes('.')) {
    return { error: 'AM01', message: 'Amount must be a positive integer' };
  }
  const amount = parseInt(amountStr, 10);
  if (amount <= 0) {
    return { error: 'AM01', message: 'Amount must be a positive integer' };
  }

  const currency = tokens[2].toUpperCase(); // Currencies are case insensitive, but output uppercase
  if (!currencies.includes(currency)) {
    return {
      error: 'CU02',
      message: 'Unsupported currency. Only NGN, USD, GBP, and GHS are supported',
    };
  }

  let debitAcc;
  let creditAcc;
  let executeBy = null;

  if (typeLower === 'debit') {
    // DEBIT amount currency FROM ACCOUNT debit FOR CREDIT TO ACCOUNT credit [ON date]
    if (tokens.length < 11) return { error: 'SY01', message: 'Missing required keyword' };
    if (tokens[3].toLowerCase() !== 'from' || tokens[4].toLowerCase() !== 'account')
      return { error: 'SY02', message: 'Invalid keyword order' };
    debitAcc = tokens[5];
    if (
      tokens[6].toLowerCase() !== 'for' ||
      tokens[7].toLowerCase() !== 'credit' ||
      tokens[8].toLowerCase() !== 'to' ||
      tokens[9].toLowerCase() !== 'account'
    )
      return { error: 'SY02', message: 'Invalid keyword order' };
    creditAcc = tokens[10];
    if (tokens.length > 11) {
      if (tokens[11].toLowerCase() === 'on') {
        executeBy = tokens[12];
        const parts = executeBy.split('-');
        if (
          parts.length !== 3 ||
          parts[0].length !== 4 ||
          isNaN(parts[0]) ||
          parts[0] != parseInt(parts[0], 10) ||
          parts[1].length !== 2 ||
          isNaN(parts[1]) ||
          parts[1] != parseInt(parts[1], 10) ||
          parts[2].length !== 2 ||
          isNaN(parts[2]) ||
          parts[2] != parseInt(parts[2], 10)
        ) {
          return { error: 'DT01', message: 'Invalid date format' };
        }
      } else {
        return { error: 'SY01', message: 'Missing required keyword' };
      }
    }
  } else if (typeLower === 'credit') {
    // CREDIT amount currency TO ACCOUNT credit FOR DEBIT FROM ACCOUNT debit [ON date]
    if (tokens.length < 11) return { error: 'SY01', message: 'Missing required keyword' };
    if (tokens[3].toLowerCase() !== 'to' || tokens[4].toLowerCase() !== 'account')
      return { error: 'SY02', message: 'Invalid keyword order' };
    creditAcc = tokens[5];
    if (
      tokens[6].toLowerCase() !== 'for' ||
      tokens[7].toLowerCase() !== 'debit' ||
      tokens[8].toLowerCase() !== 'from' ||
      tokens[9].toLowerCase() !== 'account'
    )
      return { error: 'SY02', message: 'Invalid keyword order' };
    debitAcc = tokens[10];
    if (tokens.length > 11) {
      if (tokens[11].toLowerCase() === 'on') {
        executeBy = tokens[12];
        const parts = executeBy.split('-');
        if (
          parts.length !== 3 ||
          parts[0].length !== 4 ||
          isNaN(parts[0]) ||
          parts[0] != parseInt(parts[0], 10) ||
          parts[1].length !== 2 ||
          isNaN(parts[1]) ||
          parts[1] != parseInt(parts[1], 10) ||
          parts[2].length !== 2 ||
          isNaN(parts[2]) ||
          parts[2] != parseInt(parts[2], 10)
        ) {
          return { error: 'DT01', message: 'Invalid date format' };
        }
      } else {
        return { error: 'SY01', message: 'Missing required keyword' };
      }
    }
  }

  // validate account ids
  if (!isValidAccountId(debitAcc) || !isValidAccountId(creditAcc)) {
    return { error: 'AC04', message: 'Invalid account ID format' };
  }

  return {
    type: typeLower,
    amount,
    currency,
    debit_account: debitAcc,
    credit_account: creditAcc,
    execute_by: executeBy,
  };
}

function findAccount(accounts, id) {
  return accounts.find((acc) => acc.id === id);
}

function shouldExecute(dateStr) {
  if (!dateStr) return true;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr <= today;
}

function updateBalances(accounts, debitAcc, creditAcc, amount) {
  const debit = findAccount(accounts, debitAcc);
  const credit = findAccount(accounts, creditAcc);
  debit.balance -= amount;
  credit.balance += amount;
}

async function paymentInstructions({ accounts, instruction }) {
  console.log('Accounts received:', accounts);
  console.log('Instruction:', instruction);
  const parsed = parseInstruction(instruction);
  console.log('Parsed:', parsed);
  if (parsed.error) {
    return {
      type:
        parsed.error === 'SY03' || parsed.error === 'DT01' || parsed.error === 'AM01'
          ? null
          : parsed.type || null,
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

  const { debit_account, credit_account, currency, amount } = parsed;

  // find accounts
  const debitAcc = findAccount(accounts, debit_account);
  const creditAcc = findAccount(accounts, credit_account);

  if (!debitAcc || !creditAcc) {
    return {
      type: parsed.type,
      amount,
      currency,
      debit_account,
      credit_account,
      execute_by: parsed.execute_by,
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
      type: parsed.type,
      amount,
      currency,
      debit_account,
      credit_account,
      execute_by: parsed.execute_by,
      status: 'failed',
      status_reason: 'Account currency mismatch',
      status_code: 'CU01',
      accounts: [debitAcc, creditAcc].sort((a, b) => accounts.indexOf(a) - accounts.indexOf(b)),
    };
  }

  if (debitAcc.balance < amount) {
    return {
      type: parsed.type,
      amount,
      currency,
      debit_account,
      credit_account,
      execute_by: parsed.execute_by,
      status: 'failed',
      status_reason: `Insufficient funds in account ${debitAcc.id}: has ${debitAcc.balance} ${currency}, needs ${amount} ${currency}`,
      status_code: 'AC01',
      accounts: [debitAcc, creditAcc].sort((a, b) => accounts.indexOf(a) - accounts.indexOf(b)),
    };
  }

  if (debit_account === credit_account) {
    return {
      type: parsed.type,
      amount,
      currency,
      debit_account,
      credit_account,
      execute_by: parsed.execute_by,
      status: 'failed',
      status_reason: 'Debit and credit accounts cannot be the same',
      status_code: 'AC02',
      accounts: [debitAcc],
    };
  }

  // check date
  const execute = shouldExecute(parsed.execute_by);

  let status;
  let status_code;
  let status_reason;
  let updatedAccounts;

  if (execute) {
    updateBalances(accounts, debit_account, credit_account, amount);
    status = 'successful';
    status_code = 'AP00';
    status_reason = 'Transaction executed successfully';
  } else {
    status = 'pending';
    status_code = 'AP02';
    status_reason = 'Transaction scheduled for future execution';
  }

  updatedAccounts = [debitAcc, creditAcc]
    .sort((a, b) => accounts.indexOf(a) - accounts.indexOf(b))
    .map((acc) => ({
      id: acc.id,
      balance: acc.balance,
      balance_before: acc.balance_before || acc.balance + (status === 'successful' ? amount : 0),
      currency: acc.currency.toUpperCase(),
    }));

  return {
    type: parsed.type,
    amount,
    currency,
    debit_account,
    credit_account,
    execute_by: parsed.execute_by,
    status,
    status_reason,
    status_code,
    accounts: updatedAccounts,
  };
}

module.exports = paymentInstructions;
