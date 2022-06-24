const { expect } = require('chai')
const { ethers } = require('hardhat')
const LinkTokenABI =
  '[{"constant": true,"inputs": [],"name": "name","outputs": [{"name": "","type": "string"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_spender","type": "address"},{"name": "_value","type": "uint256"}],"name": "approve","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability"nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "totalSupply","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs":{"name": "_fro"type": "address"},{"name": "_to","type": "address"},{"name": "_value","type": "uint256"}],"name": "transferFrom","outputs": [{"name": "type": "bool"}],"payable": false,"stateMutability"nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "decimals","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_to","type": "address"},{"name": "_value","type": "uint256"},{"name": "_data","type": "bytes"}],"name": "transferAndCall","outputs": [{"name": "success","type"bool"}],"payable": false,"stateMutability"nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "_spender","type": "address"},{"name": "_subtractedValue","type": "uint256"}],"name": "decreaseApproval","outputs": [{"name": "success","type": "bool"}],"payable": false,"stateMutabilit"nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "_owner","type": "address"}],"name": "balanceOf","outputs": [{"name": "balance","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "symbol","outputs": [{"name": "","type": "string"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_to","type": "address"},{"name": "_value","type": "uint256"}],"name": "transfer","outputs": [{"name": "success","type": "bool"}],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "_spender","type": "address"},{"name": "_addedValue","type": "uint256"}],"name": "increaseApproval","outputs": [{"name": "success","type": "bool"}],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "_owner","type": "address"},{"name": "_spender","type": "address"}],"name": "allowance","outputs": [{"name": "remaining","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"inputs": [],"payable": false,"stateMutability"nonpayable","type": "constructor"},{"anonymous": false,"inputs": [{"indexed": true,"name": "from","type": "address"},{"indexed": true,"name": "to","type": "address"},{"indexed": false,"name": "value","type": "uint256"},{"indexed": false,"name": "data","type": "bytes"}],"name": "Transfer","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "owner","type": "address"},{"indexed": true,"name": "spender","type": "address"},{"indexed": false,"name": "value","type": "uint256"}],"name": "Approval","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "from","type": "address"},{"indexed": true,"name": "to","type": "address"},{"indexed": false,"name": "value","type": "uint256"}],"name": "Transfer","type": "event"}]'

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
