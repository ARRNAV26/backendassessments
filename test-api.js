const axios = require('axios');

async function testEndpoint() {
  console.log('=== Testing Failed Operation ===');
  // Test failed operation first
  try {
    const response = await axios.post('http://localhost:3000/payment-instructions', {
      accounts: [{ id: 'a', balance: 500, currency: 'USD' }],
      instruction: 'DEBIT 100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT xyz'
    });

    console.log('Response:', response.data);
    console.log('HTTP Status:', response.status);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    console.log('HTTP Status:', error.response?.status);
  }

  console.log('\n=== Testing Successful Operation ===');
  // Test successful operation
  try {
    const response2 = await axios.post('http://localhost:3000/payment-instructions', {
      accounts: [
        { id: 'a', balance: 500, currency: 'USD' },
        { id: 'b', balance: 100, currency: 'USD' }
      ],
      instruction: 'DEBIT 100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b'
    });

    console.log('Response:', response2.data);
    console.log('HTTP Status:', response2.status);
  } catch (error2) {
    console.error('Error:', error2.response?.data || error2.message);
    console.log('HTTP Status:', error2.response?.status);
  }
}

testEndpoint();
