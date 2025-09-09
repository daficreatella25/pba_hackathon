import { useState } from 'react';
import { AuctionRoom, AuctionItem } from '@/types/auction';
import { formatTimeRemaining } from '@/utils/time';

interface BiddingPanelProps {
  room: AuctionRoom;
  currentItem: AuctionItem;
  onPlaceBid: (amount: number) => void;
  canBid?: boolean;
}

export default function BiddingPanel({ room, currentItem, onPlaceBid, canBid = true }: BiddingPanelProps) {
  const [newBid, setNewBid] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bidAmount = parseFloat(newBid || '0');
    const minimumBid = currentItem.currentBid + currentItem.minimumIncrement;
    
    if (bidAmount < minimumBid) {
      alert(`Bid must be at least ${minimumBid.toFixed(3)} PAS (current bid + minimum increment of ${currentItem.minimumIncrement} PAS)`);
      return;
    }

    onPlaceBid(bidAmount);
    setNewBid('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Auction Details</h3>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Start Bid:</span>
          <span className="font-medium">{room.startBid} PAS</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Current Bid:</span>
          <span className="text-2xl font-bold text-green-600">{currentItem.currentBid} PAS</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Minimum Increment:</span>
          <span className="font-medium">{currentItem.minimumIncrement} PAS</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Highest Bidder:</span>
          <span className="font-medium">{currentItem.highestBidder}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Time Remaining:</span>
          <span className="font-medium text-red-600">{formatTimeRemaining(room.endTime)}</span>
        </div>
      </div>

      {canBid ? (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Place Your Bid</h4>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="number"
              step="0.001"
              min={(currentItem.currentBid + currentItem.minimumIncrement)}
              placeholder={`Min: ${(currentItem.currentBid + currentItem.minimumIncrement).toFixed(3)} PAS`}
              value={newBid}
              onChange={(e) => setNewBid(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              Place Bid
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Connect your wallet to place bids
          </p>
        </div>
      )}
    </div>
  );
}