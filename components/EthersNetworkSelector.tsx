'use client';

import { useWeb3 } from '@/contexts/Web3Context';
import { PASEO_PASSETHUB_CONFIG } from '@/contracts/ABIs';

export default function NetworkSelector() {
  const { account, chainId, isCorrectNetwork, switchToPaseoNetwork, connectWallet, error } = useWeb3();

  console.log(account, chainId)

  if (!account) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Connect Your Wallet
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Connect your wallet to interact with auctions on Paseo PassetHub
            </p>
          </div>
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
          >
            Connect Wallet
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-200">
              Wrong Network
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Please switch to Paseo PassetHub network to use this application
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Current: {chainId} | Required: {PASEO_PASSETHUB_CONFIG.chainId}
            </p>
          </div>
          <button
            onClick={switchToPaseoNetwork}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
          >
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-green-800 dark:text-green-200">
            Connected to Paseo PassetHub
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Wallet: {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
            {PASEO_PASSETHUB_CONFIG.nativeCurrency.symbol}
          </span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}