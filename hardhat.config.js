require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'rinkeby',
  networks: {
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/nib39M-wdq7B-VOV6fC3Q3ojkJ85GNyj',
      gas: 2100000, 
      gasPrice: 8000000000,
      accounts: [
        '468c3a5d4f5fa32e815365a57283b9fafc9f003095a783ac61a85cc2e3d64143', '4d01a96ad8d5a9b0cac5e5129a52ba2fee0a27472548ca20fdaa6f2e95f659aa',
        '6fc69d6db087284833ee8ba760c35f113b94afaa86860807f464aaa98d75918a'
      ],
    },
  },
  solidity: {
    version: '0.8.4',
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
    apiKey: '9VINF6ZIZ7X66N8XGHAZENWC5J9BW81HY6',
  },
}
