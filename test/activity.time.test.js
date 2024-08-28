const chai = require("chai");
const expect = chai.expect;
const {ASTHERUS} = require('../config/business/astherus.js');
const { MerkleTree } = require('merkletreejs')


const PROPOSER_ROLE = ethers.id('PROPOSER_ROLE');
const EXECUTOR_ROLE = ethers.id('EXECUTOR_ROLE');
const CANCELLER_ROLE = ethers.id('CANCELLER_ROLE');
const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

const KEEPER_ROLE = ethers.id('KEEPER_ROLE');
const NATIVE = '0xfdae1ba7c826abdc4c99903c8056f82a1a04a615';

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

    it("isActive", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        expect(await this.LibActivityTimeTest.isActive(timeInfo)).to.be.equal(false);
        await network.provider.send("evm_mine", [Number(await this.LibActivityTimeTest.startTime(timeInfo)) + 10]);
        expect(await this.LibActivityTimeTest.isActive(timeInfo)).to.be.equal(true);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 100]);
        expect(await this.LibActivityTimeTest.isActive(timeInfo)).to.be.equal(true);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 24 * 60 * 60 + 100]);
        expect(await this.LibActivityTimeTest.isActive(timeInfo)).to.be.equal(true);
        await network.provider.send("evm_mine", [Number(await this.LibActivityTimeTest.finishTime(timeInfo)) + 10]);
        expect(await this.LibActivityTimeTest.isActive(timeInfo)).to.be.equal(false);
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
            expect(await this.LibActivityTimeTest.seasonFinishTime(timeInfo, i + 1)).to.be.equal(timeInfo.startTime + (i + 1) * timeInfo.seasonInterval - 1);
        }
    });

    it("isBilling", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        expect(await this.LibActivityTimeTest.isBilling(timeInfo, 1)).to.be.equal(false);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 24 * 60 * 60]);
        for (let i = 0; i < 12; i ++) {
            expect(await this.LibActivityTimeTest.isBilling(timeInfo, i + 1)).to.be.equal(false);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 23 * 60 * 60]);
            expect(await this.LibActivityTimeTest.isBilling(timeInfo, i + 1)).to.be.equal(true);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 1 * 60 * 60 - 1]);
            expect(await this.LibActivityTimeTest.isBilling(timeInfo, i + 1)).to.be.equal(true);
            await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 1]);
            expect(await this.LibActivityTimeTest.isBilling(timeInfo, i + 1)).to.be.equal(true);
        }
    });

    it("state", async function() {
        const timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        const STATE = {NOT_BEGIN:0,ACTIVE:1,BILLING:2,ALREADY_FINISH:3};
        expect(await this.LibActivityTimeTest.state(timeInfo)).to.be.equal(STATE.NOT_BEGIN);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 24 * 60 * 60 - 1]);
        expect(await this.LibActivityTimeTest.state(timeInfo)).to.be.equal(STATE.NOT_BEGIN);
        await network.provider.send("evm_mine", [(await ethers.provider.getBlock()).timestamp + 1]);
        for (let i = 0; i < 12; i ++) {
            expect(await this.LibActivityTimeTest.state(timeInfo)).to.be.equal(STATE.ACTIVE);
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
