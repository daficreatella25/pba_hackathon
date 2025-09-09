'use client';

import { useState } from 'react';
import { useViemWeb3 } from '@/contexts/ViemWeb3Context';
import { parseEther } from 'viem';
import { AUCTION_FACTORY_ADDRESS, AuctionFactoryABI } from '@/contracts/ABIs';

export default function ContractTest() {
  const { publicClient, walletClient, account } = useViemWeb3();
  const [result, setResult] = useState<string>('');

  const testContractCall = async () => {
    if (!publicClient) {
      setResult('❌ Public client not available');
      return;
    }

    try {
      setResult('🔍 Testing contract...');
      
      // Test 1: Try to get all auctions (read call)
      const auctions = await publicClient.readContract({
        address: AUCTION_FACTORY_ADDRESS as `0x${string}`,
        abi: AuctionFactoryABI,
        functionName: 'getAllAuctions',
      });
      
      setResult(`✅ Read test passed! Found ${auctions.length} auctions`);
      
      // Test 2: Try gas estimation for creating auction
      if (!walletClient || !account) {
        setResult(prev => prev + '\n⚠️ No wallet connected - skipping write test');
        return;
      }
      
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 300; // 5 minutes from now
      const endTime = startTime + 3600; // 1 hour duration
      
      const gasEstimate = await publicClient.estimateContractGas({
        address: AUCTION_FACTORY_ADDRESS as `0x${string}`,
        abi: AuctionFactoryABI,
        functionName: 'createAuction',
        args: [
          parseEther('0.01'), // 0.01 PAS start price
          startTime,
          endTime,
          parseEther('0.001') // 0.001 PAS minimum increment
        ],
        account: account as `0x${string}`
      });
      
      setResult(prev => prev + `\n✅ Gas estimation passed! Estimated: ${gasEstimate.toString()}`);
      
    } catch (error: any) {
      setResult(`❌ Test failed: ${error.message}`);
      console.error('Contract test error:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Contract Connectivity Test</h3>
      
      <button
        onClick={testContractCall}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test Contract
      </button>
      
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded text-sm whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}