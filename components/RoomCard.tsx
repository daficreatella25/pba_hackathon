import { AuctionRoom } from '@/types/auction';
import { formatTimeRemaining } from '@/utils/time';

interface RoomCardProps {
  room: AuctionRoom;
  onEnterRoom: (roomId: number) => void;
}

export default function RoomCard({ room, onEnterRoom }: RoomCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-4xl">🏛️</div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              room.status === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              room.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {room.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {room.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Participants:</span>
            <span className="font-medium">{room.participants}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Start Bid:</span>
            <span className="font-medium">{room.startBid} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Current Bid:</span>
            <span className="font-medium text-green-600">{room.currentBid} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Min Increment:</span>
            <span className="font-medium">{room.minimumIncrement} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time Left:</span>
            <span className="font-medium text-red-600">{formatTimeRemaining(room.endTime)}</span>
          </div>
        </div>

        <button
          onClick={() => onEnterRoom(room.id)}
          disabled={room.status === 'ended'}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {room.status === 'live' ? 'Join Room' : room.status === 'upcoming' ? 'View Room' : 'Room Ended'}
        </button>
      </div>
    </div>
  );
}