'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatEther, parseEther } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { AuctionItem } from '@/types/auction';

export function useAuctionDetails(auctionAddress: string) {
  const { provider, getAuctionContract, account } = useWeb3();
  const [auctionData, setAuctionData] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctionDetails = useCallback(async () => {
    if (!provider || !auctionAddress) return;

    const auctionContract = getAuctionContract(auctionAddress);
    if (!auctionContract) return;

    try {
      setLoading(true);
      setError(null);

      const [
        highestBid,
        highestBidder,
        minIncrement,
        minNextBid,
        timeLeft,
        finalized
      ] = await Promise.all([
        auctionContract.highestBid(),
        auctionContract.highestBidder(),
        auctionContract.minIncrement(),
        auctionContract.minNextBid(),
        auctionContract.timeLeft(),
        auctionContract.finalized()
      ]);

      // Get bid events
      const bidEvents = await auctionContract.queryFilter('BidPlaced', 0, 'latest');
      const bids = bidEvents.map((event) => ({
        bidder: event.args.bidder,
        amount: parseFloat(formatEther(event.args.amount)),
        timestamp: new Date(Date.now()), // You might want to get actual block timestamp
        txHash: event.transactionHash
      })).reverse(); // Most recent first

      const auction: AuctionItem = {
        id: auctionAddress,
        currentBid: parseFloat(formatEther(highestBid)),
        highestBidder: highestBidder !== '0x0000000000000000000000000000000000000000' ? highestBidder : 'None',
        minimumIncrement: parseFloat(formatEther(minIncrement)),
        minNextBid: parseFloat(formatEther(minNextBid)),
        timeLeft: Number(timeLeft),
        finalized,
        bids
      };

      setAuctionData(auction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch auction details');
    } finally {
      setLoading(false);
    }
  }, [provider, auctionAddress, getAuctionContract]);

  const placeBid = async (bidAmount: string): Promise<boolean> => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    const auctionContract = getAuctionContract(auctionAddress);
    if (!auctionContract) {
      throw new Error('Auction contract not found');
    }

    try {
      const signer = await provider?.getSigner();
      const auctionWithSigner = auctionContract.connect(signer!);

      const tx = await auctionWithSigner.bid({
        value: parseEther(bidAmount)
      });

      await tx.wait();
      await fetchAuctionDetails(); // Refresh data
      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to place bid');
    }
  };

  const finalizeAuction = async (): Promise<boolean> => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    const auctionContract = getAuctionContract(auctionAddress);
    if (!auctionContract) {
      throw new Error('Auction contract not found');
    }

    try {
      const signer = await provider?.getSigner();
      const auctionWithSigner = auctionContract.connect(signer!);

      const tx = await auctionWithSigner.finalize();
      await tx.wait();
      await fetchAuctionDetails(); // Refresh data
      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to finalize auction');
    }
  };

  useEffect(() => {
    if (auctionAddress) {
      fetchAuctionDetails();
    }
  }, [fetchAuctionDetails]);

  // Set up event listeners
  useEffect(() => {
    if (!provider || !auctionAddress) return;

    const auctionContract = getAuctionContract(auctionAddress);
    if (!auctionContract) return;

    const handleBidPlaced = () => {
      fetchAuctionDetails();
    };

    const handleFinalized = () => {
      fetchAuctionDetails();
    };

    auctionContract.on('BidPlaced', handleBidPlaced);
    auctionContract.on('Finalized', handleFinalized);

    return () => {
      auctionContract.off('BidPlaced', handleBidPlaced);
      auctionContract.off('Finalized', handleFinalized);
    };
  }, [provider, auctionAddress, getAuctionContract, fetchAuctionDetails]);

  return {
    auctionData,
    loading,
    error,
    fetchAuctionDetails,
    placeBid,
    finalizeAuction
  };
}