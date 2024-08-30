// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

import "./FourMemeERC20.sol";
import "./interfaces/IActivity.sol";
import "./libraries/LibActivityTime.sol";

contract Factory is Initializable, AccessControlEnumerableUpgradeable, UUPSUpgradeable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    event UpdateDefaultDecimals(uint8 oldValue, uint8 newValue);
    event UpdateActivityImplementation(address oldImplementation, address newImplementation);
    event UpdateCreateFee(uint oldFee, uint newFee);
    event UpdateFeeReceiver(address oldReceiver, address newReceiver);
    event UpdateSpotTokenPercent(uint oldPercent, uint newPercent);
    event UpdateBaseTokenAmount(uint oldAmount, uint newAmount);
    event UpdateAdmin(address oldAdmin, address newAdmin);
    event UpdateManager(address oldManager, address newManager);
    event UpdateKeeper(address oldKeeper, address newKeeper);
    event NewActivity(ERC1967Proxy proxy);

    uint8 public defaultDecimals;
    address public activityImplementation;
    uint256 public createFee;
    address payable public feeReceiver;
    uint256 public spotTokenPercent;
    uint256 public baseTokenAmount;
    address public admin;
    address public manager;
    address public keeper;
    ERC1967Proxy public lastProxy;

    function initialize(
        uint8 _defaultDecimals, 
        address _activityImplementation,
        uint _createFee,
        address payable _feeReceiver,
        uint _spotTokenPercent,
        uint _baseTokenAmount,
        address _admin, 
        address _manager,
        address _keeper
    ) initializer external {
        __AccessControlEnumerable_init();
        __UUPSUpgradeable_init();

        _grantRole(MANAGER_ROLE, msg.sender);
        updateDefaultDecimals(_defaultDecimals);
        updateActivityImplementation(_activityImplementation);
        updateCreateFee(_createFee);
        updateFeeReceiver(_feeReceiver);
        updateSpotTokenPercent(_spotTokenPercent);
        updateBaseTokenAmount(_baseTokenAmount);
        _revokeRole(MANAGER_ROLE, msg.sender);

        _grantRole(ADMIN_ROLE, msg.sender);
        updateAdmin(_admin);
        updateManager(_manager);
        updateKeeper(_keeper);
        _revokeRole(ADMIN_ROLE, msg.sender);

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(MANAGER_ROLE, _manager);
        
        defaultDecimals = _defaultDecimals;
    }

    function _authorizeUpgrade(address newImplementation) internal onlyRole(ADMIN_ROLE) override {}

    function deployERC20(string calldata _name, string calldata _symbol, uint256 _totalSupply) external returns (FourMemeERC20) {
        return new FourMemeERC20(_name, _symbol, defaultDecimals, _totalSupply, msg.sender); 
    }

    function deployActivity(uint64 _startTime, uint64 _seasonNum, uint64 _seasonInterval, uint64 _billingCycle) external onlyRole(MANAGER_ROLE) returns (ERC1967Proxy proxy) {
        LibActivityTime.ActivityTimeInfo memory timeInfo = LibActivityTime.ActivityTimeInfo({
            startTime: _startTime,
            seasonNum: _seasonNum,
            seasonInterval: _seasonInterval,
            billingCycle: _billingCycle
        });
        bytes memory data = abi.encodeWithSelector(
            IActivity.initialize.selector, 
            timeInfo, 
            createFee,
            feeReceiver,
            spotTokenPercent,
            baseTokenAmount,
            admin,
            manager,
            keeper
        );
        proxy = new ERC1967Proxy(activityImplementation, data);
        lastProxy = proxy;
        emit NewActivity(proxy);
    }

    function updateDefaultDecimals(uint8 _defaultDecimals) public onlyRole(MANAGER_ROLE) {
        emit UpdateDefaultDecimals(defaultDecimals, _defaultDecimals); 
        defaultDecimals = _defaultDecimals;
    }

    function updateActivityImplementation(address newImplementation) public onlyRole(MANAGER_ROLE) {
        require(newImplementation != address(0), "illegal implementation");
        emit UpdateActivityImplementation(activityImplementation, newImplementation);
        activityImplementation = newImplementation;
    }

    function updateCreateFee(uint newFee) public onlyRole(MANAGER_ROLE) {
        emit UpdateCreateFee(createFee, newFee);
        createFee = newFee;
    }

    function updateFeeReceiver(address payable newReceiver) public onlyRole(MANAGER_ROLE) {
        emit UpdateFeeReceiver(feeReceiver, newReceiver);
        feeReceiver = newReceiver;
    }

    function updateSpotTokenPercent(uint newPercent) public onlyRole(MANAGER_ROLE) {
        emit UpdateSpotTokenPercent(spotTokenPercent, newPercent);
        spotTokenPercent = newPercent;
    }

    function updateBaseTokenAmount(uint newAmount) public onlyRole(MANAGER_ROLE) {
        emit UpdateBaseTokenAmount(baseTokenAmount, newAmount);
        baseTokenAmount = newAmount;
    }

    function updateAdmin(address newAdmin) public onlyRole(ADMIN_ROLE) {
        emit UpdateAdmin(admin, newAdmin);
        admin = newAdmin;
    }

    function updateManager(address newManager) public onlyRole(ADMIN_ROLE) {
        emit UpdateManager(manager, newManager);
        manager = newManager;
    }

    function updateKeeper(address newKeeper) public onlyRole(ADMIN_ROLE) {
        emit UpdateKeeper(keeper, newKeeper);
        keeper = newKeeper;
    }

}
