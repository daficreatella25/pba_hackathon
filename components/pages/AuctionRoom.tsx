import { AuctionRoom as AuctionRoomType } from '@/types/auction';
import { formatTimeRemaining } from '@/utils/time';
import { useViemAuctionDetails } from '@/hooks/useViemAuctionDetails';
import { useViemWeb3 } from '@/contexts/ViemWeb3Context';
import BiddingPanel from '@/components/BiddingPanel';
import BidHistory from '@/components/BidHistory';

interface AuctionRoomProps {
  room: AuctionRoomType;
  auctionAddress: string;
  onBack: () => void;
}

export default function AuctionRoom({ room, auctionAddress, onBack }: AuctionRoomProps) {
  const { account } = useViemWeb3();
  const { auctionData, loading, error, placeBid, finalizeAuction } = useViemAuctionDetails(auctionAddress);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading auction details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Rooms
          </button>
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!auctionData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Auction not found</p>
      </div>
    );
  }

  const handlePlaceBid = async (amount: number) => {
    try {
      await placeBid(amount.toString());
    } catch (err) {
      console.error('Failed to place bid:', err);
    }
  };

  const handleFinalize = async () => {
    try {
      await finalizeAuction();
    } catch (err) {
      console.error('Failed to finalize auction:', err);
    }
  };
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
            {/* <p className="text-gray-600 dark:text-gray-300 mb-4">
              {room.} participants • {formatTimeRemaining(room.endTime)} remaining
            </p> */}
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

            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              <BiddingPanel 
                room={room} 
                currentItem={auctionData} 
                onPlaceBid={handlePlaceBid}
                onFinalize={handleFinalize}
                canBid={!!account}
                userAccount={account ?? undefined}
              />
              {/* <BidHistory bids={auctionData.bids} /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}