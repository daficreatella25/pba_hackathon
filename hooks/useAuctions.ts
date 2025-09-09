'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatEther, parseEther } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { AuctionRoom, AuctionItem, ContractAuctionData } from '@/types/auction';

export function useAuctions() {
  const { provider, factoryContract, getAuctionContract, account } = useWeb3();
  const [auctions, setAuctions] = useState<AuctionRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = useCallback(async () => {
    if (!factoryContract || !provider) return;

    try {
      setLoading(true);
      setError(null);

      const auctionAddresses = await factoryContract.getAllAuctions();
      const auctionData: AuctionRoom[] = [];

      for (const address of auctionAddresses) {
        const auctionContract = getAuctionContract(address);
        if (!auctionContract) continue;

        try {
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
            auctionContract.seller(),
            auctionContract.startPrice(),
            auctionContract.minIncrement(),
            auctionContract.startTime(),
            auctionContract.endTime(),
            auctionContract.highestBidder(),
            auctionContract.highestBid(),
            auctionContract.finalized()
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
            seller,
            participants: highestBidder !== '0x0000000000000000000000000000000000000000' ? 1 : 0,
            status,
            startTime: new Date(startTimeNum * 1000),
            endTime: new Date(endTimeNum * 1000),
            startBid: parseFloat(formatEther(startPrice)),
            minimumIncrement: parseFloat(formatEther(minIncrement)),
            currentBid: parseFloat(formatEther(highestBid || startPrice)),
            highestBidder: highestBidder !== '0x0000000000000000000000000000000000000000' ? highestBidder : 'None',
            finalized
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
  }, [factoryContract, provider, getAuctionContract]);

  const createAuction = async (
    startPrice: string,
    startTime: string,
    endTime: string,
    minIncrement: string
  ): Promise<string | null> => {
    if (!factoryContract || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const startTimeUnix = Math.floor(new Date(startTime).getTime() / 1000);
      const endTimeUnix = Math.floor(new Date(endTime).getTime() / 1000);

      const tx = await factoryContract.createAuction(
        parseEther(startPrice),
        startTimeUnix,
        endTimeUnix,
        parseEther(minIncrement)
      );

      const receipt = await tx.wait();
      
      // Get the auction address from the event
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === factoryContract.interface.getEvent('AuctionCreated').topicHash
      );
      
      if (event) {
        const decoded = factoryContract.interface.parseLog(event);
        const auctionAddress = decoded.args.auction;
        await fetchAuctions(); // Refresh the list
        return auctionAddress;
      }
      
      return null;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create auction');
    }
  };

  useEffect(() => {
    if (factoryContract) {
      fetchAuctions();
    }
  }, [fetchAuctions]);

  return {
    auctions,
    loading,
    error,
    fetchAuctions,
    createAuction
  };
}