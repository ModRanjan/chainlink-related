const { assert, expect } = require('chai');
const { ethers } = require('hardhat');
// const { expectRevert, balance } = require('@openzeppelin/test-helpers')

describe('RandomNumberConsumerV1 Unit Tests', () => {
  let vrfCoordinatorMock;
  let randomNumberConsumer;
  let linkToken;
  // let signer;
  /**
   * * Network: Rinkeby
   * Chainlink VRF Coordinator address: 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B
   * LINK token address:                	0x01BE23585060835E02B77ef475b0Cc51aA1e0709
   * Key Hash: 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311
   */

  const keyhash =
    '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311';

  beforeEach(async () => {
    // const accounts = await ethers.getSigners();
    // let signer = accounts[0];

    const VRFCoordinatorMock = await ethers.getContractFactory(
      'VRFCoordinatorMock'
    );

    const LinkTokenMock = await ethers.getContractFactory('LinkToken');

    const RandomNumberConsumer = await ethers.getContractFactory(
      'RandomNumberConsumer'
    );

    linkToken = await LinkTokenMock.deploy();

    vrfCoordinatorMock = await VRFCoordinatorMock.deploy(linkToken.address);

    randomNumberConsumer = await RandomNumberConsumer.deploy(
      linkToken.address,
      vrfCoordinatorMock.address,
      keyhash
    );
  });

  it('it revert without LINK', async () => {
    await expectRevert.unspecified(randomNumberConsumer.getRandomNumber());
  });

  it('Should successfully request a random number', async () => {
    const transferTransaction = await linkToken.transfer(
      randomNumberConsumer.address,
      '1000000000000000000'
    ); // ethers.utils.parseEther('0.1')
    await transferTransaction.wait();
    console.log('hash :', transferTransaction.hash);

    const transaction = await randomNumberConsumer.getRandomNumber();

    // console.log(transaction.receipt.rawLogs)
    const txReceipt = await transaction.wait();
    const requestId = txReceipt.events[2].topics[1];
    console.log('request ID: ', requestId);

    await expect(randomNumberConsumer.getRandomNumber()).to.emit(
      vrfCoordinatorMock,
      'RandomnessRequest'
    );
  });

  it('Should successfully request a random number and get a result', async () => {
    const transferTransaction = await linkToken.transfer(
      randomNumberConsumer.address,
      '1000000000000000000'
    ); // ethers.utils.parseEther('0.1')
    await transferTransaction.wait();
    console.log('hash :', transferTransaction.hash);

    const transaction = await randomNumberConsumer.getRandomNumber();

    // console.log(transaction.receipt.rawLogs)
    const txReceipt = await transaction.wait();
    const requestId = txReceipt.events[2].topics[1];
    console.log('request ID: ', requestId);

    const RandomNumber = await randomNumberConsumer.randomResult();
    console.log('Random Number: ', RandomNumber.toString());

    assert(
      RandomNumber.gt(ethers.constants.Zero),
      'First random number is greather than zero'
    );
  });

  // it('Should successfully fire event on callback', async function () {
  //   await new Promise(async (resolve, reject) => {
  //     randomNumberConsumer.once('ReturnedRandomness', async () => {
  //       console.log('ReturnedRandomness event fired!');
  //       const firstRandomNumber = await randomNumberConsumer.s_randomWords(0);
  //       const secondRandomNumber = await randomNumberConsumer.s_randomWords(
  //         1
  //       );
  //       // assert throws an error if it fails, so we need to wrap
  //       // it in a try/catch so that the promise returns event
  //       // if it fails.
  //       try {
  //         assert(firstRandomNumber.gt(ethers.constants.Zero));
  //         assert(secondRandomNumber.gt(ethers.constants.Zero));
  //         resolve();
  //       } catch (e) {
  //         reject(e);
  //       }
  //     });
  //     await randomNumberConsumer.getRandomNumber();
  //     const requestId = await randomNumberConsumer.s_requestId();
  //     vrfCoordinatorMock.fulfillRandomWords(
  //       requestId,
  //       randomNumberConsumer.address
  //     );
  //   });
  // });
});
