require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-deploy');

require('dotenv').config();
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const KOVAN_RPC_URL = process.env.KOVAN_RPC_URL;
const ARBITRUM_RINKEBY_RPC_URL = process.env.ARBITRUM_Rinkeby_RPC_URL;
const PRIVATE_KEY1 = process.env.PRIVATE_KEY1;
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2;
const PRIVATE_KEY3 = process.env.PRIVATE_KEY3;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;

module.exports = {
  // defaultNetwork: 'rinkeby',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    rinkeby: {
      url: RINKEBY_RPC_URL,
      gas: 2100000,
      gasPrice: 8000000000,
      accounts: [PRIVATE_KEY1, PRIVATE_KEY2, PRIVATE_KEY3].filter(
        (x) => x !== undefined
      ),
      saveDeployments: true,
      chainId: 4,
    },
    arbitrumTestnet: {
      url: ARBITRUM_RINKEBY_RPC_URL,
      gas: 2100000,
      gasPrice: 8000000000,
      accounts: [PRIVATE_KEY1, PRIVATE_KEY2, PRIVATE_KEY3].filter(
        (x) => x !== undefined
      ),
      saveDeployments: true,
      chainId: 421611,
    },
    localhost: {
      chainId: 31337,
    },
    kovan: {
      url: KOVAN_RPC_URL || '',
      accounts: [PRIVATE_KEY1, PRIVATE_KEY2, PRIVATE_KEY3].filter(
        (x) => x !== undefined
      ),
      saveDeployments: true,
      chainId: 42,
    },
  },
  solidity: {
    compilers: [
      { version: '0.8.7' },
      { version: '0.6.6' },
      { version: '0.4.24' },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      mainnet: 'YOUR_ETHERSCAN_API_KEY',
      ropsten: 'YOUR_ETHERSCAN_API_KEY',
      rinkeby: ETHERSCAN_API_KEY,
      goerli: 'YOUR_ETHERSCAN_API_KEY',
      kovan: 'YOUR_ETHERSCAN_API_KEY',
      // binance smart chain
      bsc: 'YOUR_BSCSCAN_API_KEY',
      bscTestnet: 'YOUR_BSCSCAN_API_KEY',
      // huobi eco chain
      heco: 'YOUR_HECOINFO_API_KEY',
      hecoTestnet: 'YOUR_HECOINFO_API_KEY',
      // fantom mainnet
      opera: 'YOUR_FTMSCAN_API_KEY',
      ftmTestnet: 'YOUR_FTMSCAN_API_KEY',
      // optimistim
      optimisticEthereum: 'YOUR_OPTIMISTIC_ETHERSCAN_API_KEY',
      optimisticKovan: 'YOUR_OPTIMISTIC_ETHERSCAN_API_KEY',
      // polygon
      polygon: 'YOUR_POLYGONSCAN_API_KEY',
      polygonMumbai: 'YOUR_POLYGONSCAN_API_KEY',
      // arbitrum
      arbitrumOne: 'YOUR_ARBISCAN_API_KEY',
      arbitrumTestnet: ARBISCAN_API_KEY,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 3000000, // 3000 seconds max for running tests
  },
};
