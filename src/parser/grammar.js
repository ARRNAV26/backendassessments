const debitGrammar = [
  { type: 'LITERAL', value: 'DEBIT' },
  { type: 'AMOUNT' },
  { type: 'CURRENCY' },
  { type: 'LITERAL', value: 'FROM' },
  { type: 'LITERAL', value: 'ACCOUNT' },
  { type: 'ACCOUNT_ID', role: 'debit_account' },
  { type: 'LITERAL', value: 'FOR' },
  { type: 'LITERAL', value: 'CREDIT' },
  { type: 'LITERAL', value: 'TO' },
  { type: 'LITERAL', value: 'ACCOUNT' },
  { type: 'ACCOUNT_ID', role: 'credit_account' },
  { type: 'OPTIONAL_DATE' },
];

const creditGrammar = [
  { type: 'LITERAL', value: 'CREDIT' },
  { type: 'AMOUNT' },
  { type: 'CURRENCY' },
  { type: 'LITERAL', value: 'TO' },
  { type: 'LITERAL', value: 'ACCOUNT' },
  { type: 'ACCOUNT_ID', role: 'credit_account' },
  { type: 'LITERAL', value: 'FOR' },
  { type: 'LITERAL', value: 'DEBIT' },
  { type: 'LITERAL', value: 'FROM' },
  { type: 'LITERAL', value: 'ACCOUNT' },
  { type: 'ACCOUNT_ID', role: 'debit_account' },
  { type: 'OPTIONAL_DATE' },
];

module.exports = { debitGrammar, creditGrammar };
