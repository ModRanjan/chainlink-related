const { expect } = require('chai');
const LinkTokenABI = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]'

var chai = require('chai');
const BN = require('bn.js');
chai.use(require('chai-bn')(BN));


describe('VRF Integration Test', function () {
  let vRFConsumer;
  const LinkTokenAddress = 0x01BE23585060835E02B77ef475b0Cc51aA1e0709;
  const VRFCoordinatorAddress = 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B;
  const KeyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;

  beforeEach(async function () {
    const VRFConsumer = await ethers.getContractFactory('RandomNumberConsumerV1');

    vRFConsumer = await VRFConsumer.deploy();
    await vRFConsumer.deployed();
  });

  it('Should make a VRF request', async function () {

    const accounts = await ethers.getSigners()
    const signer = accounts[0]
    const linkTokenContract = new ethers.Contract('0x01BE23585060835E02B77ef475b0Cc51aA1e0709', LinkTokenABI, signer)


    var transferTransaction = await linkTokenContract.transfer(vRFConsumer.address, '1000000000000000000')
    await transferTransaction.wait()
    console.log('hash:' + transferTransaction.hash)

    let transaction = await vRFConsumer.getRandomNumber()
    let tx_receipt = await transaction.wait()
    const requestId = tx_receipt.events[2].topics[1]

    await new Promise(resolve => setTimeout(resolve, 90000))

    const result = await vRFConsumer.randomResult()
    console.log('result:' + new ethers.BigNumber.from(result._hex).toString())

    expect((new ethers.BigNumber.from(result._hex).toString())).to.be.a.bignumber.that.is.greaterThan(new ethers.BigNumber.from('0').toString())
  });
});