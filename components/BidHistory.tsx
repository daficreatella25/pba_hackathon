interface Bid {
  bidder: string;
  amount: number;
  timestamp: Date;
}

interface BidHistoryProps {
  bids: Bid[];
}

export default function BidHistory({ bids }: BidHistoryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bid History</h3>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
        <div className="space-y-3">
          {bids.map((bid, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{bid.bidder}</p>
                <p className="text-sm text-gray-500">{bid.timestamp.toLocaleTimeString()}</p>
              </div>
              <span className="font-bold text-green-600">{bid.amount} ETH</span>
            </div>
          ))}
          {bids.length === 0 && (
            <p className="text-gray-500 text-center py-4">No bids yet</p>
          )}
        </div>
      </div>
    </div>
  );
}