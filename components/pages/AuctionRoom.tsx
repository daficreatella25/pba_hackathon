import { AuctionRoom as AuctionRoomType, AuctionItem } from '@/types/auction';
import { formatTimeRemaining } from '@/utils/time';
import BiddingPanel from '@/components/BiddingPanel';
import BidHistory from '@/components/BidHistory';

interface AuctionRoomProps {
  room: AuctionRoomType;
  currentItem: AuctionItem;
  onPlaceBid: (amount: number) => void;
  onBack: () => void;
}

export default function AuctionRoom({ room, currentItem, onPlaceBid, onBack }: AuctionRoomProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Rooms
          </button>
          <header className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {room.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {room.participants} participants • {formatTimeRemaining(room.endTime)} remaining
            </p>
          </header>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">🏛️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {room.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Smart Contract Auction
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <BiddingPanel 
                room={room} 
                currentItem={currentItem} 
                onPlaceBid={onPlaceBid}
              />
              <BidHistory bids={currentItem.bids} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}