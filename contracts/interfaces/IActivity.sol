// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import "../libraries/LibActivityTime.sol";

interface IActivity {
    function initialize(
        LibActivityTime.ActivityTimeInfo calldata _timeInfo, 
        uint _createFee,
        address payable _feeReceiver,
        uint _spotTokenPercent,
        uint _baseTokenAmount,
        address _admin, 
        address _manager, 
        address _keeper
    ) external;
}
