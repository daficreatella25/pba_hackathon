import { AuctionRoom, AuctionItem } from '@/types/auction';

export const dummyRooms: AuctionRoom[] = [
  {
    id: 1,
    name: "Vintage Watch Auction",
    participants: 12,
    status: 'live',
    startTime: new Date(Date.now() - 30 * 60 * 1000),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    startBid: 0.3,
    minimumIncrement: 0.05,
    currentBid: 0.5,
    highestBidder: "0x1234...5678"
  },
  {
    id: 2,
    name: "Digital Art NFT",
    participants: 8,
    status: 'live',
    startTime: new Date(Date.now() - 60 * 60 * 1000),
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    startBid: 1.0,
    minimumIncrement: 0.1,
    currentBid: 1.2,
    highestBidder: "0x9876...5432"
  },
  {
    id: 3,
    name: "Gaming Console",
    participants: 15,
    status: 'live',
    startTime: new Date(Date.now() - 45 * 60 * 1000),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    startBid: 0.5,
    minimumIncrement: 0.05,
    currentBid: 0.8,
    highestBidder: "0xabcd...efgh"
  },
  {
    id: 4,
    name: "Diamond Jewelry",
    participants: 5,
    status: 'upcoming',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
    startBid: 2.0,
    minimumIncrement: 0.2,
    currentBid: 2.0,
    highestBidder: "None"
  }
];

export const roomItems: { [key: number]: AuctionItem[] } = {
  1: [
    {
      id: 11,
      currentBid: 0.5,
      highestBidder: "0x1234...5678",
      minimumIncrement: 0.05,
      bids: [
        { bidder: "0x1234...5678", amount: 0.5, timestamp: new Date(Date.now() - 10 * 60 * 1000) },
        { bidder: "0x5678...9012", amount: 0.3, timestamp: new Date(Date.now() - 20 * 60 * 1000) }
      ]
    }
  ],
  2: [
    {
      id: 21,
      currentBid: 1.2,
      highestBidder: "0x9876...5432",
      minimumIncrement: 0.1,
      bids: [
        { bidder: "0x9876...5432", amount: 1.2, timestamp: new Date(Date.now() - 5 * 60 * 1000) },
        { bidder: "0x2468...1357", amount: 1.0, timestamp: new Date(Date.now() - 15 * 60 * 1000) }
      ]
    }
  ],
  3: [
    {
      id: 31,
      currentBid: 0.8,
      highestBidder: "0xabcd...efgh",
      minimumIncrement: 0.05,
      bids: [
        { bidder: "0xabcd...efgh", amount: 0.8, timestamp: new Date(Date.now() - 3 * 60 * 1000) },
        { bidder: "0xgame...r123", amount: 0.6, timestamp: new Date(Date.now() - 12 * 60 * 1000) }
      ]
    }
  ]
};