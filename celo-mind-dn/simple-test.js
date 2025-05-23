// Simple test without dotenv
const secretKey = "f_aGFwHNYdjc-uBssOcCUBvA8KZuLPTUR_C43ISBP9GcJlb0YjuK3pYHf3oicZTKWrQG-0jVzXzr0SXd68gpdQ";

async function testNebula() {
  console.log('🧪 Testing Nebula API...');
  
  const requestBody = {
    message: 'What is the MNT balance for address 0xc095c7cA2B56b0F0DC572d5d4A9Eb1B37f4306a0 on Mantle network?',
    context_filter: {
      chains: [{ id: 5000, name: 'mantle' }],
      wallet_addresses: ['0xc095c7cA2B56b0F0DC572d5d4A9Eb1B37f4306a0'],
    },
    execute_config: {
      mode: 'client',
      signer_wallet_address: '0xc095c7cA2B56b0F0DC572d5d4A9Eb1B37f4306a0',
    },
    stream: false,
  };
  
  try {
    const response = await fetch('https://nebula-api.thirdweb.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': secretKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success!', data);
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
  } catch (err) {
    console.log('❌ Network error:', err.message);
  }
}

testNebula(); 