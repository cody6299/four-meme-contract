// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library LibActivityTime {

    struct ActivityTimeInfo {
        uint64 startTime;
        uint64 seasonNum;
        uint64 seasonInterval;
        uint64 billingCycle;
    }

    enum ActivityState {
        NOT_BEGIN,
        VOTING,
        BILLING,
        ALREADY_FINISH
    }

    function finishTime(ActivityTimeInfo memory activityTimeInfo) internal pure returns (uint64) {
        return activityTimeInfo.startTime + activityTimeInfo.seasonNum * activityTimeInfo.seasonInterval;
    }

    function notBegin(ActivityTimeInfo memory activityTimeInfo) internal view returns (bool) {
        return block.timestamp < activityTimeInfo.startTime;
    }

    function alreadyFinish(ActivityTimeInfo memory activityTimeInfo) internal view returns (bool) {
        return block.timestamp >= finishTime(activityTimeInfo);
    }

    function isInProgress(ActivityTimeInfo memory activityTimeInfo) internal view returns (bool) {
        return !(notBegin(activityTimeInfo) || alreadyFinish(activityTimeInfo));
    }

    function season(ActivityTimeInfo memory activityTimeInfo) internal view returns (uint64) {
        if (!isInProgress(activityTimeInfo)) {
            return 0;
        } else {
            return ((uint64(block.timestamp) - activityTimeInfo.startTime) / activityTimeInfo.seasonInterval) + 1;
        }
    }

    function seasonStartTime(ActivityTimeInfo memory activityTimeInfo, uint64 seasonId) internal pure returns (uint64) {
        return activityTimeInfo.startTime + (seasonId - 1) * activityTimeInfo.seasonInterval;
    }

    function seasonFinishTime(ActivityTimeInfo memory activityTimeInfo, uint64 seasonId) internal pure returns (uint64) {
        return seasonStartTime(activityTimeInfo, seasonId + 1);
    }

    function isVoting(ActivityTimeInfo memory activityTimeInfo, uint64 seasonId) internal view returns (bool) {
        return block.timestamp >= seasonStartTime(activityTimeInfo, seasonId) && 
            block.timestamp < (seasonFinishTime(activityTimeInfo, seasonId) - activityTimeInfo.billingCycle);
    }

    function isVoting(ActivityTimeInfo memory activityTimeInfo) internal view returns (bool) {
        if (!isInProgress(activityTimeInfo)) {
            return false;
        } else {
            return isVoting(activityTimeInfo, season(activityTimeInfo));
        }
    }

    function isBilling(ActivityTimeInfo memory activityTimeInfo, uint64 seasonId) internal view returns (bool) {
        return block.timestamp >= (seasonFinishTime(activityTimeInfo, seasonId) - activityTimeInfo.billingCycle);
    }

    function isBilling(ActivityTimeInfo memory activityTimeInfo) internal view returns (bool) {
        uint64 seasonId = activityTimeInfo.seasonNum;
        if (isInProgress(activityTimeInfo)) {
            seasonId = season(activityTimeInfo);
        }
        return isBilling(activityTimeInfo, seasonId);
    }

    function state(ActivityTimeInfo memory activityTimeInfo) internal view returns (ActivityState) {
        if (notBegin(activityTimeInfo)) {
            return ActivityState.NOT_BEGIN;
        } else if (alreadyFinish(activityTimeInfo)) {
            return ActivityState.ALREADY_FINISH;
        } else if (isBilling(activityTimeInfo, season(activityTimeInfo))) {
            return ActivityState.BILLING;
        } else {
            return ActivityState.VOTING;
        }
    }
}
