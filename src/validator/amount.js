function isPositiveIntegerString(str) {
  if (!str) return false;
  const num = Number(str);
  return Number.isInteger(num) && num > 0 && str === num.toString();
}

function validateAmount(amount) {
  return typeof amount === 'number' && amount > 0 && Number.isInteger(amount);
}

module.exports = { isPositiveIntegerString, validateAmount };
