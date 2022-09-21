const { assert } = require("chai")
const { network, ethers } = require("hardhat")



describe("RandomNumberConsumerV2 Integration Tests", async function () {
  let randomNumberConsumerV2

  before(async () => {
    // const RandomNumberConsumerV2 = await ethers.getContractFactory("RandomNumberConsumerV2");

    // randomNumberConsumerV2 = await RandomNumberConsumerV2.deploy(6643, '0x6168499c0cFfCaCD319c818142124B7A15E857ab', '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc')
    // await randomNumberConsumerV2.deployed();
    // console.log("RandomNumberConsumerV2 deployed to :", randomNumberConsumerV2.address);
    randomNumberConsumerV2 = await ethers.getContractAt("0x7041275f48c0D59a0BdB5cf9A08B2486309fD602")

  })

  afterEach(async function () {
    randomNumberConsumerV2.removeAllListeners()
  })

  // We can't use an arrow functions here because we need to use `this`. So we need
  // to use `async function() {` as seen.
  it("Our event should successfully fire event on callback", async function () {
    this.timeout(300000) // wait 300 seconds max
    // we setup a promise so we can wait for our callback from the `once` function
    await new Promise(async (resolve, reject) => {
      // setup listener for our event
      randomNumberConsumerV2.once("ReturnedRandomness", async () => {
        console.log("ReturnedRandomness event fired!")
        const firstRandomNumber = await randomNumberConsumerV2.s_randomWords(0)
        const secondRandomNumber = await randomNumberConsumerV2.s_randomWords(1)
        // assert throws an error if it fails, so we need to wrap
        // it in a try/catch so that the promise returns event
        // if it fails.
        try {
          assert(
            firstRandomNumber.gt(ethers.constants.Zero),
            "First random number is greather than zero"
          )
          assert(
            secondRandomNumber.gt(ethers.constants.Zero),
            "Second random number is greather than zero"
          )
          resolve()
        } catch (e) {
          reject(e)
        }
      })

      await randomNumberConsumerV2.requestRandomWords()
    })
  })
})
