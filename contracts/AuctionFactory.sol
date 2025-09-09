// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

abstract contract ReentrancyGuard {
    uint256 private constant _ENTERED = 2;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrant() {
        require(_status == _NOT_ENTERED, "REENTRANCY");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

library AuctionLib {
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
}

contract Auction is ReentrancyGuard {
    using AuctionLib for uint256;

    error NotSeller();
    error AuctionNotStarted();
    error AuctionNotEnded();
    error InvalidTimes();
    error BidTooLow(uint256 minRequired);
    error AlreadyFinalized();
    error CancelNotAllowed();
    error RefundFailed();

    event BidPlaced(address indexed bidder, uint256 amount);
    event AuctionExtended(uint64 newEndTime);
    event Finalized(address winner, uint256 amount);
    event Cancelled();
    event Refunded(address indexed bidder, uint256 amount);

    // ============ Storage ============
    address public immutable seller;
    uint128 public immutable startPrice;
    uint128 public immutable minIncrement;
    uint64 public immutable startTime;
    uint64 public endTime;

    address public highestBidder;
    uint256 public highestBid;
    bool public finalized;

    constructor(uint128 _startPrice, uint64 _startTime, uint64 _endTime, uint128 _minIncrement) {
        if (_endTime <= _startTime) revert InvalidTimes();
        seller = msg.sender;
        startPrice = _startPrice;
        startTime = _startTime;
        endTime = _endTime;
        minIncrement = _minIncrement;
    }

    modifier onlySeller() {
        if (msg.sender != seller) revert NotSeller();
        _;
    }

    modifier auctionActive() {
        if (block.timestamp < startTime) revert AuctionNotStarted();
        if (block.timestamp >= endTime) revert AuctionNotEnded();
        _;
    }

    function minNextBid() public view returns (uint256) {
        uint256 base = highestBid == 0 ? startPrice : highestBid + minIncrement;
        return base;
    }

    function timeLeft() external view returns (uint256) {
        return block.timestamp >= endTime ? 0 : endTime - uint64(block.timestamp);
    }

    function bid() external payable nonReentrant auctionActive {
        uint256 minRequired = minNextBid();
        if (msg.value < minRequired) revert BidTooLow(minRequired);

        // refund previous highest immediately
        if (highestBidder != address(0)) {
            (bool refunded,) = payable(highestBidder).call{value: highestBid}("");
            if (!refunded) revert RefundFailed();
            emit Refunded(highestBidder, highestBid);
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit BidPlaced(msg.sender, msg.value);
    }

    function cancel() external onlySeller {
        if (block.timestamp >= startTime) revert CancelNotAllowed();
        if (highestBidder != address(0) || highestBid != 0) revert CancelNotAllowed();
        finalized = true;
        emit Cancelled();
    }

    function extendAuction(uint64 extendBy) external onlySeller {
        endTime += extendBy;
        emit AuctionExtended(endTime);
    }

    function finalize() external nonReentrant {
        if (finalized) revert AlreadyFinalized();
        if (block.timestamp < endTime) revert AuctionNotEnded();
        finalized = true;

        if (highestBidder != address(0)) {
            (bool okSeller,) = payable(seller).call{value: highestBid}("");
            require(okSeller, "PAY_SELLER_FAIL");
        }

        emit Finalized(highestBidder, highestBid);
    }

    receive() external payable {
        revert("USE_BID");
    }

    fallback() external payable {
        revert("NO_FALLBACK");
    }
}

contract AuctionFactory {
    event AuctionCreated(
        address indexed seller,
        address auction,
        uint128 startPrice,
        uint64 startTime,
        uint64 endTime,
        uint128 minIncrement
    );

    // Array to store all auction addresses (from all users)
    address[] public allAuctions;
    
    // Mapping from seller to their auction addresses
    mapping(address => address[]) public sellerAuctions;

    function createAuction(
        uint128 _startPrice,
        uint64 _startTime,
        uint64 _endTime,
        uint128 _minIncrement
    ) external returns (address auctionAddr) {
        Auction auction = new Auction(_startPrice, _startTime, _endTime, _minIncrement);
        auctionAddr = address(auction);
        
        // Add to global list (accessible by all users)
        allAuctions.push(auctionAddr);
        
        // Add to seller's personal list
        sellerAuctions[msg.sender].push(auctionAddr);
        
        emit AuctionCreated(msg.sender, auctionAddr, _startPrice, _startTime, _endTime, _minIncrement);
    }

    // ============ View Functions ============
    
    /// @notice Returns all auction addresses from all users
    function getAllAuctions() external view returns (address[] memory) {
        return allAuctions;
    }
    
    /// @notice Returns auction addresses created by a specific seller
    function getAuctionsBySeller(address seller) external view returns (address[] memory) {
        return sellerAuctions[seller];
    }
    
    /// @notice Returns the total number of auctions created
    function getTotalAuctionsCount() external view returns (uint256) {
        return allAuctions.length;
    }
    
    /// @notice Returns the number of auctions created by a specific seller
    function getSellerAuctionsCount(address seller) external view returns (uint256) {
        return sellerAuctions[seller].length;
    }
    
    /// @notice Returns a paginated list of all auctions
    function getAllAuctionsPaginated(uint256 offset, uint256 limit) 
        external 
        view 
        returns (address[] memory auctions, uint256 total) 
    {
        total = allAuctions.length;
        
        if (offset >= total) {
            return (new address[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 length = end - offset;
        auctions = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            auctions[i] = allAuctions[offset + i];
        }
    }
}