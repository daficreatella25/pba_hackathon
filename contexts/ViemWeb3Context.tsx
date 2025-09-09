'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createWalletClient, 
  createPublicClient, 
  custom, 
  http, 
  getContract,
  formatEther,
  parseEther,
  Chain
} from 'viem';
import { AuctionFactoryABI, AuctionABI, AUCTION_FACTORY_ADDRESS } from '@/contracts/ABIs';

// Define Paseo PassetHub chain
const paseoPassetHub: Chain = {
  id: 0x190f1b46, // 421,656,902 in decimal
  name: 'Paseo PassetHub',
  nativeCurrency: {
    decimals: 18,
    name: 'PAS',
    symbol: 'PAS',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-passet-hub-eth-rpc.polkadot.io'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: '' },
  },
  testnet: true,
};

interface ViemWeb3ContextType {
  account: `0x${string}` | null;
  walletClient: any | null;
  publicClient: any | null;
  isConnecting: boolean;
  error: string | null;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToPaseoNetwork: () => Promise<void>;
}

const ViemWeb3Context = createContext<ViemWeb3ContextType | undefined>(undefined);

interface ViemWeb3ProviderProps {
  children: ReactNode;
}

export function ViemWeb3Provider({ children }: ViemWeb3ProviderProps) {
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [walletClient, setWalletClient] = useState<any | null>(null);
  const [publicClient, setPublicClient] = useState<any | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this app.');
      }

      // Create wallet client
      const wallet = createWalletClient({
        chain: paseoPassetHub,
        transport: custom(window.ethereum)
      });

      // Request account access
      const [address] = await wallet.requestAddresses();
      
      // Check if we're on the correct network
      const chainId = await wallet.getChainId();
      const isCorrect = chainId === paseoPassetHub.id;
      
      setIsCorrectNetwork(isCorrect);

      if (isCorrect) {
        // Create public client for reading
        const publicClient = createPublicClient({
          chain: paseoPassetHub,
          transport: http()
        });

        setPublicClient(publicClient);
      }

      setAccount(address);
      setWalletClient(wallet);

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0] as `0x${string}`);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWalletClient(null);
    setPublicClient(null);
    setIsCorrectNetwork(false);
    setError(null);
  };

  const switchToPaseoNetwork = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${paseoPassetHub.id.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If the network is not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${paseoPassetHub.id.toString(16)}`,
              chainName: paseoPassetHub.name,
              rpcUrls: [paseoPassetHub.rpcUrls.default.http[0]],
              nativeCurrency: paseoPassetHub.nativeCurrency,
              blockExplorerUrls: [],
            }],
          });
        } catch (addError) {
          throw new Error('Failed to add Paseo PassetHub network');
        }
      } else {
        throw new Error('Failed to switch to Paseo PassetHub network');
      }
    }
  };

  // Auto-connect if wallet was previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (err) {
          console.log('Auto-connect failed:', err);
        }
      }
    };

    autoConnect();
  }, []);

  const value: ViemWeb3ContextType = {
    account,
    walletClient,
    publicClient,
    isConnecting,
    error,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToPaseoNetwork
  };

  return (
    <ViemWeb3Context.Provider value={value}>
      {children}
    </ViemWeb3Context.Provider>
  );
}

export function useViemWeb3() {
  const context = useContext(ViemWeb3Context);
  if (context === undefined) {
    throw new Error('useViemWeb3 must be used within a ViemWeb3Provider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}