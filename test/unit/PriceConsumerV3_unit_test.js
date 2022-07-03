const { assert } = require('chai');
const { ethers } = require('hardhat');

describe('PriceConsumer Unit Tests', async () => {
  let priceConsumerV3;
  let mockV3Aggregator;

  beforeEach(async () => {
    const price = '200000000000000000000';
    const PriceConsumerV3 = await ethers.getContractFactory('PriceConsumerV3');
    priceConsumerV3 = await PriceConsumerV3.deploy(
      '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82'
    );
    const MockV3Aggregator = await ethers.getContractFactory(
      'MockV3Aggregator'
    );
    mockV3Aggregator = await MockV3Aggregator.deploy(18, price);
  });

  describe('constructor', () => {
    it('sets the aggregator addresses correctly', async () => {
      const response = await priceConsumerV3.getPriceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });
  // The addresses here can be found in the chainlink docs
  // https://docs.chain.link/docs/ethereum-addresses

  describe('getLatestPrice', () => {
    it('should return the same value as the mock', async () => {
      const priceConsumerResult = await priceConsumerV3.getLatestPrice();
      const priceFeedResult = (await mockV3Aggregator.latestRoundData()).answer;
      assert.equal(priceConsumerResult.toString(), priceFeedResult.toString());
    });
  });
});
