# 🏛️ Decentralized Auction Platform

A modern, decentralized auction platform built on Polkadot's Paseo PassetHub testnet. This project enables users to create, participate in, and manage smart contract-based auctions with real-time bidding and automated settlement.

## ✨ Features

### 🎯 Core Functionality
- **Smart Contract Auctions**: Deploy individual auction contracts via factory pattern
- **Real-time Bidding**: Live auction updates with automatic bid validation
- **Wallet Integration**: Seamless MetaMask connection with network switching
- **Auction Management**: Create, monitor, and finalize auctions
- **Bid History**: Track all bidding activity and transaction history

### 🔧 Technical Features
- **Factory Pattern**: Modular auction deployment system
- **Reentrancy Protection**: Secure smart contract implementation
- **Automatic Refunds**: Previous bidders are refunded immediately
- **Gas Optimization**: Efficient contract design for cost-effective transactions
- **Real-time Polling**: Live updates every 10-15 seconds
- **Error Handling**: Comprehensive error management and user feedback

## 🏗️ Architecture

### Smart Contracts
- **AuctionFactory.sol**: Factory contract for deploying individual auctions
- **Auction.sol**: Individual auction contract with bidding logic
- **ReentrancyGuard**: Security protection against reentrancy attacks

### Frontend Stack
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Viem**: Ethereum library for wallet integration
- **React Hooks**: Custom hooks for contract interaction

## 🚀 Getting Started


### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pba_hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Network Setup

1. **Add Paseo PassetHub to MetaMask**
   - Network Name: `Paseo PassetHub`
   - RPC URL: `https://testnet-passet-hub-eth-rpc.polkadot.io`
   - Chain ID: `421656902` (0x190f1b46)
   - Currency Symbol: `PAS`
   - Block Explorer: (Optional)

2. **Get Test Tokens**
   - Visit the Paseo testnet faucet to get PAS tokens
   - Ensure you have enough tokens for gas fees and bidding

## 📱 Usage

### Creating an Auction
1. Connect your MetaMask wallet
2. Click "Create Room" button
3. Fill in auction details:
   - Auction name
   - Start time
   - End time
   - Starting bid amount
   - Minimum bid increment
4. Submit transaction and wait for confirmation

### Participating in Auctions
1. Browse available auctions on the main page
2. Click "Enter Room" to join an auction
3. View real-time auction details
4. Place bids by entering amount and clicking "Place Bid"
5. Monitor auction progress and bid history

### Finalizing Auctions
- When auction ends, the highest bidder can finalize
- Finalization transfers payment to seller
- Auction status updates to "Finalized"

## 🔧 Smart Contract Details

### Auction Contract Functions
- `bid()`: Place a bid (must be higher than current + minimum increment)
- `finalize()`: Complete auction and transfer funds to seller
- `cancel()`: Cancel auction before it starts (seller only)
- `extendAuction()`: Extend auction duration (seller only)

### Factory Contract Functions
- `createAuction()`: Deploy new auction contract
- `getAllAuctions()`: Get all deployed auction addresses
- `getAuctionsBySeller()`: Get auctions created by specific seller

### Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Input Validation**: Comprehensive parameter validation
- **Automatic Refunds**: Previous bidders refunded immediately
- **Time-based Controls**: Auction start/end time enforcement

## 🛠️ Development

### Project Structure
```
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── pages/            # Page components
│   ├── BiddingPanel.tsx  # Auction bidding interface
│   └── BidHistory.tsx    # Bid history display
├── contracts/            # Smart contracts
│   ├── Auction.sol       # Individual auction contract
│   ├── AuctionFactory.sol # Factory contract
│   └── ABIs.ts          # Contract ABIs
├── contexts/             # React contexts
│   └── ViemWeb3Context.tsx # Web3 wallet context
├── hooks/                # Custom React hooks
│   ├── useViemAuctions.ts      # Auction management
│   └── useViemAuctionDetails.ts # Individual auction details
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint


## 🔍 Research and Development Process

### Initial Approach
- Started with single smart contract approach
- Found limitations in scalability and management

### Evolution
- Implemented factory pattern for modular auction deployment
- Added Viem for better wallet integration
- Developed real-time polling for live updates

### Challenges Encountered
- **Polkadot Deployment**: More complex than standard EVM chains
- **Bytecode Format**: Different output format for PVM (Polkadot Virtual Machine)
- **Network Integration**: Required custom chain configuration

### Technical Decisions
- **Solidity Language**: Chosen for familiarity and EVM compatibility
- **Factory Pattern**: Enables scalable auction management
- **Viem Library**: Modern alternative to ethers.js with better TypeScript support
- **Real-time Polling**: Ensures live updates without WebSocket complexity

## 🚧 Future Enhancements

### Planned Features
- [ ] Bid history with transaction links
- [ ] Auction categories and filtering
- [ ] Advanced auction types (Dutch, sealed bid)
- [ ] Mobile app development
- [ ] Multi-token support
- [ ] Auction analytics dashboard
- [ ] Social features (comments, sharing)

### Technical Improvements
- [ ] WebSocket integration for real-time updates
- [ ] Gas optimization improvements
- [ ] Enhanced error handling
- [ ] Automated testing suite
- [ ] Performance monitoring


**Note**: This project is built for the Polkadot Builders Academy Hackathon and is currently deployed on the Paseo PassetHub testnet. Always verify contract addresses and network settings before use.