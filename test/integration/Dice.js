const { expect, assert } = require('chai');
const { ethers } = require('hardhat');

describe('dice contract', () => {
  let DICE;
  let dice;
  let owner;
  let signer1Ad;
  // let signer2Ad;
  // let signers;

  beforeEach(async () => {
    // Get the ContractFactory and Signers here.
    DICE = await ethers.getContractFactory('Dice');

    // [owner, signer1Ad, signer2Ad, ...signers] = await ethers.getSigners();
    [owner, signer1Ad] = await ethers.getSigners();
    dice = await DICE.deploy();
  });

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

  it('roll Dice', async () => {
    await dice.getRandomNum(signer1Ad.address);
  });

  //     it('Check random number', async () => {
  //       const rollDice = await dice.rollDice(addr1.address)
  // const reciept= rollDice.wait()

  //     })
});
