// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentPump
 * @notice Token launchpad with bonding curve - Only AI agents can trade
 */
contract AgentPump is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct Token {
        string name;
        string symbol;
        string metadata; // JSON: emoji, description
        address creator;
        uint256 createdAt;
        uint256 totalSupply;
        uint256 reserveBalance;
        bool graduated;
    }
    
    struct Agent {
        string name;
        string avatar;
        address wallet;
        uint256 totalTrades;
        uint256 totalVolume;
        int256 pnl;
        bool active;
    }
    
    // ============ State ============
    
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => mapping(address => uint256)) public balances; // tokenId => user => balance
    mapping(address => Agent) public agents;
    mapping(address => bool) public isAgent;
    
    uint256 public tokenCount;
    uint256 public agentCount;
    address[] public agentList;
    
    // ============ Constants ============
    
    uint256 public constant RESERVE_RATIO = 500000; // 50% in basis points (1e6)
    uint256 public constant BASE_PRICE = 0.0001 ether; // Starting price
    uint256 public constant GRADUATION_MC = 69000 ether; // $69M equivalent - very high for testnet
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 1e18;
    uint256 public constant PRECISION = 1e18;
    
    // ============ Events ============
    
    event AgentRegistered(address indexed wallet, string name, string avatar);
    event AgentDeactivated(address indexed wallet);
    
    event TokenCreated(
        uint256 indexed tokenId,
        string name,
        string symbol,
        address indexed creator,
        string metadata
    );
    
    event Trade(
        uint256 indexed tokenId,
        address indexed agent,
        bool isBuy,
        uint256 amount,
        uint256 price,
        uint256 cost
    );
    
    event TokenGraduated(uint256 indexed tokenId, uint256 finalMC);
    
    // ============ Modifiers ============
    
    modifier onlyAgent() {
        require(isAgent[msg.sender], "Only registered agents can trade");
        require(agents[msg.sender].active, "Agent is not active");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ Agent Management ============
    
    function registerAgent(
        address wallet,
        string calldata name,
        string calldata avatar
    ) external onlyOwner {
        require(!isAgent[wallet], "Agent already registered");
        require(wallet != address(0), "Invalid wallet");
        
        agents[wallet] = Agent({
            name: name,
            avatar: avatar,
            wallet: wallet,
            totalTrades: 0,
            totalVolume: 0,
            pnl: 0,
            active: true
        });
        
        isAgent[wallet] = true;
        agentList.push(wallet);
        agentCount++;
        
        emit AgentRegistered(wallet, name, avatar);
    }
    
    function deactivateAgent(address wallet) external onlyOwner {
        require(isAgent[wallet], "Not an agent");
        agents[wallet].active = false;
        emit AgentDeactivated(wallet);
    }
    
    function activateAgent(address wallet) external onlyOwner {
        require(isAgent[wallet], "Not an agent");
        agents[wallet].active = true;
    }
    
    // ============ Token Creation ============
    
    function createToken(
        string calldata name,
        string calldata symbol,
        string calldata metadata
    ) external onlyAgent returns (uint256 tokenId) {
        tokenId = tokenCount++;
        
        uint256 initialReserve = (INITIAL_SUPPLY * BASE_PRICE * RESERVE_RATIO) / (1e6 * PRECISION);
        
        tokens[tokenId] = Token({
            name: name,
            symbol: symbol,
            metadata: metadata,
            creator: msg.sender,
            createdAt: block.timestamp,
            totalSupply: INITIAL_SUPPLY,
            reserveBalance: initialReserve,
            graduated: false
        });
        
        // Creator gets initial tokens
        balances[tokenId][msg.sender] = INITIAL_SUPPLY / 10; // 10% to creator
        
        emit TokenCreated(tokenId, name, symbol, msg.sender, metadata);
    }
    
    // ============ Bonding Curve Math ============
    
    function getPrice(uint256 tokenId) public view returns (uint256) {
        Token storage token = tokens[tokenId];
        if (token.totalSupply == 0) return BASE_PRICE;
        return (token.reserveBalance * PRECISION) / (token.totalSupply * RESERVE_RATIO / 1e6);
    }
    
    function getMarketCap(uint256 tokenId) public view returns (uint256) {
        Token storage token = tokens[tokenId];
        return (token.totalSupply * getPrice(tokenId)) / PRECISION;
    }
    
    function getBuyPrice(uint256 tokenId, uint256 amount) public view returns (uint256 cost) {
        Token storage token = tokens[tokenId];
        
        // Bancor formula: cost = reserve * ((1 + amount/supply)^(1/ratio) - 1)
        // Simplified: cost ≈ amount * currentPrice * (1 + amount/(2*supply))
        uint256 currentPrice = getPrice(tokenId);
        uint256 priceImpact = (amount * PRECISION) / (2 * token.totalSupply);
        cost = (amount * currentPrice * (PRECISION + priceImpact)) / (PRECISION * PRECISION);
    }
    
    function getSellPrice(uint256 tokenId, uint256 amount) public view returns (uint256 revenue) {
        Token storage token = tokens[tokenId];
        
        uint256 currentPrice = getPrice(tokenId);
        uint256 priceImpact = (amount * PRECISION) / (2 * token.totalSupply);
        revenue = (amount * currentPrice * (PRECISION - priceImpact)) / (PRECISION * PRECISION);
    }
    
    // ============ Trading ============
    
    function buy(uint256 tokenId, uint256 amount) external payable onlyAgent nonReentrant {
        require(tokenId < tokenCount, "Token does not exist");
        Token storage token = tokens[tokenId];
        require(!token.graduated, "Token has graduated");
        require(amount > 0, "Amount must be > 0");
        
        uint256 cost = getBuyPrice(tokenId, amount);
        require(msg.value >= cost, "Insufficient payment");
        
        // Update state
        token.totalSupply += amount;
        token.reserveBalance += cost;
        balances[tokenId][msg.sender] += amount;
        
        // Update agent stats
        agents[msg.sender].totalTrades++;
        agents[msg.sender].totalVolume += cost;
        
        // Check graduation
        if (getMarketCap(tokenId) >= GRADUATION_MC) {
            token.graduated = true;
            emit TokenGraduated(tokenId, getMarketCap(tokenId));
        }
        
        // Refund excess
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        emit Trade(tokenId, msg.sender, true, amount, getPrice(tokenId), cost);
    }
    
    function sell(uint256 tokenId, uint256 amount) external onlyAgent nonReentrant {
        require(tokenId < tokenCount, "Token does not exist");
        Token storage token = tokens[tokenId];
        require(!token.graduated, "Token has graduated");
        require(amount > 0, "Amount must be > 0");
        require(balances[tokenId][msg.sender] >= amount, "Insufficient balance");
        
        uint256 revenue = getSellPrice(tokenId, amount);
        require(token.reserveBalance >= revenue, "Insufficient reserves");
        
        // Update state
        token.totalSupply -= amount;
        token.reserveBalance -= revenue;
        balances[tokenId][msg.sender] -= amount;
        
        // Update agent stats
        agents[msg.sender].totalTrades++;
        agents[msg.sender].totalVolume += revenue;
        
        // Send revenue
        payable(msg.sender).transfer(revenue);
        
        emit Trade(tokenId, msg.sender, false, amount, getPrice(tokenId), revenue);
    }
    
    // ============ View Functions ============
    
    function getToken(uint256 tokenId) external view returns (
        string memory name,
        string memory symbol,
        string memory metadata,
        address creator,
        uint256 createdAt,
        uint256 totalSupply,
        uint256 reserveBalance,
        uint256 price,
        uint256 marketCap,
        bool graduated
    ) {
        Token storage token = tokens[tokenId];
        return (
            token.name,
            token.symbol,
            token.metadata,
            token.creator,
            token.createdAt,
            token.totalSupply,
            token.reserveBalance,
            getPrice(tokenId),
            getMarketCap(tokenId),
            token.graduated
        );
    }
    
    function getAgentBalance(uint256 tokenId, address agent) external view returns (uint256) {
        return balances[tokenId][agent];
    }
    
    function getAllAgents() external view returns (address[] memory) {
        return agentList;
    }
    
    function getAgentInfo(address wallet) external view returns (
        string memory name,
        string memory avatar,
        uint256 totalTrades,
        uint256 totalVolume,
        int256 pnl,
        bool active
    ) {
        Agent storage agent = agents[wallet];
        return (
            agent.name,
            agent.avatar,
            agent.totalTrades,
            agent.totalVolume,
            agent.pnl,
            agent.active
        );
    }
    
    // ============ Admin ============
    
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
}
