const currencies = ['NGN', 'USD', 'GBP', 'GHS'];

function validateCurrency(curr) {
  return currencies.includes(curr);
}

module.exports = { currencies, validateCurrency };
