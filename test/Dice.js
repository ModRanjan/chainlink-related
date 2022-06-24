const { expect, assert } = require('chai')
const { ethers } = require('hardhat')

describe('dice contract', function () {
  let DICE
  let dice
  let owner
  let signer1Ad, signer2Ad
  let signers

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    DICE = await ethers.getContractFactory('Dice');

    [owner, addr1, addr2] = await ethers.getSigners();
    // console.log("ownwer address",owner.address);
    // console.log("addr1 address",addr1.address);
    // console.log("addr2 address",addr2.address);
    dice = await DICE.deploy()

  })

 
    it('deploys successfully', async () => {
    
      const address = await dice.address

      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('Should set the right owner', async () => {
      expect(await dice.owner()).to.equal(owner.address)
    })
 
    it('Check betAmount should be greater than 0', async () => {
      // Declaration : placeBet(uint8 _sliderValue, bool _updownStatus)
      let amount = ethers.utils.parseEther('0.001');
      let sliderValue = 51;
      let updownStatus = new Boolean(false);
      

      console.log(ethers.utils.parseEther('0.00'))
      await expect(
        dice
        .connect(addr1)
        .placeBet( sliderValue, updownStatus,{value: ethers.utils.parseEther('0.1')}))
        .to.be.revertedWith('Bet Value should be greater than 0')


      // await dice
      // .connect(addr1)
      // .placeBet(sliderValue, updownStatus,{value: ethers.utils.parseEther('0.001')})
      // .to.be.revertedWith('Bet Value should be greater than 0')


    })

    // it('sliderValue should not be out-off range (range:1-97)', async function () {
      
      // Declaration : placeBet(uint8 _sliderValue, bool _updownStatus)
    //   let amount = ethers.utils.parseEther('0.001');
    //   let sliderValue = 1;
    //   let updownStatus = new Boolean(false);

    //   await dice.connect(addr1)

    //   await expect(
    //     dice
    //     .placeBet(amount, sliderValue, updownStatus))
    //     .to.be.revertedWith('Slider Value is not exist !!!')
    // })
    // it('should assign correct values to structure userBets', async () => {
    //   await dice.connect(addr1).placeBet(ethers.utils.parseEther('0.001'), 51, false,{value:"ethers.utils.parseEther('0.001')"});

    //   const userBets = await dice.userBets(addr1.address);

    //   expect(userBets.betAmount).to.equal(ethers.utils.parseEther('0.001'));
    //   expect(userBets.sliderValue).to.equal(51);
    //   expect(userBets.updownStatus).to.equal(false);
      
    // })

    //     it('Should emit BetPlaced event', async () => {



    //       const result = await dice.placeBet(51, false, { value: ethers.utils.parseEther('1') })

    //       console.log(result.logs)
    //       // .to.emit(vrf, 'BetPlaced')
    //       // .withArgs('0x30A7Be577A2182bF7690fD7D84ce8833EEF8d07A', 1, 51, 0)
    //       // const reciept = await tx.wait()
    //       // const events = reciept.events.find(
    //       //   (event) => event.event === 'ItemListed'
    //       // )
    //       // ;[player, betAmount, sliderValue, _updownStatus] = events.args
    //       // expect(_price).to.equal(ethers.utils.parseUnits('1', 'ether'))
    //     })
  
})
