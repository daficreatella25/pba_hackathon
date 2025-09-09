export interface AuctionRoom {
  id: number;
  name: string;
  participants: number;
  status: 'live' | 'upcoming' | 'ended';
  startTime: Date;
  endTime: Date;
  startBid: number;
  minimumIncrement: number;
  currentBid: number;
  highestBidder: string;
}

export interface AuctionItem {
  id: number;
  currentBid: number;
  highestBidder: string;
  minimumIncrement: number;
  bids: Array<{
    bidder: string;
    amount: number;
    timestamp: Date;
  }>;
}

export interface CreateRoomForm {
  name: string;
  startTime: string;
  endTime: string;
  startBid: string;
  minimumIncrement: string;
}