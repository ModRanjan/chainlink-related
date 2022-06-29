const hre = require('hardhat')
// let corecollectionAddress;

async function main() {
  const VRF = await hre.ethers.getContractFactory('VRFv2SubscriptionManager')

  const vrf = await VRF.deploy()

  await vrf.deployed()
  console.log('VRF deployed to:', vrf.address)
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
