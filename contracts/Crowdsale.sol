// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GrantToken.sol";

/// @title ICO bán GRANT Token, nhận ETH
contract Crowdsale {
    GrantToken public token;
    address public dao;
    uint256 public rate = 1000; // 1 ETH = 1000 GRANT

    // tổng ETH đã nhận từ người mua
    uint256 public totalRaised;

    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event FundsRaised(uint256 amount);

    constructor(address _token, address _dao) {
        token = GrantToken(_token);
        dao = _dao;
    }

    /// Người dùng gửi ETH để mua token
    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH");

        uint256 amount = msg.value * rate;
        token.mint(msg.sender, amount);

        // ghi tổng tiền đã nhận
        totalRaised += msg.value;
        emit TokensPurchased(msg.sender, msg.value, amount);
        emit FundsRaised(msg.value);

        // Chuyển ETH sang DAO Treasury
        (bool ok, ) = dao.call{value: msg.value}("");
        require(ok, "ETH Transfer failed");
    }

    receive() external payable {
        buyTokens();
    }
}