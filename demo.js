// Demo script to test all payment instruction features
const paymentInstructionsService = require('./services/payment/payment-instructions');

async function runDemo() {
  console.log('🚀 Payment Instructions API Demo\n');
  console.log('='.repeat(50));

  // Test Case 1: Successful DEBIT transaction
  console.log('\n📋 Test Case 1: DEBIT format (successful)');
  console.log('Input: DEBIT 500 USD FROM ACCOUNT N90394 FOR CREDIT TO ACCOUNT N9122');
  const accounts1 = [
    { id: 'N90394', balance: 1000, currency: 'USD' },
    { id: 'N9122', balance: 500, currency: 'USD' },
  ];
  const result1 = await paymentInstructionsService({
    accounts: accounts1,
    instruction: 'DEBIT 500 USD FROM ACCOUNT N90394 FOR CREDIT TO ACCOUNT N9122',
  });
  console.log('Output:', JSON.stringify(result1, null, 2));

  // Test Case 2: CREDIT format (successful)
  console.log('\n🤑 Test Case 2: CREDIT format (successful)');
  console.log('Input: CREDIT 300 NGN TO ACCOUNT acc-002 FOR DEBIT FROM ACCOUNT acc-001');
  const accounts2 = [
    { id: 'acc-001', balance: 1000, currency: 'NGN' },
    { id: 'acc-002', balance: 500, currency: 'NGN' },
  ];
  const result2 = await paymentInstructionsService({
    accounts: accounts2,
    instruction: 'CREDIT 300 NGN TO ACCOUNT acc-002 FOR DEBIT FROM ACCOUNT acc-001',
  });
  console.log('Output:', JSON.stringify(result2, null, 2));

  // Test Case 3: Case insensitive keywords
  console.log('\n🔤 Test Case 3: Case insensitive keywords');
  console.log('Input: debit 100 gbp from account a for credit to account b');
  const accounts3 = [
    { id: 'a', balance: 500, currency: 'GBP' },
    { id: 'b', balance: 200, currency: 'GBP' },
  ];
  const result3 = await paymentInstructionsService({
    accounts: accounts3,
    instruction: 'debit 100 gbp from account a for credit to account b',
  });
  console.log('Output:', JSON.stringify(result3, null, 2));

  // Test Case 4: Future date (pending)
  console.log('\n📅 Test Case 4: Future date (pending)');
  console.log(
    'Input: CREDIT 300 NGN TO ACCOUNT acc-002 FOR DEBIT FROM ACCOUNT acc-001 ON 2026-12-31'
  );
  const accounts4 = [
    { id: 'acc-001', balance: 1000, currency: 'NGN' },
    { id: 'acc-002', balance: 500, currency: 'NGN' },
  ];
  const result4 = await paymentInstructionsService({
    accounts: accounts4,
    instruction: 'CREDIT 300 NGN TO ACCOUNT acc-002 FOR DEBIT FROM ACCOUNT acc-001 ON 2026-12-31',
  });
  console.log('Output:', JSON.stringify(result4, null, 2));

  // Test Case 5: Currency mismatch
  console.log('\n💱 Test Case 5: Currency mismatch (CU01)');
  console.log('Input: DEBIT 50 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b');
  const accounts5 = [
    { id: 'a', balance: 100, currency: 'USD' },
    { id: 'b', balance: 500, currency: 'GBP' },
  ];
  const result5 = await paymentInstructionsService({
    accounts: accounts5,
    instruction: 'DEBIT 50 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b',
  });
  console.log('Output:', JSON.stringify(result5, null, 2));

  // Test Case 6: Insufficient funds
  console.log('\n💸 Test Case 6: Insufficient funds (AC01)');
  console.log('Input: DEBIT 500 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b');
  const accounts6 = [
    { id: 'a', balance: 100, currency: 'USD' },
    { id: 'b', balance: 500, currency: 'USD' },
  ];
  const result6 = await paymentInstructionsService({
    accounts: accounts6,
    instruction: 'DEBIT 500 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b',
  });
  console.log('Output:', JSON.stringify(result6, null, 2));

  // Test Case 7: Unsupported currency
  console.log('\n❌ Test Case 7: Unsupported currency (CU02)');
  console.log('Input: DEBIT 50 EUR FROM ACCOUNT a FOR CREDIT TO ACCOUNT b');
  const accounts7 = [
    { id: 'a', balance: 100, currency: 'EUR' },
    { id: 'b', balance: 500, currency: 'EUR' },
  ];
  const result7 = await paymentInstructionsService({
    accounts: accounts7,
    instruction: 'DEBIT 50 EUR FROM ACCOUNT a FOR CREDIT TO ACCOUNT b',
  });
  console.log('Output:', JSON.stringify(result7, null, 2));

  // Test Case 8: Same account
  console.log('\n🚫 Test Case 8: Same debit and credit account (AC02)');
  console.log('Input: DEBIT 100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT a');
  const accounts8 = [{ id: 'a', balance: 500, currency: 'USD' }];
  const result8 = await paymentInstructionsService({
    accounts: accounts8,
    instruction: 'DEBIT 100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT a',
  });
  console.log('Output:', JSON.stringify(result8, null, 2));

  // Test Case 9: Negative amount
  console.log('\n🧮 Test Case 9: Negative amount (AM01)');
  console.log('Input: DEBIT -100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b');
  const accounts9 = [
    { id: 'a', balance: 500, currency: 'USD' },
    { id: 'b', balance: 200, currency: 'USD' },
  ];
  const result9 = await paymentInstructionsService({
    accounts: accounts9,
    instruction: 'DEBIT -100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b',
  });
  console.log('Output:', JSON.stringify(result9, null, 2));

  // Test Case 10: Account not found
  console.log('\n🔍 Test Case 10: Account not found (AC03)');
  console.log('Input: DEBIT 100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT xyz');
  const accounts10 = [{ id: 'a', balance: 500, currency: 'USD' }];
  const result10 = await paymentInstructionsService({
    accounts: accounts10,
    instruction: 'DEBIT 100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT xyz',
  });
  console.log('Output:', JSON.stringify(result10, null, 2));

  // Test Case 11: Decimal amount
  console.log('\n🔢 Test Case 11: Decimal amount (AM01)');
  console.log('Input: DEBIT 100.50 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b');
  const accounts11 = [
    { id: 'a', balance: 500, currency: 'USD' },
    { id: 'b', balance: 200, currency: 'USD' },
  ];
  const result11 = await paymentInstructionsService({
    accounts: accounts11,
    instruction: 'DEBIT 100.50 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b',
  });
  console.log('Output:', JSON.stringify(result11, null, 2));

  // Test Case 12: Malformed instruction
  console.log('\n⚠️  Test Case 12: Malformed instruction (SY01)');
  console.log('Input: SEND 100 USD TO ACCOUNT b');
  const accounts12 = [
    { id: 'a', balance: 500, currency: 'USD' },
    { id: 'b', balance: 200, currency: 'USD' },
  ];
  const result12 = await paymentInstructionsService({
    accounts: accounts12,
    instruction: 'SEND 100 USD TO ACCOUNT b',
  });
  console.log('Output:', JSON.stringify(result12, null, 2));

  // Test Case 13: Invalid keyword order
  console.log('\n📝 Test Case 13: Invalid keyword order (SY02)');
  console.log('Input: DEBIT 100 USD TO ACCOUNT b FROM ACCOUNT a');
  const accounts13 = [
    { id: 'a', balance: 500, currency: 'USD' },
    { id: 'b', balance: 200, currency: 'USD' },
  ];
  const result13 = await paymentInstructionsService({
    accounts: accounts13,
    instruction: 'DEBIT 100 USD TO ACCOUNT b FROM ACCOUNT a',
  });
  console.log('Output:', JSON.stringify(result13, null, 2));

  // Test Case 14: Invalid account ID format
  console.log('\n🆔 Test Case 14: Invalid account ID format (AC04)');
  console.log('Input: DEBIT 100 USD FROM ACCOUNT a_invalid FOR CREDIT TO ACCOUNT b');
  const accounts14 = [
    { id: 'a_invalid', balance: 500, currency: 'USD' },
    { id: 'b', balance: 200, currency: 'USD' },
  ];
  const result14 = await paymentInstructionsService({
    accounts: accounts14,
    instruction: 'DEBIT 100 USD FROM ACCOUNT a_invalid FOR CREDIT TO ACCOUNT b',
  });
  console.log('Output:', JSON.stringify(result14, null, 2));

  console.log('\n🎉 Demo Complete!');
  console.log('='.repeat(50));
}

runDemo().catch(console.error);
