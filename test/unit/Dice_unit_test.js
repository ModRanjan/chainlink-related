const { expect, assert } = require('chai');
const { ethers } = require('hardhat');

describe('dice contract unit test', () => {
  let DICE;
  let dice;
  let owner;
  let signer1Ad;
  let signer2Ad;
  let signers;

  beforeEach(async () => {
    // Get the ContractFactory and Signers here.
    DICE = await ethers.getContractFactory('Dice');

    [owner, signer1Ad, signer2Ad, ...signers] = await ethers.getSigners();
    dice = await DICE.deploy();
    await dice.deployed();
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

  describe('# PlaceBet # Calculate Multiplier Point', () => {
    it('Check betAmount should be greater than 0', async () => {
      // Declaration : placeBet(uint8 _sliderValue, bool _updownStatus)

      const sliderValue = 51;

      await expect(
        dice
          .connect(signer1Ad)
          .placeBet(signer1Ad.address, sliderValue, false, {
            value: ethers.utils.parseEther('0'),
          })
      ).to.be.revertedWith('Bet Value should be greater than 0');
    });

    it('should check the valid sliderValue', async function () {
      const amount = ethers.utils.parseEther('0.001');

      await expect(
        dice
          .connect(signer1Ad)
          .placeBet(signer1Ad.address, 1, false, { value: amount })
      ).to.be.revertedWith('Invalid Slider Value!!!');

      await expect(
        dice
          .connect(signer1Ad)
          .placeBet(signer1Ad.address, 97, false, { value: amount })
      ).to.be.revertedWith('Invalid Slider Value!!!');

      await expect(
        dice
          .connect(signer1Ad)
          .placeBet(signer1Ad.address, 101, false, { value: amount })
      ).to.be.revertedWith('Invalid Slider Value!!!');

      await expect(
        dice
          .connect(signer1Ad)
          .placeBet(signer1Ad.address, 101, true, { value: amount })
      ).to.be.revertedWith('Invalid Slider Value!!!');

      await expect(
        dice
          .connect(signer1Ad)
          .placeBet(signer1Ad.address, 3, true, { value: amount })
      ).to.be.revertedWith('Invalid Slider Value!!!');
    });

    it('should assign correct values to structure userBets', async () => {
      const sliderValue = 51;

      const amount = ethers.utils.parseEther('0.001');

      await dice
        .connect(owner)
        .placeBet(owner.address, sliderValue, false, { value: amount });

      const userBets = await dice.userBets(owner.address);

      // console.log("userBets :",userBets)

      expect(userBets.betAmount).to.equal(amount);
      expect(userBets.sliderValue).to.equal(51);
      expect(userBets.updownStatus).to.equal(false);
    });

    it('should calculate correct multiplirePoint', async () => {
      const amount = ethers.utils.parseEther('0.001');
      await dice
        .connect(owner)
        .placeBet(owner.address, 3, false, { value: amount });

      let userBets = await dice.userBets(owner.address);

      expect(userBets.multiplier / 100).to.be.equal(49.25);

      await dice
        .connect(owner)
        .placeBet(owner.address, 52, false, { value: amount });
      userBets = await dice.userBets(owner.address);

      expect(userBets.multiplier / 100).to.be.equal(1.93);
      // console.log(userBets.multiplier)
      await dice
        .connect(owner)
        .placeBet(owner.address, 5, true, { value: amount });
      userBets = await dice.userBets(owner.address);

      expect(userBets.multiplier / 100).to.be.equal(1.03);

      await dice
        .connect(owner)
        .placeBet(owner.address, 52, true, { value: amount });
      userBets = await dice.userBets(owner.address);

      expect(userBets.multiplier / 100).to.be.equal(2.05);
    });

    it('Should emit BetPlaced event', async () => {
      const amount = ethers.utils.parseEther('0.01');

      await expect(
        dice
          .connect(signer1Ad)
          .placeBet(signer1Ad.address, 51, false, { value: amount })
      ).to.emit(dice, 'BetPlaced');
      // .withArgs(signer1Ad.address,amount,51, multiplier,false);
    });
  });
});
