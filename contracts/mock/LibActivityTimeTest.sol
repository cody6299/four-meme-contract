// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

import "../libraries/LibActivityTime.sol";

contract LibActivityTimeTest {
    using LibActivityTime for LibActivityTime.ActivityTimeInfo;

    constructor() {
    }

    function startTime(LibActivityTime.ActivityTimeInfo memory activityTimeInfo) external pure returns (uint64) {
        return activityTimeInfo.startTime;
    }

    function finishTime(LibActivityTime.ActivityTimeInfo memory activityTimeInfo) external pure returns (uint64) {
        return activityTimeInfo.finishTime();
    }

    function notBegin(LibActivityTime.ActivityTimeInfo memory activityTimeInfo) external view returns (bool) {
        return activityTimeInfo.notBegin();
    }

    function alreadyFinish(LibActivityTime.ActivityTimeInfo memory activityTimeInfo) external view returns (bool) {
        return activityTimeInfo.alreadyFinish();
    }

    function isInProgress(LibActivityTime.ActivityTimeInfo memory activityTimeInfo) external view returns (bool) {
        return activityTimeInfo.isInProgress();
    }

    function season(LibActivityTime.ActivityTimeInfo memory activityTimeInfo) external view returns (uint64) {
        return activityTimeInfo.season();
    }

    function seasonStartTime(LibActivityTime.ActivityTimeInfo memory activityTimeInfo, uint64 seasonId) external pure returns (uint64) {
        return activityTimeInfo.seasonStartTime(seasonId);
    }

    function seasonFinishTime(LibActivityTime.ActivityTimeInfo memory activityTimeInfo, uint64 seasonId) external pure returns (uint64) {
        return activityTimeInfo.seasonFinishTime(seasonId);
    }

    function isVoting(LibActivityTime.ActivityTimeInfo memory activityTimeInfo, uint64 seasonId) external view returns (bool) {
        return activityTimeInfo.isVoting(seasonId);
    }

    function isVoting(LibActivityTime.ActivityTimeInfo memory activityTimeInfo) external view returns (bool) {
        return activityTimeInfo.isVoting();
    }

    function isBilling(LibActivityTime.ActivityTimeInfo memory activityTimeInfo, uint64 seasonId) external view returns (bool) {
        return activityTimeInfo.isBilling(seasonId);
    }

    function isBilling(LibActivityTime.ActivityTimeInfo memory activityTimeInfo) external view returns (bool) {
        return activityTimeInfo.isBilling();
    }

    function state(LibActivityTime.ActivityTimeInfo memory activityTimeInfo) external view returns (LibActivityTime.ActivityState) {
        return activityTimeInfo.state();
    }

}
