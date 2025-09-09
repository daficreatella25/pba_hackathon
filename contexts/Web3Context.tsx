'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { AuctionFactoryABI, AuctionABI, AUCTION_FACTORY_ADDRESS, PASEO_PASSETHUB_CONFIG } from '@/contracts/ABIs';

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  factoryContract: Contract | null;
  isConnecting: boolean;
  error: string | null;
  chainId: string | null;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToPaseoNetwork: () => Promise<void>;
  getAuctionContract: (address: string) => Contract | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [factoryContract, setFactoryContract] = useState<Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this app.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      
      // Check current network
      const network = await browserProvider.getNetwork();
      const currentChainId = `0x${network.chainId.toString(16).toUpperCase()}`;
      const isCorrect = currentChainId === PASEO_PASSETHUB_CONFIG.chainId;
      
      setChainId(currentChainId);
      setIsCorrectNetwork(isCorrect);
      
      if (isCorrect) {
        const signer = await browserProvider.getSigner();
        const factory = new Contract(
          AUCTION_FACTORY_ADDRESS,
          AuctionFactoryABI,
          signer
        );
        setFactoryContract(factory);
      }

      setAccount(accounts[0]);
      setProvider(browserProvider);

      // Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(newAccounts[0]);
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
    setProvider(null);
    setFactoryContract(null);
    setChainId(null);
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
        params: [{ chainId: PASEO_PASSETHUB_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // If the network is not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [PASEO_PASSETHUB_CONFIG],
          });
        } catch (addError) {
          throw new Error('Failed to add Paseo PassetHub network');
        }
      } else {
        throw new Error('Failed to switch to Paseo PassetHub network');
      }
    }
  };

  const getAuctionContract = (address: string): Contract | null => {
    if (!provider) return null;
    
    try {
      return new Contract(address, AuctionABI, provider);
    } catch (err) {
      console.error('Failed to create auction contract:', err);
      return null;
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

  const value: Web3ContextType = {
    account,
    provider,
    factoryContract,
    isConnecting,
    error,
    chainId,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToPaseoNetwork,
    getAuctionContract
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}