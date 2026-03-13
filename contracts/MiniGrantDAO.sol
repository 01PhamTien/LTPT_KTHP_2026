// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GrantToken.sol";
/// @title DAO cho Mini-Grants: Voting + Treasury + Phân bổ quỹ
contract MiniGrantDAO {
    struct Project {
        string name;
        string description;
        address payable recipient;
        uint256 votes;
        bool funded;
    }

    GrantToken public token;
    Project[] public projects;

    /// user → projectID → voted?
    mapping(address => mapping(uint256 => bool)) public voted;

    event ProjectCreated(uint256 indexed id, string name, address recipient);
    event Voted(address indexed voter, uint256 indexed projectId, uint256 votes);
    event ProjectFunded(uint256 indexed projectId, uint256 amount);
    event FundingLogged(uint256 indexed projectId, uint256 amount, address indexed caller, uint256 timestamp);

    constructor(address _token) {
        token = GrantToken(_token);
    }

    // Thêm dự án cần gây quỹ
    function createProject(
        string memory name,
        string memory description,
        address payable recipient
    ) external {
        projects.push(Project(name, description, recipient, 0, false));
        emit ProjectCreated(projects.length - 1, name, recipient);
    }

    // Token holder vote cho dự án
    function vote(uint256 projectId) external {
        require(projectId < projects.length, "Invalid project");
        require(!voted[msg.sender][projectId], "Already voted");

        uint256 balance = token.balanceOf(msg.sender);
        require(balance > 0, "No GRANT tokens");

        projects[projectId].votes += balance;
        voted[msg.sender][projectId] = true;

        emit Voted(msg.sender, projectId, balance);
    }

    // ghi lại thông tin mỗi lần cấp vốn
    struct Funding {
        uint256 projectId;
        uint256 amount;
        uint256 timestamp;
        address caller;
    }

    Funding[] public fundings;

    // Admin gửi toàn bộ ETH cho project thắng vote
    function fundProject(uint256 projectId) external {
        require(projectId < projects.length, "Invalid project");

        Project storage p = projects[projectId];
        require(!p.funded, "Already funded");

        uint256 amount = address(this).balance;
        require(amount > 0, "No funds");

        p.funded = true;

        (bool ok, ) = p.recipient.call{value: amount}("");
        require(ok, "ETH transfer failed");

        fundings.push(Funding(projectId, amount, block.timestamp, msg.sender));
        emit ProjectFunded(projectId, amount);
        emit FundingLogged(projectId, amount, msg.sender, block.timestamp);
    }

    /// @notice total số bản ghi cấp vốn
    function fundingCount() external view returns (uint256) {
        return fundings.length;
    }

    /// @notice kiểm tra user đã vote project chưa
    function hasVoted(address voter, uint256 projectId) external view returns (bool) {
        return voted[voter][projectId];
    }

    // Nhận ETH từ Crowdsale
    receive() external payable {}
}