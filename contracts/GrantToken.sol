// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GrantToken is ERC20 {
    address public crowdsale;

    constructor() ERC20("GrantToken", "GRANT") {}

    function mint(address to, uint256 amount) external {
        require(msg.sender == crowdsale, "Only crowdsale");
        _mint(to, amount);
    }

    function setCrowdsale(address _crowdsale) external {
        require(crowdsale == address(0), "Already set");
        crowdsale = _crowdsale;
    }
}
