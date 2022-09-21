const hre = require('hardhat');

async function main() {
    const RandomNumberConsumer = await hre.ethers.getContractFactory('RandomNumberConsumer');
    /** 
    * Network: Rinkeby
   * Chainlink VRF Coordinator address: 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B
   * LINK token address:                	0x01BE23585060835E02B77ef475b0Cc51aA1e0709
   * Key Hash: 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311
   */

    const randomNumberConsumer = await RandomNumberConsumer.deploy('0x01BE23585060835E02B77ef475b0Cc51aA1e0709', '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B', '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311');

    await randomNumberConsumer.deployed();

    console.log('Random Number Consumer contract deployed to:', randomNumberConsumer.address);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
