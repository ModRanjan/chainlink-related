const { expect, assert } = require('chai');
const { ethers, waffle } = require('hardhat');

describe('dice contract unit test', () => {
  const vrfKeyHash =
    '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc';
  const vrfSubscriptionId = 1;
  let vRFCoordinatorV2Mock;
  let dice;
  let owner;
  let signer1Ad;
  let signers;

  const BaseFee = 100000;
  const GasPriceLink = 100000;

  before(async () => {
    [owner, signer1Ad, ...signers] = await ethers.getSigners();

    const DICE = await ethers.getContractFactory('Dice');
    const VRFCoordinatorV2Mock = await ethers.getContractFactory(
      'VRFCoordinatorV2Mock'
    );

    vRFCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(
      BaseFee,
      GasPriceLink
    );
    await vRFCoordinatorV2Mock.createSubscription();

    dice = await DICE.deploy(
      vRFCoordinatorV2Mock.address,
      vrfKeyHash,
      vrfSubscriptionId
    );
  });

  describe('# Deployment', () => {
    it('deploys successfully', async () => {
      const address = await dice.address;

      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it('Should set the right owner', async () => {
      expect(await dice.owner()).to.equal(owner.address);
    });
  });

  describe('# PlaceBet # Calculate Multiplier # Roll Dice', () => {
    it('Check betAmount should be greater than 0', async () => {
      const sliderValue = 51;

      await expect(
        dice.connect(signer1Ad).placeBet(sliderValue, false, {
          value: ethers.utils.parseEther('0'),
        })
      ).to.be.revertedWith('Bet Value should be greater than 0');
    });

    it('should check the valid sliderValue', async function () {
      const amount = ethers.utils.parseEther('0.001');

      await expect(
        dice.connect(signer1Ad).placeBet(1, false, { value: amount })
      ).to.be.revertedWith('Invalid Slider Value!!!');

      await expect(
        dice.connect(signer1Ad).placeBet(97, false, { value: amount })
      ).to.be.revertedWith('Invalid Slider Value!!!');

      await expect(
        dice.connect(signer1Ad).placeBet(101, false, { value: amount })
      ).to.be.revertedWith('Invalid Slider Value!!!');

      await expect(
        dice.connect(signer1Ad).placeBet(101, true, { value: amount })
      ).to.be.revertedWith('Invalid Slider Value!!!');

      await expect(
        dice.connect(signer1Ad).placeBet(3, true, { value: amount })
      ).to.be.revertedWith('Invalid Slider Value!!!');
    });

    it('should calculate correct multiplirePoint', async () => {
      const amount = ethers.utils.parseEther('0.001');
      await dice.connect(owner).placeBet(3, false, { value: amount });

      expect((await dice.betIdToBets(1)).multiplier / 100).to.be.equal(49.25);

      await dice.connect(owner).placeBet(52, false, { value: amount });
      expect((await dice.betIdToBets(2)).multiplier / 100).to.be.equal(1.93);

      await dice.connect(owner).placeBet(5, true, { value: amount });
      expect((await dice.betIdToBets(3)).multiplier / 100).to.be.equal(1.03);

      await dice.connect(owner).placeBet(52, true, { value: amount });
      expect((await dice.betIdToBets(4)).multiplier / 100).to.be.equal(2.05);
    });

    it('should assign correct values to structure userBets', async () => {
      const sliderValue1 = 39;
      const sliderValue2 = 30;
      const amount = ethers.utils.parseEther('0.01');

      await dice
        .connect(owner)
        .placeBet(sliderValue1, false, { value: amount });

      let requestId = await dice.requestId();
      let betId = await dice.requestIdToBetId(requestId);
      let userBets = await dice.betIdToBets(betId);

      expect(userBets.betAmount).to.equal(amount);
      expect(userBets.sliderValue).to.equal(39);
      expect(userBets.isRollOver).to.equal(false);
      expect(userBets.multiplier / 100).to.equal(2.59);

      await dice.connect(owner).placeBet(sliderValue2, true, { value: amount });

      requestId = await dice.requestId();
      betId = await dice.requestIdToBetId(requestId);
      userBets = await dice.betIdToBets(betId);

      expect(userBets.betAmount).to.equal(amount);
      expect(userBets.sliderValue).to.equal(30);
      expect(userBets.isRollOver).to.equal(true);
      expect(userBets.multiplier / 100).to.equal(1.4);
    });

    it('should emit BetPlaced event', async () => {
      const amount = ethers.utils.parseEther('0.01');
      const requestId = await dice.requestId();
      let betId = await dice.requestIdToBetId(requestId);
      betId = betId.toNumber() + 1;

      await expect(
        dice.connect(signer1Ad).placeBet(51, false, { value: amount })
      )
        .to.emit(dice, 'BetPlaced')
        .withArgs(betId, amount, 51, 197, false);
    });

    it('Should successfully request a random number and set mapping of requestIdToBetId', async () => {
      const amount = ethers.utils.parseEther('10');
      const sliderValue = 65;

      await vRFCoordinatorV2Mock.fundSubscription(
        vrfSubscriptionId,
        ethers.utils.parseEther('1')
      );

      const placeBetTransaction = await dice.placeBet(sliderValue, false, {
        value: amount,
      });
      await placeBetTransaction.wait(1);

      const requestId = await dice.requestId();

      assert(
        requestId.gt(ethers.constants.Zero),
        'First random number is greather than zero'
      );

      const txFulFillRandomWords =
        await vRFCoordinatorV2Mock.fulfillRandomWords(requestId, dice.address);
      await txFulFillRandomWords.wait(1);

      const BetId = await dice.requestIdToBetId(requestId);

      assert(
        BetId.gt(ethers.constants.Zero),
        'First random number is greather than zero'
      );
    });

    it('Should get random number > 0', async () => {
      const amount = ethers.utils.parseEther('0.2');
      const sliderValue = 5;

      await vRFCoordinatorV2Mock.fundSubscription(
        vrfSubscriptionId,
        ethers.utils.parseEther('0.1')
      );

      const placeBetTransaction = await dice.placeBet(sliderValue, true, {
        value: amount,
      });
      await placeBetTransaction.wait(1);

      const requestId = await dice.requestId();

      const txFulFillRandomWords =
        await vRFCoordinatorV2Mock.fulfillRandomWords(requestId, dice.address);
      await txFulFillRandomWords.wait(1);

      const BetId = await dice.requestIdToBetId(requestId);
      const bet = await dice.betIdToBets(BetId);

      const randomNumber = await bet.randomNumber;
      console.log('L-204 : ', randomNumber);
      assert(
        randomNumber.gt(ethers.constants.Zero),
        'First random number is greather than zero'
      );
    });
  });

  describe('# Check Winner (rollUnder / rollOver)', () => {
    // for checking the address (owner) balance
    /* eslint prefer-destructuring: ["off", {VariableDeclarator: {object: true}}] */
    const provider = waffle.provider;

    let contractBalance;
    let userBalance;

    it('checks if user wins the Bet then winning amount should be transfered to user account (rollUnder)', async () => {
      const amount = ethers.utils.parseEther('20');
      const sliderValue = 75;

      await dice
        .connect(signers[0])
        .transfer(dice.address, { value: ethers.utils.parseEther('500') });

      // before placing Bet
      userBalance = await provider.getBalance(owner.address);
      contractBalance = await dice.contractBalance();

      // placing Bet
      const TransactionplaceBet = await dice
        .connect(owner)
        .placeBet(sliderValue, false, { value: amount });
      await TransactionplaceBet.wait();

      // after placing Bet
      contractBalance = BigInt(contractBalance) + BigInt(amount);
      userBalance = BigInt(userBalance) - BigInt(amount);

      expect((await dice.contractBalance()).toString()).to.be.equal(
        contractBalance.toString()
      );

      // expect((await provider.getBalance(owner.address))).to.be.closeTo(userBalance);

      const requestId = await dice.requestId();

      const txFulFillRandomWords =
        await vRFCoordinatorV2Mock.fulfillRandomWords(requestId, dice.address);
      await txFulFillRandomWords.wait(1);

      const betId = await dice.requestIdToBetId(requestId);
      const bet = await dice.betIdToBets(betId);

      const winningAmt = bet.winningAmount;

      // check winning amount
      contractBalance -= BigInt(winningAmt);

      expect((await dice.contractBalance()).toString()).to.be.equal(
        contractBalance.toString()
      );

      const userFinalBalance = userBalance + BigInt(winningAmt);

      /* eslint no-console: "warn" */
      console.log('User Balance After Winning the bet :', userFinalBalance); // 9976761490910730696670

      // expect(BigInt(await provider.getBalance(owner.address))).to.be.closeTo(userFinalBalance);
    });

    it('checks if user loose the Bet then no amount should be transfered to user account (rollUnder)', async () => {
      const amount = ethers.utils.parseEther('20');
      const sliderValue = 10;

      await dice
        .connect(signers[0])
        .transfer(dice.address, { value: ethers.utils.parseEther('500') });

      // before placing Bet
      userBalance = await provider.getBalance(owner.address);
      contractBalance = await dice.contractBalance();

      // placing Bet
      const TransactionplaceBet = await dice
        .connect(owner)
        .placeBet(sliderValue, false, { value: amount });
      await TransactionplaceBet.wait();

      // after placing Bet
      contractBalance = BigInt(contractBalance) + BigInt(amount);
      userBalance = BigInt(userBalance) - BigInt(amount);

      expect((await dice.contractBalance()).toString()).to.be.equal(
        contractBalance.toString()
      );

      // expect((await provider.getBalance(owner.address))).to.be.closeTo(userBalance);

      const requestId = await dice.requestId();

      const txFulFillRandomWords =
        await vRFCoordinatorV2Mock.fulfillRandomWords(requestId, dice.address);
      await txFulFillRandomWords.wait(1);

      const betId = await dice.requestIdToBetId(requestId);
      const bet = await dice.betIdToBets(betId);

      const winningAmt = bet.winningAmount;

      // check winning amount
      contractBalance -= BigInt(winningAmt);

      expect((await dice.contractBalance()).toString()).to.be.equal(
        contractBalance.toString()
      );

      const userFinalBalance = userBalance + BigInt(winningAmt);

      /* eslint no-console: "warn" */
      console.log('User Balance After loosing the bet :', userFinalBalance); // 9976761490910730696670

      // expect(
      //   BigInt(await provider.getBalance(owner.address))
      // ).to.be.closeTo(userFinalBalance);
    });

    it('checks if user wins the Bet then winning amount should be transfered to user account (rollOver)', async () => {
      const amount = ethers.utils.parseEther('20');
      const sliderValue = 25;

      // before placing Bet
      userBalance = await provider.getBalance(owner.address);
      contractBalance = await dice.contractBalance();

      const TransactionplaceBet = await dice
        .connect(owner)
        .placeBet(sliderValue, true, { value: amount });
      await TransactionplaceBet.wait();

      // after placing Bet
      contractBalance = BigInt(contractBalance) + BigInt(amount);
      userBalance = BigInt(userBalance) - BigInt(amount);

      expect((await dice.contractBalance()).toString()).to.be.equal(
        contractBalance.toString()
      );

      // expect((await provider.getBalance(owner.address))).to.be.equal(userBalance);

      const requestId = await dice.requestId();

      const txFulFillRandomWords =
        await vRFCoordinatorV2Mock.fulfillRandomWords(requestId, dice.address);
      await txFulFillRandomWords.wait(1);

      const betId = await dice.requestIdToBetId(requestId);
      const bet = await dice.betIdToBets(betId);

      const winningAmt = bet.winningAmount;

      // check winning amount
      contractBalance -= BigInt(winningAmt);

      expect((await dice.contractBalance()).toString()).to.be.equal(
        contractBalance.toString()
      );

      const userFinalBalance = userBalance + BigInt(winningAmt);
      /* eslint no-console: "warn" */
      console.log('User Balance After Winning the bet :', userFinalBalance); // 10006961199710344892189n

      // expect(
      //   BigInt(await provider.getBalance(owner.address))
      // ).to.be.closeTo(userFinalBalance);
    });

    it('checks if user loose the Bet then no amount should be transfered to user account (rollOver)', async () => {
      const amount = ethers.utils.parseEther('20');
      const sliderValue = 95;

      // before placing Bet
      userBalance = await provider.getBalance(owner.address);
      contractBalance = await dice.contractBalance();

      const TransactionplaceBet = await dice
        .connect(owner)
        .placeBet(sliderValue, true, { value: amount });
      await TransactionplaceBet.wait();

      // after placing Bet
      contractBalance = BigInt(contractBalance) + BigInt(amount);
      userBalance = BigInt(userBalance) - BigInt(amount);

      expect((await dice.contractBalance()).toString()).to.be.equal(
        contractBalance.toString()
      );

      // expect((await provider.getBalance(owner.address))).to.be.equal(userBalance);

      const requestId = await dice.requestId();

      const txFulFillRandomWords =
        await vRFCoordinatorV2Mock.fulfillRandomWords(requestId, dice.address);
      await txFulFillRandomWords.wait(1);

      const betId = await dice.requestIdToBetId(requestId);
      const bet = await dice.betIdToBets(betId);

      const winningAmt = bet.winningAmount;

      // check winning amount
      contractBalance -= BigInt(winningAmt);

      expect((await dice.contractBalance()).toString()).to.be.equal(
        contractBalance.toString()
      );

      const userFinalBalance = userBalance + BigInt(winningAmt);

      /* eslint no-console: "warn" */
      console.log('User Balance After Loosing the bet :', userFinalBalance); // 10006961199710344892189n

      // expect(BigInt(await provider.getBalance(owner.address))).to.be.closeTo(userFinalBalance);
    });
  });
});
