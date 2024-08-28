// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

import "./interfaces/IFactory.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/ISwapFactory.sol";
import "./libraries/LibActivityTime.sol";
import "./interfaces/IUniswapV2Locker.sol";

contract Active is Initializable, PausableUpgradeable, AccessControlEnumerableUpgradeable, UUPSUpgradeable {
    using SafeERC20 for IERC20;
    using LibActivityTime for LibActivityTime.ActivityTimeInfo;

    event UpdateCreateFee(uint oldValue, uint newValue);
    event UpdateFeeReceiver(address oldAddress, address newAddress);
    event UpdateSpotTokenPercent(uint oldPercent, uint newPercent);
    event UpdateBaseTokenAmount(uint oldAmount, uint newAmount);
    event AddToken(bytes32 id, string name, string symbol, uint8 decimals, uint totalSupply, uint64 season, uint createTime);
    event Vote(address user, address token, uint amount, bool newUser, uint totalVotedAmount, uint totalVoteUserNum, uint voteTime);
    event BillingSkip(uint season);
    event BillingSuccuess(uint64 season, address token, address pair, uint256 liquidity, uint256 billingTime);
    event Withdraw(uint64 season, address user, uint256 amount, uint256 withdrawTime);

    struct TokenInfo {
        uint season;
        uint votedAmount;
        uint voteUserNum;
        uint createTime;
        uint updateTime;
    }

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    uint256 public constant PERCENT_BASE = 10000;
    uint256 public constant OWNER_WITHDRAW_TIME = 1 days;
    IFactory public immutable FACTORY;
    IERC20 public immutable VOTE_TOKEN;
    IERC20 public immutable BASE_TOKEN;
    ISwapFactory public immutable SWAP_FACTORY;
    ISwapRouter public immutable SWAP_ROUTER;
    bytes32 public immutable PAIR_INIT_CODE_HASH;
    IUniswapV2Locker public immutable LP_LOCKER;

    LibActivityTime.ActivityTimeInfo public timeInfo;
    uint256 public createFee;
    address payable public feeReceiver;
    uint256 public spotTokenPercent;
    uint256 public baseTokenAmount;

    mapping(address => TokenInfo) public tokens;
    mapping(uint64 => address) public bestToken;
    mapping(uint => mapping(address => mapping(address => uint))) public voteHistory;
    mapping(uint => mapping(address => uint)) public voteAmount;
    mapping(uint64 => address) public pairs;

    constructor(IFactory factory, IERC20 voteToken, IERC20 baseToken, ISwapFactory swapFactory, ISwapRouter swapRouter, bytes32 pairInitCodeHash, IUniswapV2Locker lpLocker) {
        FACTORY = factory;
        VOTE_TOKEN = voteToken;
        BASE_TOKEN = baseToken;
        SWAP_FACTORY = swapFactory;
        SWAP_ROUTER = swapRouter;
        PAIR_INIT_CODE_HASH = pairInitCodeHash;
        LP_LOCKER = lpLocker;
        _disableInitializers();
    }

    function initialize(
        LibActivityTime.ActivityTimeInfo calldata _timeInfo, 
        uint _createFee,
        address payable _feeReceiver,
        uint _spotTokenPercent,
        uint _baseTokenAmount,
        address _admin, 
        address _manager, 
        address _keeper
    ) initializer external {
        __Pausable_init();
        __AccessControlEnumerable_init();
        __UUPSUpgradeable_init();
        
        _grantRole(MANAGER_ROLE, msg.sender);
        updateCreateFee(_createFee);
        updateFeeReceiver(_feeReceiver);
        updateSpotTokenPercent(_spotTokenPercent);
        updateBaseTokenAmount(_baseTokenAmount);
        _revokeRole(MANAGER_ROLE, msg.sender);

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(MANAGER_ROLE, _manager);
        _grantRole(KEEPER_ROLE, _keeper);

        timeInfo = _timeInfo;
    }

    function _authorizeUpgrade(address newImplementation) internal onlyRole(ADMIN_ROLE) override {}

    function getActivityInfo() external view returns (LibActivityTime.ActivityTimeInfo memory , LibActivityTime.ActivityState, uint64) {
        return (timeInfo, timeInfo.state(), timeInfo.season());
    }

    function addToken(bytes32 id, string calldata name, string calldata symbol, uint totalSupply) external payable whenNotPaused {
        require(timeInfo.isActive(), "not active");
        require(msg.value >= createFee, "illegal fee");
        Address.sendValue(feeReceiver, createFee);
        IERC20 token = FACTORY.deployERC20(name, symbol, totalSupply);
        uint64 season = timeInfo.season();
        TokenInfo memory tokenInfo = TokenInfo({
            season: season,
            votedAmount: 0,
            voteUserNum: 0,
            createTime: block.timestamp,
            updateTime: block.timestamp
        });
        tokens[address(token)] = tokenInfo;
        if (bestToken[season] == address(0)) {
            bestToken[season] = address(token);
        }
        if (msg.value > createFee) {
            Address.sendValue(payable(msg.sender), msg.value - createFee);
        }
        emit AddToken(id, name, symbol, FACTORY.defaultDecimals(), totalSupply, season, block.timestamp);
    }

    function vote(address tokenAddress, uint amount) external whenNotPaused {
        require(timeInfo.isActive(), "not active");
        uint64 season = timeInfo.season();
        require(!timeInfo.isBilling(season), "billing");

        VOTE_TOKEN.safeTransferFrom(msg.sender, address(this), amount);         

        TokenInfo memory tokenInfo = tokens[tokenAddress];
        require(tokenInfo.createTime > 0, "token not exist");
        tokenInfo.votedAmount += amount;
        bool newUser = voteHistory[season][msg.sender][tokenAddress] == 0;
        if (newUser) {
            tokenInfo.voteUserNum += 1;
        }
        if (bestToken[season] != tokenAddress) {
            TokenInfo memory bestTokenInfo = tokens[bestToken[season]];
            if (bestTokenInfo.votedAmount < tokenInfo.votedAmount) {
                bestToken[season] = tokenAddress;
            } else if (bestTokenInfo.votedAmount == tokenInfo.votedAmount && bestTokenInfo.createTime < tokenInfo.createTime) {
                bestToken[season] = tokenAddress;
            }
        }
        
        tokens[tokenAddress].votedAmount = tokenInfo.votedAmount; 
        tokens[tokenAddress].voteUserNum = tokenInfo.voteUserNum;
        tokens[tokenAddress].updateTime = block.timestamp;
        voteHistory[season][msg.sender][tokenAddress] = voteHistory[season][msg.sender][tokenAddress] + amount;
        voteAmount[season][msg.sender] += amount; 

        emit Vote(msg.sender, tokenAddress, amount, newUser, tokenInfo.votedAmount, tokenInfo.voteUserNum, block.timestamp);
    }

    function billing(uint64 season) external payable onlyRole(KEEPER_ROLE) {
        require(timeInfo.isBilling(season), "illegal time");
        require(pairs[season] == address(0), "already billing");
        address bestTokenAddress = bestToken[season];
        if (bestTokenAddress == address(0)) {
            emit BillingSkip(season);
            return;
        }

        IERC20 spotToken = IERC20(bestToken[season]);
        uint totalSupply = spotToken.totalSupply();
        uint spotTokenAmount = totalSupply * spotTokenPercent / PERCENT_BASE;
        spotToken.approve(address(SWAP_ROUTER), spotTokenAmount);
        BASE_TOKEN.approve(address(SWAP_ROUTER), baseTokenAmount);
        ( , , uint liquidity) = SWAP_ROUTER.addLiquidity(
            address(spotToken),
            address(BASE_TOKEN),
            spotTokenAmount,
            baseTokenAmount,
            0,
            0,
            address(this),
            block.timestamp
        );
        address token0 = address(spotToken);
        address token1 = address(BASE_TOKEN);
        (token0, token1) = token0 < token1 ? (token0, token1) : (token1, token0);
        address pair = address(uint160(uint(keccak256(abi.encodePacked(
            hex'ff',
            SWAP_FACTORY,
            keccak256(abi.encodePacked(token0, token1)),
            PAIR_INIT_CODE_HASH 
        )))));
        (uint ethFee, , , , , , , , ) = LP_LOCKER.gFees();
        require(msg.value >= ethFee, "no fee");
        IERC20(pair).approve(address(LP_LOCKER), liquidity);
        LP_LOCKER.lockLPToken{value: ethFee}(pair, liquidity, type(uint256).max, payable(address(0)), true, feeReceiver);
        if (msg.value > ethFee) {
            Address.sendValue(payable(msg.sender), msg.value - ethFee);
        }
        emit BillingSuccuess(season, bestTokenAddress, pair, liquidity, block.timestamp);
    }

    function withdraw() external {
        uint totalAmount = 0;
        for (uint64 season = 1; season <= timeInfo.seasonNum; season ++) {
            if (block.timestamp > timeInfo.seasonFinishTime(season)) {
                uint amount = voteAmount[season][msg.sender]; 
                emit Withdraw(season, msg.sender, amount, block.timestamp);
                totalAmount += amount;
                voteAmount[season][msg.sender] = 0;
            }
        }
        if (totalAmount > 0) {
            VOTE_TOKEN.safeTransfer(msg.sender, totalAmount);
        }
    }

    function updateCreateFee(uint newFee) public onlyRole(MANAGER_ROLE) {
        emit UpdateCreateFee(createFee, newFee);
        createFee = newFee;
    }

    function updateFeeReceiver(address payable newReceiver) public onlyRole(ADMIN_ROLE) {
        require(feeReceiver != address(0), "illegal address");
        emit UpdateFeeReceiver(feeReceiver, newReceiver);
        feeReceiver = newReceiver;
    }

    function updateSpotTokenPercent(uint newPercent) public onlyRole(MANAGER_ROLE) {
        require(newPercent > 0 && newPercent <= PERCENT_BASE, "illegal percent"); 
        emit UpdateSpotTokenPercent(spotTokenPercent, newPercent);
        spotTokenPercent = newPercent;
    }

    function updateBaseTokenAmount(uint newAmount) public onlyRole(MANAGER_ROLE) {
        require(newAmount > 0, "illegal amount");
        emit UpdateBaseTokenAmount(baseTokenAmount, newAmount);
        baseTokenAmount = newAmount;
    }

    function ownerWithdraw(IERC20 token, uint amount) external onlyRole(MANAGER_ROLE) {
        require(feeReceiver != address(0), "illegal receiver");
        require(block.timestamp >= timeInfo.finishTime() + OWNER_WITHDRAW_TIME, "illegal time");
        uint balance = VOTE_TOKEN.balanceOf(address(this));
        if (amount > balance) {
            amount = balance;
        }
        token.safeTransfer(feeReceiver, balance);
    }

    function pause() external onlyRole(MANAGER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(MANAGER_ROLE) {
        _unpause();
    }
}
