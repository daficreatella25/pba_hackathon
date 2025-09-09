// Debug script to test contract interaction
// Run with: node debug-contract.js

const { createPublicClient, http } = require('viem');

const paseoPassetHub = {
  id: 0x190f1b46,
  name: 'Paseo PassetHub',
  nativeCurrency: { decimals: 18, name: 'PAS', symbol: 'PAS' },
  rpcUrls: { default: { http: ['https://testnet-passet-hub-eth-rpc.polkadot.io'] }},
  testnet: true,
};

const FACTORY_ADDRESS = "0xcc2390c7087b57cdd73514dcac9c25d0742fe7d3";

async function checkNetwork() {
  try {
    const client = createPublicClient({
      chain: paseoPassetHub,
      transport: http()
    });

    console.log('🔍 Checking network status...');
    
    // Check if we can connect
    const blockNumber = await client.getBlockNumber();
    console.log('✅ Latest block:', blockNumber.toString());
    
    // Check gas price
    const gasPrice = await client.getGasPrice();
    console.log('⛽ Current gas price:', gasPrice.toString(), 'wei');
    
    // Try to get contract code
    const code = await client.getBytecode({ address: FACTORY_ADDRESS });
    console.log('📜 Contract exists:', code ? 'Yes' : 'No');
    
    if (code) {
      console.log('📏 Contract size:', code.length, 'bytes');
    }
    
  } catch (error) {
    console.error('❌ Network check failed:', error.message);
  }
}

checkNetwork();