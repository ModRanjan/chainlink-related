const { expect, assert } = require('chai')
const { ethers } = require('hardhat')

describe('dice contract', function () {
  let DICE
  let dice
  let owner
  let signer1Ad, signer2Ad
  let signers

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    DICE = await ethers.getContractFactory('Dice');

    [owner, addr1, addr2] = await ethers.getSigners();
    // console.log("ownwer address",owner.address);
    // console.log("addr1 address",addr1.address);
    // console.log("addr2 address",addr2.address);
    dice = await DICE.deploy()

  })

 
    it('deploys successfully', async () => {
    
      const address = await dice.address

      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('Should set the right owner', async () => {
      expect(await dice.owner()).to.equal(owner.address)
    })
 
    it('roll Dice', async () => {
     await dice.getRandomNum(addr1.address)
    })

//     it('Check random number', async () => {
//       const rollDice = await dice.rollDice(addr1.address)
// const reciept= rollDice.wait()

//     })
})
