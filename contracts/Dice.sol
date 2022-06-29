// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./VRFv2D100.sol";
import "hardhat/console.sol";
import "./SafeMath.sol";

contract Dice {
    using SafeMath for uint256;

    address public owner;

    struct UserBet {
        // IERC20 betToken;
        address beterAddress;
        uint256 betAmount;
        uint8 sliderValue;
        uint256 multiplier;
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
     * @dev Event emitted when random number is generated
     *
     * @param _player {address}
     * @param _requestId {uint256}
     * @param _randomValue {uint256} value on dice after rolling complete
     *
     */
    event DiceRolled(
        address indexed _player,
        uint256 _requestId,
        uint256 indexed _randomValue
    );
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
        if (_updownStatus) {
            require(
                _sliderValue > 4 && _sliderValue < 99,
                "Invalid Slider Value!!!"
            );
        } else {
            require(
                _sliderValue > 1 && _sliderValue < 97,
                "Invalid Slider Value!!!"
            );
        }
        // calculate multiplierPoint
        uint256 _multiplier = calcMultiplier(_sliderValue, _updownStatus);

        // Create a new user bet for the sender (player)
        userBets[msg.sender] = UserBet(
            address(_player),
            msg.value,
            _sliderValue,
            _multiplier,
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
            msg.value,
            _sliderValue,
            _multiplier,
            _updownStatus
        );
    }

    /**
     * @dev rollDice: Rolls the dice
     *
     * @param _player address of player
     */
    function rollDice(address _player)
        external
        returns (uint256 winningAmount)
    {
        // Ensure that sender has already placed a bet

        // rolles the dice (get requestId by calling VRFv2D100 contract's function named getRandomWords)
        uint256 requestId = VRFv2D100(_player).getRandomWords(msg.sender);
        console.log(requestId);

        // randonValue  (gets the randomvalue by calling VRFv2D100 contract's function named result)
        uint256 randomValue = VRFv2D100(_player).result(requestId);
        console.log(randomValue);

        // Toggle isBetPlaced for the sender's bet to False
        userBets[_player].isBetPlaced = false;

        emit DiceRolled(_player, requestId, randomValue);

        // call Winner()
        uint256 winnerAmount = winner(_player, randomValue);

        return winnerAmount;
    }

    function winner(address _player, uint256 _randomValue)
        public
        returns (uint256 winningValue)
    {
        uint8 sliderValue = userBets[_player].sliderValue;
        bool updownValue = userBets[_player].updownStatus;
        uint256 betAmount = userBets[_player].betAmount;
        uint256 multiplier = userBets[_player].multiplier;
        uint256 randomValue = _randomValue;

        // Check if sender has won.
        if (updownValue) {
            if (randomValue <= 100 && randomValue >= sliderValue) {
                // set Wining Amount
                winningValue = userBets[_player].winingAmount += multiplier * betAmount;
                return winningValue;
            } else {
                //loss
                return winningValue;
            }
        } else {
            if (randomValue <= sliderValue && randomValue > 0) {
                // set Wining Amount
                winningValue = userBets[_player].winingAmount += multiplier * betAmount;
                return winningValue;
            } else {
                //loss
                return winningValue;
            }
        }
    }

    function calcMultiplier(uint8 _sliderValue, bool _updownStatus)
        internal
        pure
        returns (uint256)
    {
        uint256 multiplierPoint = 9850;

        if (_updownStatus) {
            multiplierPoint = (multiplierPoint / (100 - _sliderValue));
        } else {
            multiplierPoint = (multiplierPoint / (_sliderValue - 1));
        }

        // console.log("from contract multiplier :", multiplierPoint/100);

        return multiplierPoint;
    }

    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Provide liquidity to the contract (this function not neccessary)
    function provideLiquidity() payable external {
    }

    function withdrawlFunds(uint256 _withdrawlAmount)
        public returns(string memory _msg)
    {
        require(
            _withdrawlAmount <= address(this).balance,
            "Sorry, Contract doesn't have sufficient Balance."
        );
        require(
            _withdrawlAmount <= userBets[msg.sender].winingAmount,
            "Sorry, Withdrawl amount is greater than your winning balance."
        );
        payable(msg.sender).transfer(_withdrawlAmount);
        userBets[msg.sender].winingAmount = userBets[msg.sender].winingAmount - _withdrawlAmount;

        return "Your withdrawl is successfull :)";
    }
}
