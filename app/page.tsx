'use client';

import { useState } from 'react';
import { AuctionRoom, AuctionItem, CreateRoomForm } from '@/types/auction';
import { dummyRooms, roomItems } from '@/data/dummyData';
import RoomsList from '@/components/pages/RoomsList';
import CreateRoom from '@/components/pages/CreateRoom';
import AuctionRoomPage from '@/components/pages/AuctionRoom';

export default function Home() {
  const [currentView, setCurrentView] = useState<'rooms' | 'auction' | 'create'>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [rooms, setRooms] = useState<AuctionRoom[]>(dummyRooms);

  const enterRoom = (roomId: number) => {
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

  const handleCreateRoom = (form: CreateRoomForm) => {
    const startTime = new Date(form.startTime);
    const endTime = new Date(form.endTime);
    const now = new Date();

    const newRoomId = Math.max(...rooms.map(r => r.id)) + 1;
    const startBid = parseFloat(form.startBid);
    const minimumIncrement = parseFloat(form.minimumIncrement);

    const status: 'live' | 'upcoming' | 'ended' = 
      startTime <= now && endTime > now ? 'live' :
      startTime > now ? 'upcoming' : 'ended';

    const newRoom: AuctionRoom = {
      id: newRoomId,
      name: form.name,
      participants: 0,
      status: status,
      startTime: startTime,
      endTime: endTime,
      startBid: startBid,
      minimumIncrement: minimumIncrement,
      currentBid: startBid,
      highestBidder: "None"
    };

    const newItem: AuctionItem = {
      id: newRoomId * 10 + 1,
      currentBid: startBid,
      highestBidder: "None",
      minimumIncrement: minimumIncrement,
      bids: []
    };

    setRooms(prev => [...prev, newRoom]);
    roomItems[newRoomId] = [newItem];
    
    alert('Auction room created successfully!');
    exitCreateRoom();
  };

  const handlePlaceBid = (amount: number) => {
    const currentItem = selectedRoom ? roomItems[selectedRoom]?.[0] : null;
    
    if (!currentItem || !selectedRoom) {
      alert('Room not found');
      return;
    }

    if (roomItems[selectedRoom]) {
      roomItems[selectedRoom][0] = {
        ...currentItem,
        currentBid: amount,
        highestBidder: "You",
        bids: [
          { bidder: "You", amount: amount, timestamp: new Date() },
          ...currentItem.bids
        ]
      };

      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === selectedRoom
            ? { 
                ...room, 
                currentBid: amount, 
                highestBidder: "You" 
              }
            : room
        )
      );
    }
  };

  if (currentView === 'rooms') {
    return (
      <RoomsList 
        rooms={rooms}
        onEnterRoom={enterRoom}
        onCreateRoom={goToCreateRoom}
      />
    );
  }

  if (currentView === 'create') {
    return (
      <CreateRoom 
        onCreateRoom={handleCreateRoom}
        onBack={exitCreateRoom}
      />
    );
  }

  const room = rooms.find(r => r.id === selectedRoom);
  const currentItem = selectedRoom ? roomItems[selectedRoom]?.[0] : null;

  if (room && currentItem) {
    return (
      <AuctionRoomPage 
        room={room}
        currentItem={currentItem}
        onPlaceBid={handlePlaceBid}
        onBack={exitRoom}
      />
    );
  }

  return <div>Loading...</div>;
}
