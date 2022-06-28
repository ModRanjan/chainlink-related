// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./VRFv2D100.sol";
import "hardhat/console.sol";
import './SafeMath.sol';

contract Dice {
    using SafeMath for uint256;

    address public owner;

    struct UserBet {
        // IERC20 betToken;
        address beterAddress;
        uint256 betAmount;
        uint8 sliderValue;
        uint256 multiplierPoint;
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
        uint256 _multiplierPoint,
        bool _updownStatus
    );

    /**
     *@dev Event emitted when random number is generated
     *
     *@param _player {address}
     *@param _randomValue {uint256} value on dice after rolling complete
     *
     */
    event DiceRolled(address indexed _player, uint256 indexed _randomValue);
    // event DiceLanded(uint256 indexed requestId, uint256 indexed result);

    modifier onlyOwner() {
        require(msg.sender == owner, "OnlyOwner methods called by non-owner.");
        _;
    }

    modifier isBetPlaced() {
        require(
            userBets[msg.sender].isBetPlaced == true,
            "Bet is not Placed by the player !"
        );
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
    function placeBet(
        address _player,
        uint8 _sliderValue,
        bool _updownStatus
    ) public payable {
        // Ensure that _amount should be greater than 0
        require(msg.value > 0, "Bet Value should be greater than 0");
        // Ensure that the _sliderValue is between 1-97
        if(_updownStatus)
        {
        require(
            _sliderValue > 4 && _sliderValue < 99,
            "Invalid Slider Value!!!"
        );
        }else{
        require(
            _sliderValue > 1 && _sliderValue < 97,
            "Invalid Slider Value!!!"
        );
        }
        // calculate multiplierPoint 
        uint256 multiplierPoint = calcMultiplier(_sliderValue, _updownStatus);

        // Create a new user bet for the sender (player)
        userBets[msg.sender] = UserBet(
            address(_player),
            msg.value,
            _sliderValue,
            multiplierPoint,
            0,
            _updownStatus,
            true
        );

        // console.log("From Contract userBets[msg.sender].beterAddress :", userBets[msg.sender].beterAddress);
        // console.log("From Contract userBets[msg.sender].betAmount :", userBets[msg.sender].betAmount);
        // console.log("From Contract userBets[msg.sender].sliderValue :", userBets[msg.sender].sliderValue); 
        // console.log("From Contract userBets[msg.sender].updownStatus :", userBets[msg.sender].updownStatus);

        // emit event
        emit BetPlaced(
            msg.sender,
            userBets[msg.sender].betAmount,
            userBets[msg.sender].sliderValue,
            userBets[msg.sender].multiplierPoint,
            userBets[msg.sender].updownStatus
        );
    }

    /**
     * @dev rollDice: Rolls the dice
     *
     * @param _player address of player
     *
     * Returns value of rolled dice
     */
    // function rollDice(address _player) external isBetPlaced returns (address) {
    function rollDice(address _player) external  {
        // Ensure that sender has already placed a bet
        // rolles the dice
        uint256 requestId = VRFv2SubscriptionManager(_player).requestRandomWords(msg.sender);
        console.log(requestId);

        // (gets the randomvalue)
        uint256 randomValue = VRFv2SubscriptionManager(_player).result(msg.sender);
        console.log(randomValue);

        // Toggle isBetPlaced for the sender's bet to False
        userBets[_player].isBetPlaced = false;

        emit DiceRolled(_player, randomValue);

        // call Winner()
        // address winnerAddress =  winner(_player, randomValue);

        // return winnerAddress;
    }

    function winner(address _player, uint256 _randomValue)
        view
        public
        returns (address)
    {
        uint8 sliderValue = userBets[_player].sliderValue;
        bool updownValue = userBets[_player].updownStatus;
        uint256 randomValue = _randomValue;

        
        // Check if sender has won.
        if (updownValue) {
            if (
                randomValue < 100 && randomValue > sliderValue
            ) {
                // set Wining Amount
            } else {
                //loss
            }
        } else {
            if (
                randomValue < sliderValue && randomValue > 0
            ) {
                // set Wining Amount
            } else {
                //loss
            }
        }
    }

    function calcMultiplier(uint8 _sliderValue, bool _updownStatus)
        internal
        pure
        returns (uint256)
    {
        uint256 multiplierPoint = 9850;

        if(_updownStatus){
            multiplierPoint = (multiplierPoint / (100 - _sliderValue));
        }
        else{
            multiplierPoint = (multiplierPoint / (_sliderValue - 1));
        }
           
        // console.log("from contract multiplier :", multiplierPoint/100);
       
        return multiplierPoint;
    }

    // Funds withdrawal to cover costs of dice operation.
    // function withdrawFunds(address beneficiary, uint withdrawAmount) external onlyOwner {
    //     require (withdrawAmount <= address(this).balance, "Increase amount larger than balance.");
    //     require (jackpotSize + lockedInBets + withdrawAmount <= address(this).balance, "Not enough funds.");
    //     sendFunds(beneficiary, withdrawAmount, withdrawAmount);
    // }
}
