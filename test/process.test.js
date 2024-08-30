const chai = require("chai");
const expect = chai.expect;

const STATE = {NOT_BEGIN:0,VOTING:1,BILLING:2,ALREADY_FINISH:3};

describe("Process", () => {
    before(async function () {
        const {deployer, feeReceiver, admin, manager, keeper} = await ethers.getNamedSigners();
        this.deployer = deployer;
        this.feeReceiver = feeReceiver;
        this.admin = admin;
        this.manager = manager;
        this.keeper = keeper;

        const signers = await ethers.getSigners();
        this.user = signers[10];
        this.voter = signers[11];

        await deployments.fixture(["Factory"]);
        this.Factory = await ethers.getContract('Factory');
        this.ActivityFactory = await ethers.getContractFactory('Activity');
        this.MockWHY = await ethers.getContract('MockWHY');
        await this.MockWHY.mint(this.voter.address, ethers.parseEther('1000000'));
    });

    beforeEach(async function () {
    });

    it("deployActivity", async function() {
        this.timeInfo = {
            startTime: (await ethers.provider.getBlock()).timestamp + 24 * 60 * 60,
            seasonNum: 12,
            seasonInterval: 24 * 60 * 60,
            billingCycle: 60 * 60,
        }
        let tx = this.Factory.connect(this.manager).deployActivity(
            this.timeInfo.startTime,
            this.timeInfo.seasonNum,
            this.timeInfo.seasonInterval,
            this.timeInfo.billingCycle
        );
        await expect(tx).to.emit(this.Factory, 'NewActivity');
        tx = await (await tx).wait();
        const activityProxy = tx.logs[tx.logs.length - 1].args.proxy;
        this.Activity = await ethers.getContractAt('Activity', activityProxy);
        await this.MockWHY.mint(this.deployer.address, ethers.parseEther('100000000'));
        await this.MockWHY.connect(this.deployer).approve(this.Activity, ethers.parseEther('100000000'));
        await this.Activity.connect(this.deployer).adminDeposit(ethers.parseEther('100000000'));
    });

    it("notBegin", async function() {
        let state = await this.Activity.getActivityInfo();
        expect(state[0].startTime).to.be.equal(this.timeInfo.startTime);
        expect(state[0].seasonNum).to.be.equal(this.timeInfo.seasonNum);
        expect(state[0].seasonInterval).to.be.equal(this.timeInfo.seasonInterval);
        expect(state[0].billingCycle).to.be.equal(this.timeInfo.billingCycle);
        expect(state[1]).to.be.equal(STATE.NOT_BEGIN);
        expect(state[2]).to.be.equal(0);
        await network.provider.send("evm_mine", [this.timeInfo.startTime - 1]);
        state = await this.Activity.getActivityInfo();
        expect(state[0].startTime).to.be.equal(this.timeInfo.startTime);
        expect(state[0].seasonNum).to.be.equal(this.timeInfo.seasonNum);
        expect(state[0].seasonInterval).to.be.equal(this.timeInfo.seasonInterval);
        expect(state[0].billingCycle).to.be.equal(this.timeInfo.billingCycle);
        expect(state[1]).to.be.equal(STATE.NOT_BEGIN);
        expect(state[2]).to.be.equal(0);
    });

    it("season1", async function() {
        await network.provider.send("evm_mine", [this.timeInfo.startTime]);
        state = await this.Activity.getActivityInfo();
        expect(state[0].startTime).to.be.equal(this.timeInfo.startTime);
        expect(state[0].seasonNum).to.be.equal(this.timeInfo.seasonNum);
        expect(state[0].seasonInterval).to.be.equal(this.timeInfo.seasonInterval);
        expect(state[0].billingCycle).to.be.equal(this.timeInfo.billingCycle);
        expect(state[1]).to.be.equal(STATE.VOTING);
        expect(state[2]).to.be.equal(1);
    });

    it("addToken", async function() {
        await expect(this.Activity.connect(this.user).addToken(ethers.encodeBytes32String('1'), "token1", "token1", ethers.parseEther('1000000000'))).to.be.revertedWith('illegal fee');
        let feeReceiverBalanceBefore = await ethers.provider.getBalance(this.feeReceiver.address);
        let tx = this.Activity.connect(this.user).addToken(ethers.encodeBytes32String('1'), "token1", "token1", ethers.parseEther('1000000000'), {value: ethers.parseEther('0.3')});
        await expect(tx).to.emit(this.Activity, 'AddToken');
        let feeReceiverBalanceAfter = await ethers.provider.getBalance(this.feeReceiver.address);
        expect(feeReceiverBalanceAfter - feeReceiverBalanceBefore).to.be.equal(ethers.parseEther('0.2'));
        expect(await ethers.provider.getBalance(this.Activity.target)).to.be.equal(0);
        tx = await (await tx).wait();
        this.token1 = tx.logs[tx.logs.length - 1].args.token;

        tx = await this.Activity.connect(this.user).addToken(ethers.encodeBytes32String('1'), "token2", "token2", ethers.parseEther('1000000000'), {value: ethers.parseEther('0.3')});
        tx = await tx.wait();
        this.token2 = tx.logs[tx.logs.length - 1].args.token;

        tx = await this.Activity.connect(this.user).addToken(ethers.encodeBytes32String('1'), "token3", "token3", ethers.parseEther('1000000000'), {value: ethers.parseEther('0.3')});
        tx = await tx.wait();
        this.token3 = tx.logs[tx.logs.length - 1].args.token;

        expect(await this.Activity.bestToken(1)).to.be.equal(this.token1);
    });

    it("vote", async function() {
        await this.MockWHY.connect(this.voter).approve(this.Activity.target, ethers.MaxUint256)
        await this.Activity.connect(this.voter).vote(this.token2, ethers.parseEther('10'));
        expect(await this.Activity.bestToken(1)).to.be.equal(this.token2);
        await this.Activity.connect(this.voter).vote(this.token3, ethers.parseEther('20'));
        expect(await this.Activity.bestToken(1)).to.be.equal(this.token3);
        await this.Activity.connect(this.voter).vote(this.token1, ethers.parseEther('20'));
        expect(await this.Activity.bestToken(1)).to.be.equal(this.token1);
        await this.Activity.connect(this.voter).vote(this.token2, ethers.parseEther('10'));
        expect(await this.Activity.bestToken(1)).to.be.equal(this.token1);
    });

    it("billing", async function() {
        await network.provider.send("evm_mine", [this.timeInfo.startTime + this.timeInfo.seasonInterval - this.timeInfo.billingCycle]);
        let state = await this.Activity.getActivityInfo();
        expect(state[1]).to.be.equal(STATE.BILLING);
        expect(state[2]).to.be.equal(1);
        await this.Activity.connect(this.keeper).billing(1, {value: ethers.parseEther('1')});
        expect(await this.Activity.pairs(1)).to.be.not.equal(ethers.ZeroAddress);
        const ERC20 = await ethers.getContractAt('ERC20', await this.Activity.bestToken(1));
        expect(await ERC20.balanceOf(this.Activity.target)).to.be.equal(0);
    });

    it("withdraw", async function() {
        await network.provider.send("evm_mine", [this.timeInfo.startTime + this.timeInfo.seasonInterval]);
        let amount = await this.Activity.withdrawAmount(this.voter.address);
        expect(amount).to.be.equal(ethers.parseEther('60'));
        let balanceBefore = await this.MockWHY.balanceOf(this.voter.address);
        await this.Activity.connect(this.voter).withdraw(); 
        let balanceAfter = await this.MockWHY.balanceOf(this.voter.address);
        expect(balanceAfter - balanceBefore).to.be.equal(amount);
    });

    it("adminWithdraw", async function() {
        await expect(this.Activity.connect(this.manager).adminWithdraw(this.MockWHY.target, '100')).to.be.revertedWith('illegal time');
        await network.provider.send("evm_mine", [this.timeInfo.startTime + this.timeInfo.seasonInterval * this.timeInfo.seasonNum + 24 * 3600]);
        let balanceBefore = await this.MockWHY.balanceOf(this.feeReceiver.address);
        await this.Activity.connect(this.manager).adminWithdraw(this.MockWHY.target, '100');
        let balanceAfter = await this.MockWHY.balanceOf(this.feeReceiver.address);
        expect(balanceAfter - balanceBefore).to.be.equal(100);

        const currentBalance = await this.MockWHY.balanceOf(this.Activity.target);
        balanceBefore = await this.MockWHY.balanceOf(this.feeReceiver.address);
        await this.Activity.connect(this.manager).adminWithdraw(this.MockWHY.target, ethers.MaxUint256);
        balanceAfter = await this.MockWHY.balanceOf(this.feeReceiver.address);
        expect(balanceAfter - balanceBefore).to.be.equal(currentBalance);
    });
});
