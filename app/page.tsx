'use client';

import { useState } from 'react';
import { CreateRoomForm } from '@/types/auction';
import { useViemAuctions } from '@/hooks/useViemAuctions';
import { useViemWeb3 } from '@/contexts/ViemWeb3Context';
import NetworkSelector from '@/components/NetworkSelector';
import RoomsList from '@/components/pages/RoomsList';
import CreateRoom from '@/components/pages/CreateRoom';
import AuctionRoomPage from '@/components/pages/AuctionRoom';

export default function Home() {
  const [currentView, setCurrentView] = useState<'rooms' | 'auction' | 'create'>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const { account } = useViemWeb3();
  const { auctions, loading, error, lastRefresh, refreshAuctions, createAuction } = useViemAuctions();

  const enterRoom = (roomId: string) => {
    setSelectedRoom(roomId);
    setCurrentView('auction');
  };

  const exitRoom = () => {
    setCurrentView('rooms');
    setSelectedRoom(null);
  };

  const goToCreateRoom = () => {
    setCurrentView('create');
  };

  const exitCreateRoom = () => {
    setCurrentView('rooms');
  };

  const handleCreateRoom = async (form: CreateRoomForm) => {
    if (!account) {
      return;
    }

    try {
      const auctionAddress = await createAuction(
        form.startBid,
        form.startTime,
        form.endTime,
        form.minimumIncrement
      );
      
      if (auctionAddress) {
        exitCreateRoom();
      }
    } catch (err) {
      console.error('Failed to create auction:', err);
    }
  };

  if (currentView === 'rooms') {
    return (
      <div>
        <NetworkSelector />
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Loading auctions...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        )}
        <RoomsList 
          rooms={auctions}
          onEnterRoom={enterRoom}
          onCreateRoom={goToCreateRoom}
          canCreate={!!account}
          lastRefresh={lastRefresh}
          onRefresh={refreshAuctions}
        />
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <div>
        <NetworkSelector />
        <CreateRoom 
          onCreateRoom={handleCreateRoom}
          onBack={exitCreateRoom}
        />
      </div>
    );
  }

  const room = auctions.find(r => r.id === selectedRoom);

  if (selectedRoom && room) {
    return (
      <div>
        <NetworkSelector />
        <AuctionRoomPage 
          room={room}
          auctionAddress={selectedRoom}
          onBack={exitRoom}
        />
      </div>
    );
  }

  return (
    <div>
      <NetworkSelector />
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}