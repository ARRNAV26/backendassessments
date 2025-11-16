function updateBalances(accounts, debitAccountId, creditAccountId, amount) {
  const debit = accounts.find((acc) => acc.id === debitAccountId);
  const credit = accounts.find((acc) => acc.id === creditAccountId);
  debit.balance -= amount;
  credit.balance += amount;
  return [debit, credit];
}

function executeTransaction(accounts, debitAccountId, creditAccountId, amount) {
  const updated = updateBalances(accounts, debitAccountId, creditAccountId, amount);
  return {
    status: 'successful',
    status_code: 'AP00',
    status_reason: 'Transaction executed successfully',
    updatedAccounts: updated,
  };
}

module.exports = { executeTransaction, updateBalances };
