const hre = require('hardhat');

async function main() {
  const VRF = await hre.ethers.getContractFactory('VRFv2D100');

  const vrf = await VRF.deploy();

  await vrf.deployed();
  console.log('VRFv2D100 contract deployed to:', vrf.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
