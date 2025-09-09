'use client';

import { useState } from 'react';
import { AuctionRoom, AuctionItem, CreateRoomForm } from '@/types/auction';
import { useAuctions } from '@/hooks/useAuctions';
import { useWeb3 } from '@/contexts/Web3Context';
import EthersNetworkSelector from '@/components/EthersNetworkSelector';
import RoomsList from '@/components/pages/RoomsList';
import CreateRoom from '@/components/pages/CreateRoom';
import AuctionRoomPage from '@/components/pages/AuctionRoom';

export default function Home() {
  const [currentView, setCurrentView] = useState<'rooms' | 'auction' | 'create'>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const { isCorrectNetwork, account } = useWeb3();
  const { auctions, loading, error, createAuction } = useAuctions();

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
    if (!account || !isCorrectNetwork) {
      alert('Please connect your wallet and switch to Paseo PassetHub network');
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
        alert('Auction created successfully!');
        exitCreateRoom();
      } else {
        alert('Failed to create auction - no address returned');
      }
    } catch (err) {
      alert(`Failed to create auction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (currentView === 'rooms') {
    return (
      <div>
        <EthersNetworkSelector />
        <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                📚 This page uses <strong>Ethers.js</strong> for Web3 interactions
              </p>
            </div>
            <a 
              href="/viem-page"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-sm"
            >
              Try Viem Version
            </a>
          </div>
        </div>
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
        />
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <div>
        <EthersNetworkSelector />
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
        <EthersNetworkSelector />
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
