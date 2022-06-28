const { expect } = require('chai')
const { ethers } = require('hardhat')

// All Mocha functions are available in the global scope.
describe('VRFv2D100 contract', function () {
  let VRF
  let vrf
  const owner = "0x30A7Be577A2182bF7690fD7D84ce8833EEF8d07A";

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    VRF = await ethers.getContractFactory('VRFv2D100')

    const subscriptionId = 6846
    vrf = await VRF.deploy(subscriptionId)
  })

  it('Should set the right owner', async function () {
    // console.log(vrf.s_owner())
    expect(await vrf.s_owner()).to.equal(
      ethers.utils.getAddress(owner)
    )
  })

  // it('Should make a VRF request', async function () {

  //   const accponts = await ethers.getSigners()

  //   const linkTokenContract = 0x01be23585060835e02b77ef475b0cc51aa1e0709

  //   const ownerBalance = await hardhatToken.balanceOf(owner.address)
  //   expect(await hardhatToken.totalSupply()).to.equal(ownerBalance)
  // })
})
