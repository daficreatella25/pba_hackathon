'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatEther, parseEther, getContract } from 'viem';
import { useViemWeb3 } from '@/contexts/ViemWeb3Context';
import { AuctionRoom } from '@/types/auction';
import { AuctionFactoryABI, AuctionABI, AUCTION_FACTORY_ADDRESS } from '@/contracts/ABIs';

export function useViemAuctions() {
  const { publicClient, walletClient, account, isCorrectNetwork } = useViemWeb3();
  const [auctions, setAuctions] = useState<AuctionRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = useCallback(async () => {
    if (!publicClient) return;

    try {
      setLoading(true);
      setError(null);

      // Create factory contract instance
      const factoryContract = getContract({
        address: AUCTION_FACTORY_ADDRESS as `0x${string}`,
        abi: AuctionFactoryABI,
        client: publicClient
      });

      // Get all auction addresses
      const auctionAddresses = await factoryContract.read.getAllAuctions();
      const auctionData: AuctionRoom[] = [];

      for (const address of auctionAddresses) {
        try {
          // Create auction contract instance
          const auctionContract = getContract({
            address: address as `0x${string}`,
            abi: AuctionABI,
            client: publicClient
          });

          // Fetch auction data in parallel
          const [
            seller,
            startPrice,
            minIncrement,
            startTime,
            endTime,
            highestBidder,
            highestBid,
            finalized
          ] = await Promise.all([
            auctionContract.read.seller(),
            auctionContract.read.startPrice(),
            auctionContract.read.minIncrement(),
            auctionContract.read.startTime(),
            auctionContract.read.endTime(),
            auctionContract.read.highestBidder(),
            auctionContract.read.highestBid(),
            auctionContract.read.finalized()
          ]);

          const now = Math.floor(Date.now() / 1000);
          const startTimeNum = Number(startTime);
          const endTimeNum = Number(endTime);

          let status: 'live' | 'upcoming' | 'ended' | 'finalized' = 'upcoming';
          if (finalized) {
            status = 'finalized';
          } else if (now >= endTimeNum) {
            status = 'ended';
          } else if (now >= startTimeNum) {
            status = 'live';
          }

          const auction: AuctionRoom = {
            id: address,
            name: `Auction ${address.slice(0, 8)}...`,
            seller: seller as string,
            participants: highestBidder !== '0x0000000000000000000000000000000000000000' ? 1 : 0,
            status,
            startTime: new Date(startTimeNum * 1000),
            endTime: new Date(endTimeNum * 1000),
            startBid: parseFloat(formatEther(startPrice)),
            minimumIncrement: parseFloat(formatEther(minIncrement)),
            currentBid: parseFloat(formatEther(highestBid || startPrice)),
            highestBidder: highestBidder !== '0x0000000000000000000000000000000000000000' ? highestBidder as string : 'None',
            finalized: finalized as boolean
          };

          auctionData.push(auction);
        } catch (contractError) {
          console.error(`Error fetching auction ${address}:`, contractError);
        }
      }

      setAuctions(auctionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch auctions');
    } finally {
      setLoading(false);
    }
  }, [publicClient]);

  const createAuction = async (
    startPrice: string,
    startTime: string,
    endTime: string,
    minIncrement: string
  ): Promise<string | null> => {
    if (!walletClient || !account || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }

    try {
      const startTimeUnix = Math.floor(new Date(startTime).getTime() / 1000);
      const endTimeUnix = Math.floor(new Date(endTime).getTime() / 1000);

      // Create factory contract instance with wallet client
      const factoryContract = getContract({
        address: AUCTION_FACTORY_ADDRESS as `0x${string}`,
        abi: AuctionFactoryABI,
        client: walletClient
      });

      // Call createAuction function
      const hash = await factoryContract.write.createAuction(
        [
          parseEther(startPrice),
          startTimeUnix,
          endTimeUnix,
          parseEther(minIncrement)
        ],
        {
          account: account as `0x${string}`
        }
      );

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Parse logs to find the AuctionCreated event
      for (const log of receipt.logs) {
        try {
          if (log.address.toLowerCase() === AUCTION_FACTORY_ADDRESS.toLowerCase()) {
            // This is from our factory contract
            await fetchAuctions();
            return log.data; // Contains the auction address
          }
        } catch {
          continue;
        }
      }

      await fetchAuctions(); // Refresh anyway
      return null;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create auction');
    }
  };

  useEffect(() => {
    if (publicClient && isCorrectNetwork) {
      fetchAuctions();
    }
  }, [fetchAuctions, isCorrectNetwork]);

  return {
    auctions,
    loading,
    error,
    fetchAuctions,
    createAuction
  };
}