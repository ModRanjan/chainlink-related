require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config()

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const KOVAN_RPC_URL = process.env.KOVAN_RPC_URL
const PRIVATE_KEY1 = process.env.PRIVATE_KEY1
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2
const PRIVATE_KEY3 = process.env.PRIVATE_KEY3
module.exports = {
  // defaultNetwork: 'rinkeby',
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    rinkeby: {
      url: RINKEBY_RPC_URL,
      gas: 2100000,
      gasPrice: 8000000000,
      accounts: [PRIVATE_KEY1, PRIVATE_KEY2, PRIVATE_KEY3],
    },
    kovan: {
      url: '',
      accounts: [PRIVATE_KEY1, PRIVATE_KEY2, PRIVATE_KEY3],
    },
  },
  solidity: {
    compilers: [{ version: "0.8.4" }, { version: "0.8.7" }, { version: "0.6.0" }],
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
    apiKey: "9VINF6ZIZ7X66N8XGHAZENWC5J9BW81HY6",
  },
  mocha: {
    timeout: 3000000
  }
};
