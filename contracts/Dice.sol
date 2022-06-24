// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./VRFv2D100.sol";
import "hardhat/console.sol";

contract Dice {
    address public owner;

    struct UserBet {
        // IERC20 betToken;
        address beterAddress;
        uint256 betAmount;
        uint8 sliderValue;
        uint256 winingAmount;
        bool updownStatus;
        bool isBetPlaced;
    }

    mapping(address => UserBet) public userBets;

    /**
     * @dev Event emitted when Bet is Placed
     * @param _player {address} address of the
     * @param _betAmount {uint256} amount to be bet
     * @param _sliderValue {uint8} value selected by the user on Slider
     * @param _updownStatus {bool} to check the rolleUnder or rollOver
     */
    event BetPlaced(
        address _player,
        uint256 _betAmount,
        uint8 _sliderValue,
        bool _updownStatus
    );

    /**
     *@dev Event emitted when random number is generated
     *@param value {uint256} value on dice after rolling complete
     */
    event DiceResult(uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "OnlyOwner methods called by non-owner.");
        _;
    }

    constructor() {
        // [OPTIONAL] Ensure that _nativeGameToken is valid
        // Store _nativeGameToken to contracts Storage

        owner = msg.sender;
    }

    /**
     *@dev placeBet is payble function which places the bet
     *@param _sliderValue {uint8} value chosen by player tgh slider
     *@param _updownStatus {bool} value is for checking either player want to rollunder or rollover
     */
    function placeBet(uint8 _sliderValue, bool _updownStatus) public payable {
        console.log("msg-sender :", msg.sender);
        console.log("slider value :", msg.value);
        console.log("slider value :", _sliderValue);
        console.log("updown status :", _updownStatus);
        // Ensure that _amount should be greater than 0
        require(msg.value > 0, "Bet Value should be greater than 0");
        // Ensure that the _sliderValue is between 1-97
        require(
            _sliderValue > 1 && _sliderValue < 97,
            "Slider Value is not exist !!!"
        );

        // Create a new user bet for the sender (player)
        userBets[msg.sender] = UserBet({
            beterAddress: msg.sender,
            betAmount: msg.value,
            sliderValue: _sliderValue,
            updownStatus: _updownStatus,
            winingAmount: 0,
            isBetPlaced: true
        });


        // transfers the amount from: (player) to : (contract)
        userBets[msg.sender].betAmount = msg.value;

        // emit event
        emit BetPlaced(
            msg.sender,
            userBets[msg.sender].betAmount,
            userBets[msg.sender].sliderValue,
            userBets[msg.sender].updownStatus
        );
    }

    
    function isBetPlaced() public view returns (bool) {

        require(
            userBets[msg.sender].isBetPlaced == true,
            "Bet is not Placed !"
        );

        return true;
    }

    /**
     * @dev rollDice: Rolls the dice
     *
     * @param _player address of player
     *
     * Returns value of rolled dice
     */
    function rollDice(address _player) external {
        // rolles the dice
        VRFv2D100(_player).rollDice(msg.sender);

        // gets the randomvalue
        uint256 randomValue = random(_player);

        if (userBets[_player].updownStatus) {
            if (
                randomValue < 100 && randomValue > userBets[_player].sliderValue
            ) {
                // set Wining Amount
            } else {
                //loss
            }
        } else {
            if (
                randomValue < userBets[_player].sliderValue && randomValue > 0
            ) {
                // set Wining Amount
            } else {
                //loss
            }
        }
        // TODO: Complete this
        // Ensure that sender has already placed a bet
        // Ensure that contract is able to send at least 6*betAmount Tokens on behalf of the user
        // Ensure that contract can send at least bet amount of Tokens on behalf of the sender

        // Toggle isBetPlaced for the sender's bet to False

        // Roll the dice

        // Check if sender has won.

        // If won send tokens bet amount*6 from owner to ender
        // Otherwise send bet amount of tokens from sender to owner
        // Return if the sender has won or not and the roll of the dice
    }

    
    function random(address _player) private returns (uint256) {
        uint256 result = VRFv2D100(_player).result(msg.sender);

        emit DiceResult(result);
        return result;
    }

    // Funds withdrawal to cover costs of dice operation.
    // function withdrawFunds(address beneficiary, uint withdrawAmount) external onlyOwner {
    //     require (withdrawAmount <= address(this).balance, "Increase amount larger than balance.");
    //     require (jackpotSize + lockedInBets + withdrawAmount <= address(this).balance, "Not enough funds.");
    //     sendFunds(beneficiary, withdrawAmount, withdrawAmount);
    // }
}
