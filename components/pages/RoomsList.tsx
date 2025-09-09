import { AuctionRoom } from '@/types/auction';
import RoomCard from '@/components/RoomCard';

interface RoomsListProps {
  rooms: AuctionRoom[];
  onEnterRoom: (roomId: string) => void;
  onCreateRoom: () => void;
}

export default function RoomsList({ rooms, onEnterRoom, onCreateRoom }: RoomsListProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Auction Rooms
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Choose a room to join and start bidding
          </p>
          <button
            onClick={onCreateRoom}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            + Create New Auction Room
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard 
              key={room.id} 
              room={room} 
              onEnterRoom={onEnterRoom}
            />
          ))}
        </div>
      </div>
    </div>
  );
}