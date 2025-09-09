// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Auction.sol";

contract AuctionFactory {
    address[] public allAuctions;
    mapping(address => address[]) public sellerAuctions;

    event AuctionCreated(
        address indexed seller,
        address auction,
        uint128 startPrice,
        uint64 startTime,
        uint64 endTime,
        uint128 minIncrement
    );

    function createAuction(
        uint128 _startPrice,
        uint64 _startTime,
        uint64 _endTime,
        uint128 _minIncrement
    ) external returns (address auctionAddr) {
        Auction auction = new Auction(
            _startPrice,
            _startTime,
            _endTime,
            _minIncrement
        );

        auctionAddr = address(auction);
        allAuctions.push(auctionAddr);
        sellerAuctions[msg.sender].push(auctionAddr);

        emit AuctionCreated(
            msg.sender,
            auctionAddr,
            _startPrice,
            _startTime,
            _endTime,
            _minIncrement
        );
    }

    function getAllAuctions() external view returns (address[] memory) {
        return allAuctions;
    }

    function getAuctionsBySeller(address seller)
        external
        view
        returns (address[] memory)
    {
        return sellerAuctions[seller];
    }
}