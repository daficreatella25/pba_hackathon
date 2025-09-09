'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatEther, parseEther, getContract } from 'viem';
import { useViemWeb3 } from '@/contexts/ViemWeb3Context';
import { AuctionItem } from '@/types/auction';
import { AuctionABI } from '@/contracts/ABIs';

export function useViemAuctionDetails(auctionAddress: string) {
  const { publicClient, walletClient, account, isCorrectNetwork } = useViemWeb3();
  const [auctionData, setAuctionData] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctionDetails = useCallback(async () => {
    if (!publicClient || !auctionAddress) return;

    try {
      setLoading(true);
      setError(null);

      // Create auction contract instance
      const auctionContract = getContract({
        address: auctionAddress as `0x${string}`,
        abi: AuctionABI,
        client: publicClient
      });

      const [
        highestBid,
        highestBidder,
        minIncrement,
        minNextBid,
        timeLeft,
        finalized
      ] = await Promise.all([
        auctionContract.read.highestBid(),
        auctionContract.read.highestBidder(),
        auctionContract.read.minIncrement(),
        auctionContract.read.minNextBid(),
        auctionContract.read.timeLeft(),
        auctionContract.read.finalized()
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

  const placeBid = async (bidAmount: string): Promise<boolean> => {
    if (!account || !walletClient || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }

    try {
      // Create auction contract instance with wallet client
      const auctionContract = getContract({
        address: auctionAddress as `0x${string}`,
        abi: AuctionABI,
        client: walletClient
      });

      // Place bid
      const hash = await auctionContract.write.bid(
        [],
        {
          account: account as `0x${string}`,
          value: parseEther(bidAmount)
        }
      );

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refresh auction data
      await fetchAuctionDetails();
      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to place bid');
    }
  };

  const finalizeAuction = async (): Promise<boolean> => {
    if (!account || !walletClient || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }

    try {
      // Create auction contract instance with wallet client
      const auctionContract = getContract({
        address: auctionAddress as `0x${string}`,
        abi: AuctionABI,
        client: walletClient
      });

      // Finalize auction
      const hash = await auctionContract.write.finalize(
        [],
        {
          account: account as `0x${string}`
        }
      );
      
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