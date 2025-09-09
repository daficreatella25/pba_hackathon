'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatEther, parseEther } from 'viem';
import { useViemWeb3 } from '@/contexts/ViemWeb3Context';
import { AuctionRoom } from '@/types/auction';
import { AuctionFactoryABI, AuctionABI, AUCTION_FACTORY_ADDRESS } from '@/contracts/ABIs';

export function useViemAuctions() {
  const { publicClient, walletClient, account, switchToPaseoNetwork } = useViemWeb3();
  const [auctions, setAuctions] = useState<AuctionRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  const fetchAuctions = useCallback(async () => {
    if (!publicClient) {
      console.log('No publicClient available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching auctions from factory:', AUCTION_FACTORY_ADDRESS);

      // Get all auction addresses using publicClient directly
      const auctionAddresses = await publicClient.readContract({
        address: AUCTION_FACTORY_ADDRESS as `0x${string}`,
        abi: AuctionFactoryABI,
        functionName: 'getAllAuctions',
      });
      console.log('Raw auction addresses from contract:', auctionAddresses);
      const auctionData: AuctionRoom[] = [];

      for (const address of auctionAddresses as `0x${string}`[]) {
        try {
          // Fetch auction data in parallel using publicClient directly
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
            publicClient.readContract({ address: address as `0x${string}`, abi: AuctionABI, functionName: 'seller' }),
            publicClient.readContract({ address: address as `0x${string}`, abi: AuctionABI, functionName: 'startPrice' }),
            publicClient.readContract({ address: address as `0x${string}`, abi: AuctionABI, functionName: 'minIncrement' }),
            publicClient.readContract({ address: address as `0x${string}`, abi: AuctionABI, functionName: 'startTime' }),
            publicClient.readContract({ address: address as `0x${string}`, abi: AuctionABI, functionName: 'endTime' }),
            publicClient.readContract({ address: address as `0x${string}`, abi: AuctionABI, functionName: 'highestBidder' }),
            publicClient.readContract({ address: address as `0x${string}`, abi: AuctionABI, functionName: 'highestBid' }),
            publicClient.readContract({ address: address as `0x${string}`, abi: AuctionABI, functionName: 'finalized' })
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
            startBid: parseFloat(formatEther(startPrice as bigint)),
            minimumIncrement: parseFloat(formatEther(minIncrement as bigint)),
            currentBid: parseFloat(formatEther((highestBid ? highestBid : startPrice) as bigint)),
            highestBidder: highestBidder !== '0x0000000000000000000000000000000000000000' ? (highestBidder as string) : 'None',
            finalized: finalized as boolean
          };

          auctionData.push(auction);
        } catch (contractError) {
          console.error(`Error fetching auction ${address}:`, contractError);
        }
      }

      console.log('Processed auction data:', auctionData);
      setAuctions(auctionData);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('Error fetching auctions:', err);
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
    if (!walletClient || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const startTimeUnix = Math.floor(new Date(startTime).getTime() / 1000);
      const endTimeUnix = Math.floor(new Date(endTime).getTime() / 1000);

      console.log('Creating auction with params:', {
        startPrice: parseEther(startPrice).toString(),
        startTimeUnix,
        endTimeUnix,
        minIncrement: parseEther(minIncrement).toString(),
        account
      });

      // Try to estimate gas first
      try {
        if (!publicClient) throw new Error('Public client not available');
        
        const gasEstimate = await publicClient.estimateContractGas({
          address: AUCTION_FACTORY_ADDRESS as `0x${string}`,
          abi: AuctionFactoryABI,
          functionName: 'createAuction',
          args: [
            parseEther(startPrice),
            startTimeUnix,
            endTimeUnix,
            parseEther(minIncrement)
          ],
          account: account as `0x${string}`
        });
        
        console.log('Gas estimate:', gasEstimate.toString());
      } catch (gasError) {
        console.warn('Gas estimation failed:', gasError);
      }

      // Call createAuction function using walletClient directly
      const hash = await walletClient.writeContract({
        address: AUCTION_FACTORY_ADDRESS as `0x${string}`,
        abi: AuctionFactoryABI,
        functionName: 'createAuction',
        args: [
          parseEther(startPrice),
          startTimeUnix,
          endTimeUnix,
          parseEther(minIncrement)
        ],
        account: account as `0x${string}`,
        chain: undefined
      });

      // Wait for transaction receipt
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Parse logs to find the AuctionCreated event
      for (const log of receipt.logs) {
        try {
          if (log.address.toLowerCase() === AUCTION_FACTORY_ADDRESS.toLowerCase()) {
            // This is from our factory contract
            console.log('✅ Auction created successfully, refreshing list...');
            await fetchAuctions();
            return log.data; // Contains the auction address
          }
        } catch {
          continue;
        }
      }

      console.log('✅ Auction transaction completed, refreshing list...');
      await fetchAuctions(); // Refresh anyway
      return receipt.transactionHash; // Return transaction hash instead
    } catch (err: any) {
      console.error('Create auction error:', err);
      
      // Check for circuit breaker error
      if (err.message?.includes('circuit breaker is open')) {
        throw new Error('Network is currently congested. Please try again in a few minutes or increase gas fee.');
      }
      
      // Check if it's a network mismatch error
      if (err.message?.includes('does not match the target chain') || 
          err.message?.includes('chain mismatch') ||
          err.code === 4902) {
        try {
          console.log('Network mismatch detected, switching to Paseo PassetHub...');
          await switchToPaseoNetwork();
          // Retry auction creation after network switch
          return await createAuction(startPrice, startTime, endTime, minIncrement);
        } catch {
          throw new Error('Please switch to Paseo PassetHub network to create auctions');
        }
      }
      
      // Check for gas estimation errors
      if (err.message?.includes('gas') || err.message?.includes('out of gas')) {
        throw new Error('Transaction may fail due to insufficient gas. Try increasing gas limit or fee.');
      }
      
      throw new Error(err instanceof Error ? err.message : 'Failed to create auction');
    }
  };

  // Initial fetch when publicClient becomes available
  useEffect(() => {
    console.log('useViemAuctions useEffect triggered, publicClient:', !!publicClient);
    if (publicClient) {
      fetchAuctions();
    }
  }, [fetchAuctions]);

  // Periodic polling for real-time updates
  useEffect(() => {
    if (!publicClient) return;

    console.log('🔄 Setting up real-time auction polling...');
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for auction updates...');
      fetchAuctions();
    }, 15000); // Poll every 15 seconds

    return () => {
      console.log('🛑 Clearing auction polling interval');
      clearInterval(pollInterval);
    };
  }, [publicClient, fetchAuctions]);

  const refreshAuctions = useCallback(() => {
    console.log('🔄 Manual auction refresh triggered');
    fetchAuctions();
  }, [fetchAuctions]);

  return {
    auctions,
    loading,
    error,
    lastRefresh,
    fetchAuctions,
    refreshAuctions,
    createAuction
  };
}