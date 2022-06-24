const hre = require('hardhat')
// let corecollectionAddress;

async function main() {
  const DICE = await hre.ethers.getContractFactory('Dice')

  const dice = await DICE.deploy()

  await dice.deployed()

  console.log('Dice contract deployed to:', dice.address)
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
