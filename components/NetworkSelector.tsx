'use client';

import { useViemWeb3 } from '@/contexts/ViemWeb3Context';

export default function NetworkSelector() {
  const { account, connectWallet } = useViemWeb3();

  if (!account) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Connect Your Wallet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Connect your wallet to interact with auctions
            </p>
          </div>
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-blue-800 dark:text-blue-200">
            Wallet Connected
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}