const { debitGrammar, creditGrammar } = require('./grammar');
const { isPositiveIntegerString } = require('../validator/amount');
const { isValidAccountId } = require('../validator/accounts');

function fail(code, message) {
  return { ok: false, error: code, message };
}

function parseByGrammar(tokens, grammar) {
  const parsed = {};
  let idx = 0;
  for (let i = 0; i < grammar.length; i++) {
    // eslint-disable-line no-restricted-syntax
    const rule = grammar[i];
    const token = tokens[idx];

    switch (rule.type) {
      case 'LITERAL':
        if (!token || token.toUpperCase() !== rule.value)
          return fail('SY02', `Expected ${rule.value}`);
        idx++;
        break;

      case 'AMOUNT':
        if (!isPositiveIntegerString(token)) return fail('AM01', 'Invalid amount');
        parsed.amount = Number(token);
        idx++;
        break;

      case 'CURRENCY':
        parsed.currency = token.toUpperCase();
        idx++;
        break;

      case 'ACCOUNT_ID':
        if (!isValidAccountId(token)) return fail('AC04', 'Invalid account ID');
        parsed[rule.role] = token;
        idx++;
        break;

      case 'OPTIONAL_DATE':
        if (tokens[idx] === 'ON') {
          if (!tokens[idx + 1]) return fail('DT01', 'Invalid date');
          const dateParam = tokens[idx + 1];
          const parts = dateParam.split('-');
          if (
            parts.length !== 3 ||
            parts[0].length !== 4 ||
            Number.isNaN(parts[0]) ||
            parts[0] !== parseInt(parts[0], 10) ||
            parts[1].length !== 2 ||
            Number.isNaN(parts[1]) ||
            parts[1] !== parseInt(parts[1], 10) ||
            parts[2].length !== 2 ||
            Number.isNaN(parts[2]) ||
            parts[2] !== parseInt(parts[2], 10)
          ) {
            return fail('DT01', 'Invalid date format');
          }
          parsed.execute_by = dateParam;
          idx += 2;
        }
        break;

      default:
        throw new Error('Unknown grammar rule');
    }
  }
  // Check if extra tokens
  if (idx < tokens.length) return fail('SY02', 'Unexpected extra tokens');
  return { ok: true, parsed };
}

function parseInstruction(instruction) {
  const tokens = require('./tokenizer')(instruction); // eslint-disable-line global-require
  if (tokens.length < 8) {
    return { error: 'SY03', message: 'Malformed instruction: unable to parse keywords' };
  }
  const typeLower = tokens[0].toLowerCase();
  if (typeLower === 'debit') {
    const result = parseByGrammar(tokens, debitGrammar);
    if (!result.ok) return { error: result.error, message: result.message };
    result.parsed.type = 'debit';
    return result.parsed;
  }
  if (typeLower === 'credit') {
    const result = parseByGrammar(tokens, creditGrammar);
    if (!result.ok) return { error: result.error, message: result.message };
    result.parsed.type = 'credit';
    return result.parsed;
  }
  return { error: 'SY03', message: 'Malformed instruction: unknown type' };
}

module.exports = parseInstruction;
