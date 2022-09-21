// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import 'hardhat/console.sol';

contract Dice is VRFConsumerBaseV2, Ownable {
  VRFCoordinatorV2Interface COORDINATOR;
  LinkTokenInterface LINKTOKEN;

  uint256 private constant ROLL_IN_PROGRESS = 101;
  uint256 private constant MULTIPLIER_POINT = 9850;
  uint32 private constant CALL_BACK_GAS_LIMIT = 100000;
  bytes32 private keyHash;
  uint16 requestConfirmations = 3;
  uint32 numWords = 1;
  uint256 public requestId;
  uint64 public vrfSubscriptionId;

  struct UserBet {
    address beterAddress;
    uint256 betAmount;
    uint8 sliderValue;
    uint256 multiplier;
    uint256 randomNumber;
    uint256 winningAmount;
    bool isRollOver; // isRollOver {true} means user wants to rollOver
  }
  uint256 private currentBetId;

  mapping(uint256 => UserBet) public betIdToBets;
  mapping(uint256 => uint256) public requestIdToBetId;

  event BetPlaced(
    uint256 _betId,
    uint256 _betAmount,
    uint8 _sliderValue,
    uint256 _multiplier,
    bool _isRollOver
  );

  event diceRolled(uint256 _betId, uint256 _requestId, uint256 _randomValue);

  event Received(address _sender, uint256 indexed _message);

  /**
   * @notice Constructor inherits VRFConsumerBaseV2
   *
   * @dev NETWORK: RINKEBY
   *
   * @param _vrfCoordinator {address} - coordinator, check https://docs.chain.link/docs/vrf-contracts/#configurations
   * @param _keyHash {bytes32} - the gas lane to use, which specifies the maximum gas price to bump to
   *
   * Network: Rinkeby
   * Chainlink VRF Coordinator address: 0x6168499c0cFfCaCD319c818142124B7A15E857ab;
   * LINK token address:                	0x01BE23585060835E02B77ef475b0Cc51aA1e0709;
   * Key Hash: 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
   */
  constructor(
    address _linkToken,
    address _vrfCoordinator,
    bytes32 _keyHash
  ) VRFConsumerBaseV2(_vrfCoordinator) {
    COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
    LINKTOKEN = LinkTokenInterface(_linkToken);

    keyHash = _keyHash;

    //Create a new subscription when you deploy the contract.
    createNewSubscription();
  }

  function placeBet(uint8 _sliderValue, bool _isRollOver) public payable {
    require(msg.value > 0, 'Bet Value should be greater than 0');

    if (_isRollOver) {
      require(
        _sliderValue > 4 && _sliderValue < 100,
        'Invalid Slider Value!!!'
      );
    } else {
      require(_sliderValue > 1 && _sliderValue < 97, 'Invalid Slider Value!!!');
    }

    uint256 _multiplier = _calcMultiplier(_sliderValue, _isRollOver);
    currentBetId = _inc(currentBetId);

    betIdToBets[currentBetId] = UserBet({
      beterAddress: msg.sender,
      betAmount: msg.value,
      sliderValue: _sliderValue,
      multiplier: _multiplier,
      randomNumber: 0,
      winningAmount: 0,
      isRollOver: _isRollOver
    });

    emit BetPlaced(
      currentBetId,
      msg.value,
      _sliderValue,
      _multiplier,
      _isRollOver
    );

    requestId = COORDINATOR.requestRandomWords(
      keyHash,
      vrfSubscriptionId,
      requestConfirmations,
      CALL_BACK_GAS_LIMIT,
      numWords
    );

    requestIdToBetId[requestId] = currentBetId;
  }

  function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords)
    internal
    override
  {
    uint256 randomValueBtwRange = (_randomWords[0] % 100) + 1;
    uint256 _betId = requestIdToBetId[_requestId];

    betIdToBets[_betId].randomNumber = randomValueBtwRange;

    _checkWinner(_requestId);
    emit diceRolled(_betId, _requestId, randomValueBtwRange);
  }

  function _calcMultiplier(uint8 _sliderValue, bool _isRollOver)
    internal
    pure
    returns (uint256)
  {
    if (_isRollOver) {
      return (MULTIPLIER_POINT / (100 - _sliderValue));
    } else {
      return (MULTIPLIER_POINT / (_sliderValue - 1));
    }
  }

  function _checkWinner(uint256 _requestId) internal {
    uint256 _winningAmount;
    uint256 betId = requestIdToBetId[_requestId];
    UserBet memory bet = betIdToBets[betId];

    uint256 _multiplier = bet.multiplier;
    uint256 _sliderValue = bet.sliderValue;
    uint256 _randomNumber = bet.randomNumber;

    if (bet.isRollOver && _randomNumber >= _sliderValue) {
      _winningAmount = (bet.betAmount * _multiplier) / 100;

      betIdToBets[betId].winningAmount = _winningAmount;
    } else if ((!bet.isRollOver) && _randomNumber <= _sliderValue) {
      _winningAmount = (bet.betAmount * _multiplier) / 100;

      betIdToBets[betId].winningAmount = _winningAmount;
    }

    require(
      contractBalance() >= _winningAmount,
      'Sorry, Contract has not Enough Balance'
    );
    payable(bet.beterAddress).transfer(_winningAmount);
  }

  function contractBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function transfer(address _reciever) public payable {
    require(msg.value >= 0, 'value Should be greater than 0!');
    emit Received(msg.sender, msg.value);
    return payable(_reciever).transfer(msg.value);
  }

  function withdrawal(address _receiver, uint256 _amount) public onlyOwner {
    require(
      contractBalance() >= _amount,
      'Sorry, Contract has not Enough Balance'
    );
    payable(_receiver).transfer(_amount);
  }

  function _inc(uint256 index) private pure returns (uint256) {
    unchecked {
      return index + 1;
    }
  }

  receive() external payable {
    emit Received(msg.sender, msg.value);
  }

  // Create a new subscription when the contract is initially deployed.
  function createNewSubscription() private onlyOwner {
    // Create a subscription with a new subscription ID.
    address[] memory consumers = new address[](1);
    consumers[0] = address(this);
    vrfSubscriptionId = COORDINATOR.createSubscription();
    // Add this contract as a consumer of its own subscription.
    COORDINATOR.addConsumer(vrfSubscriptionId, consumers[0]);
  }
}

/**
 *  function requestRandomWords() public returns (uint256 _requestId) {
    // Will revert if subscription is not set and funded.
    requestId = COORDINATOR.requestRandomWords(
      keyHash,
      vrfSubscriptionId,
      requestConfirmations,
      CALLBACK_GAS_LIMIT,
      numWords
    );

    requestIdToAddress[requestId] = msg.sender;
    requestIdToRandomWords[requestId] = ROLL_IN_PROGRESS;

    emit RequestedRandomWords(requestId, msg.sender);
    return requestId;
  }

  function fulfillRandomWords(uint256 _requestId, uint256[] memory randomWords)
    internal
    override
  {
    uint256 d100Value = (randomWords[0] % 100) + 1;
    requestIdToRandomWords[_requestId] = d100Value;

    emit ReturnedRandomness(_requestId, d100Value);
  }

  function result(uint256 _requestId) public view returns (uint256) {
    require(
      requestIdToRandomWords[_requestId] != 0,
      'RandomWords not requested !!!'
    );
    require(
      requestIdToRandomWords[_requestId] != ROLL_IN_PROGRESS,
      'Roll in progress !!!'
    );
    return (requestIdToRandomWords[_requestId]);
  }

  

  function placeBet(uint8 _sliderValue, bool _isRollOver) public payable {
    // Ensure that _amount should be greater than 0
    require(msg.value > 0, 'Bet Value should be greater than 0');
    // Ensure that the _sliderValue is between 1-97
    if (_isRollOver) {
      require(_sliderValue > 4 && _sliderValue < 99, 'Invalid Slider Value!!!');
    } else {
      require(_sliderValue > 1 && _sliderValue < 97, 'Invalid Slider Value!!!');
    }
    // calculate MULTIPLIER_POINT
    uint256 _multiplier = calcMultiplier(_sliderValue, _isRollOver);
    // console.log('form Contract multiplier :', _multiplier);

    // Create a new user bet for the sender (player)
    userBets[msg.sender] = UserBet({
      beterAddress: msg.sender,
      betAmount: msg.value,
      sliderValue: _sliderValue,
      multiplier: _multiplier,
      winingAmount: 0,
      isRollOver: _isRollOver,
      isBetPlaced: true
    });

    // console.log('From Contract userBets[msg.sender].beterAddress :'userBets[msg.sender].beterAddress);
    // console.log('From Contract userBets[msg.sender].betAmount :',userBets[msg.sender].betAmount);
    // console.log('From Contract userBets[msg.sender].sliderValue :',userBets[msg.sender].sliderValue);
    // console.log('From Contract userBets[msg.sender].isRollOver :', userBets[msg.sender].isRollOver );

    // emit event
    emit BetPlaced(
      msg.sender,
      msg.value,
      _sliderValue,
      _multiplier,
      _isRollOver
    );

    // rolles the dice (get requestId by calling requestRandomWords )
    uint256 requestId = requestRandomWords();
    console.log(requestId);

    // randonValue  (gets the randomvalue by calling function named result)
    // uint256 randomValue = result(requestId);
    // console.log(randomValue);

    // Toggle isBetPlaced for the sender's bet to False
    // userBets[msg.sender].isBetPlaced = false;

    // emit DiceRolled(msg.sender, requestId, randomValue);
    // get winner
  }

  function winner(address _player, uint256 _randomValue)
    public
    returns (uint256 winningValue)
  {
    uint8 sliderValue = userBets[_player].sliderValue;
    bool updownValue = userBets[_player].isRollOver;
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

  function calcMultiplier(uint8 _sliderValue, bool _isRollOver)
    internal
    pure
    returns (uint256)
  {
    if (_isRollOver) {
      return (MULTIPLIER_POINT / (100 - _sliderValue));
    } else {
      return (MULTIPLIER_POINT / (_sliderValue - 1));
    }

    // console.log("from contract multiplier :", MULTIPLIER_POINT/100);
  }

 */
