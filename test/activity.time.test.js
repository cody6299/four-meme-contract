const chai = require("chai");
const expect = chai.expect;

describe("Activity.Time", () => {
    before(async function () {
        const factory = await ethers.getContractFactory('LibActivityTimeTest');
        this.LibActivityTimeTest = await factory.deploy();
    });

    beforeEach(async function () {
    });

    it("startTime", async function() {
        const timeInfo = {
            startTime: Math.ceil(new Date() / 1000),
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        expect(await this.LibActivityTimeTest.startTime(timeInfo)).to.be.equal(timeInfo.startTime);
    });

    it("finishTime", async function() {
        const timeInfo = {
            startTime: 1725148800,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        expect(await this.LibActivityTimeTest.finishTime(timeInfo)).to.be.equal(1726185600);
    });

    it("notBegin", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        expect(await this.LibActivityTimeTest.notBegin(timeInfo)).to.be.equal(true);
        await network.provider.send("evm_mine", [Number(await this.LibActivityTimeTest.startTime(timeInfo)) + 10]);
        expect(await this.LibActivityTimeTest.notBegin(timeInfo)).to.be.equal(false);
    });

    it("alreadyFinish", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        expect(await this.LibActivityTimeTest.alreadyFinish(timeInfo)).to.be.equal(false);
        await network.provider.send("evm_mine", [Number(await this.LibActivityTimeTest.startTime(timeInfo)) + 10]);
        expect(await this.LibActivityTimeTest.alreadyFinish(timeInfo)).to.be.equal(false);
        await network.provider.send("evm_mine", [Number(await this.LibActivityTimeTest.finishTime(timeInfo)) + 10]);
        expect(await this.LibActivityTimeTest.alreadyFinish(timeInfo)).to.be.equal(true);
    });

    it("isInProgress", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        expect(await this.LibActivityTimeTest.isInProgress(timeInfo)).to.be.equal(false);
        await network.provider.send("evm_mine", [Number(await this.LibActivityTimeTest.startTime(timeInfo)) + 10]);
        expect(await this.LibActivityTimeTest.isInProgress(timeInfo)).to.be.equal(true);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 100]);
        expect(await this.LibActivityTimeTest.isInProgress(timeInfo)).to.be.equal(true);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 24 * 60 * 60 + 100]);
        expect(await this.LibActivityTimeTest.isInProgress(timeInfo)).to.be.equal(true);
        await network.provider.send("evm_mine", [Number(await this.LibActivityTimeTest.finishTime(timeInfo)) + 10]);
        expect(await this.LibActivityTimeTest.isInProgress(timeInfo)).to.be.equal(false);
    });

    it("season", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        expect(await this.LibActivityTimeTest.season(timeInfo)).to.be.equal(0);
        for (let i = 0; i < 12; i ++) {
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 24 * 60 * 60]);
            expect(await this.LibActivityTimeTest.season(timeInfo)).to.be.equal(i + 1);
        }
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 24 * 60 * 60 + 1]);
        expect(await this.LibActivityTimeTest.season(timeInfo)).to.be.equal(0);
    });

    it("seasonStartTime && seasonFinishTime", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        for (let i = 0; i < 12; i ++) {
            expect(await this.LibActivityTimeTest.seasonStartTime(timeInfo, i + 1)).to.be.equal(timeInfo.startTime + i * timeInfo.seasonInterval);
            expect(await this.LibActivityTimeTest.seasonFinishTime(timeInfo, i + 1)).to.be.equal(timeInfo.startTime + (i + 1) * timeInfo.seasonInterval);
        }
    });
    it("isVoting", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64),uint64)'](timeInfo, 1)).to.be.equal(false);
        expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(false);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 24 * 60 * 60]);
        for (let i = 0; i < 12; i ++) {
            expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64),uint64)'](timeInfo, i + 1)).to.be.equal(true);
            expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(true);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 23 * 60 * 60]);
            expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64),uint64)'](timeInfo, i + 1)).to.be.equal(false);
            expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(false);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 1 * 60 * 60 - 1]);
            expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64),uint64)'](timeInfo, i + 1)).to.be.equal(false);
            expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(false);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 1]);
            expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64),uint64)'](timeInfo, i + 1)).to.be.equal(false);
            if (i + 1 == 12) {
                expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(false);
            } else {
                expect(await this.LibActivityTimeTest['isVoting((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(true);
            }
        }
    });

    it("isBilling", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64),uint64)'](timeInfo, 1)).to.be.equal(false);
        expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(false);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 24 * 60 * 60]);
        for (let i = 0; i < 12; i ++) {
            expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64),uint64)'](timeInfo, i + 1)).to.be.equal(false);
            expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(false);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 23 * 60 * 60]);
            expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64),uint64)'](timeInfo, i + 1)).to.be.equal(true);
            expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(true);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 1 * 60 * 60 - 1]);
            expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64),uint64)'](timeInfo, i + 1)).to.be.equal(true);
            expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(true);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 1]);
            expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64),uint64)'](timeInfo, i + 1)).to.be.equal(true);
            if (i + 1 == 12) {
                expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(true);
            } else {
                expect(await this.LibActivityTimeTest['isBilling((uint64,uint64,uint64,uint64))'](timeInfo)).to.be.equal(false);
            }
        }
    });

    it("state", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        const STATE = {NOT_BEGIN:0,VOTING:1,BILLING:2,ALREADY_FINISH:3};
        expect(await this.LibActivityTimeTest.state(timeInfo)).to.be.equal(STATE.NOT_BEGIN);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 24 * 60 * 60 - 1]);
        expect(await this.LibActivityTimeTest.state(timeInfo)).to.be.equal(STATE.NOT_BEGIN);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 1]);
        for (let i = 0; i < 12; i ++) {
            expect(await this.LibActivityTimeTest.state(timeInfo)).to.be.equal(STATE.VOTING);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 23 * 60 * 60]);
            expect(await this.LibActivityTimeTest.state(timeInfo)).to.be.equal(STATE.BILLING);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 60 * 60 - 1]);
            expect(await this.LibActivityTimeTest.state(timeInfo)).to.be.equal(STATE.BILLING);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 1]);
        }
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 1]);
        expect(await this.LibActivityTimeTest.state(timeInfo)).to.be.equal(STATE.ALREADY_FINISH);
    });
});
