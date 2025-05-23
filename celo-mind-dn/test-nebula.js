const dotenv = require('dotenv');
dotenv.config();

async function testNebulaAPI() {
  const secretKey = process.env.YOUR_THIRDWEB_SECRET_KEY;
  
  if (!secretKey) {
    console.log('❌ YOUR_THIRDWEB_SECRET_KEY not found in environment');
    return;
  }
  
  console.log('🔑 Secret key found:', secretKey.substring(0, 10) + '...');
  
  try {
    // Test the exact format from thirdweb documentation
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
    
    console.log('📤 Sending request:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://nebula-api.thirdweb.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': secretKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Nebula API is working!');
    console.log('📝 Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.log('❌ Error calling Nebula API:', error.message);
    console.log('🔍 Full error:', error);
  }
}

testNebulaAPI(); 