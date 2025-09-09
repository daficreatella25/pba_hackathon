export interface AuctionRoom {
  id: string; // Contract address
  name: string;
  seller: string;
  participants: number;
  status: 'live' | 'upcoming' | 'ended' | 'finalized';
  startTime: Date;
  endTime: Date;
  startBid: number;
  minimumIncrement: number;
  currentBid: number;
  highestBidder: string;
  finalized: boolean;
}

export interface AuctionItem {
  id: string; // Contract address
  currentBid: number;
  highestBidder: string;
  minimumIncrement: number;
  minNextBid: number;
  timeLeft: number;
  finalized: boolean;
  bids: Array<{
    bidder: string;
    amount: number;
    timestamp: Date;
    txHash?: string;
  }>;
}

export interface CreateRoomForm {
  name: string;
  startTime: string;
  endTime: string;
  startBid: string;
  minimumIncrement: string;
}

export interface ContractAuctionData {
  seller: string;
  startPrice: bigint;
  minIncrement: bigint;
  startTime: bigint;
  endTime: bigint;
  highestBidder: string;
  highestBid: bigint;
  finalized: boolean;
}