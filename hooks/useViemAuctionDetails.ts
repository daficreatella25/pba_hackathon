'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatEther, parseEther, getContract } from 'viem';
import { useViemWeb3 } from '@/contexts/ViemWeb3Context';
import { AuctionItem } from '@/types/auction';
import { AuctionABI } from '@/contracts/ABIs';

export function useViemAuctionDetails(auctionAddress: string) {
  const { publicClient, walletClient, account, switchToPaseoNetwork } = useViemWeb3();
  const [auctionData, setAuctionData] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctionDetails = useCallback(async () => {
    if (!publicClient || !auctionAddress) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch auction details using publicClient directly
      const [
        highestBid,
        highestBidder,
        minIncrement,
        minNextBid,
        timeLeft,
        finalized
      ] = await Promise.all([
        publicClient.readContract({ address: auctionAddress as `0x${string}`, abi: AuctionABI, functionName: 'highestBid' }),
        publicClient.readContract({ address: auctionAddress as `0x${string}`, abi: AuctionABI, functionName: 'highestBidder' }),
        publicClient.readContract({ address: auctionAddress as `0x${string}`, abi: AuctionABI, functionName: 'minIncrement' }),
        publicClient.readContract({ address: auctionAddress as `0x${string}`, abi: AuctionABI, functionName: 'minNextBid' }),
        publicClient.readContract({ address: auctionAddress as `0x${string}`, abi: AuctionABI, functionName: 'timeLeft' }),
        publicClient.readContract({ address: auctionAddress as `0x${string}`, abi: AuctionABI, functionName: 'finalized' })
      ]);

      // Get bid events (simplified - you might want to implement proper event filtering)
      const bids: Array<{
        bidder: string;
        amount: number;
        timestamp: Date;
        txHash?: string;
      }> = []; // For now, we'll show empty bids - you can implement event querying later

      const auction: AuctionItem = {
        id: auctionAddress,
        currentBid: parseFloat(formatEther(highestBid)),
        highestBidder: highestBidder !== '0x0000000000000000000000000000000000000000' ? highestBidder as string : 'None',
        minimumIncrement: parseFloat(formatEther(minIncrement)),
        minNextBid: parseFloat(formatEther(minNextBid)),
        timeLeft: Number(timeLeft),
        finalized: finalized as boolean,
        bids
      };

      setAuctionData(auction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch auction details');
    } finally {
      setLoading(false);
    }
  }, [publicClient, auctionAddress]);

  // Auto-refresh auction details periodically for real-time updates
  useEffect(() => {
    if (!auctionAddress || !publicClient) return;

    console.log('🔄 Setting up real-time auction details polling...');
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for auction detail updates...');
      fetchAuctionDetails();
    }, 10000); // Poll every 10 seconds for individual auction

    return () => {
      console.log('🛑 Clearing auction details polling interval');
      clearInterval(pollInterval);
    };
  }, [auctionAddress, publicClient, fetchAuctionDetails]);

  const placeBid = async (bidAmount: string): Promise<boolean> => {
    if (!account || !walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      // Place bid using walletClient directly
      const hash = await walletClient.writeContract({
        address: auctionAddress as `0x${string}`,
        abi: AuctionABI,
        functionName: 'bid',
        account: account as `0x${string}`,
        value: parseEther(bidAmount)
      });

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refresh auction data
      await fetchAuctionDetails();
      return true;
    } catch (err: any) {
      // Check if it's a network mismatch error
      if (err.message?.includes('does not match the target chain') || 
          err.message?.includes('chain mismatch') ||
          err.code === 4902) {
        try {
          console.log('Network mismatch detected, switching to Paseo PassetHub...');
          await switchToPaseoNetwork();
          // Retry the bid after network switch
          return await placeBid(bidAmount);
        } catch (switchError) {
          throw new Error('Please switch to Paseo PassetHub network to place bids');
        }
      }
      throw new Error(err instanceof Error ? err.message : 'Failed to place bid');
    }
  };

  const finalizeAuction = async (): Promise<boolean> => {
    if (!account || !walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      // Finalize auction using walletClient directly
      const hash = await walletClient.writeContract({
        address: auctionAddress as `0x${string}`,
        abi: AuctionABI,
        functionName: 'finalize',
        account: account as `0x${string}`
      });
      
      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refresh auction data
      await fetchAuctionDetails();
      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to finalize auction');
    }
  };

  useEffect(() => {
    if (auctionAddress && publicClient) {
      fetchAuctionDetails();
    }
  }, [fetchAuctionDetails]);

  return {
    auctionData,
    loading,
    error,
    fetchAuctionDetails,
    placeBid,
    finalizeAuction
  };
}