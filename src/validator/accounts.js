function isValidAccountId(accountId) {
  if (!accountId || accountId.length === 0) return false;
  const allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-@';
  return accountId.split('').every((char) => allowedChars.indexOf(char) !== -1);
}

function validateAccountId(accountId) {
  return isValidAccountId(accountId);
}

module.exports = { isValidAccountId, validateAccountId };
