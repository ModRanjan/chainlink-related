// SPDX-License-Identifier: MIT
// An example of a consumer contract that also owns and manages the subscription
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract VRFv2SubscriptionManager is VRFConsumerBaseV2 {
  uint8 private constant ROLL_IN_PROGRESS = 101;
  //  0x56b8347F053F7EfC9b9015399fd36a604f92135A

  VRFCoordinatorV2Interface COORDINATOR;
  LinkTokenInterface LINKTOKEN;

  // Rinkeby coordinator. For other networks,
  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;

  // Rinkeby LINK token contract. For other networks, see
  // https://docs.chain.link/docs/vrf-contracts/#configurations
  address link_token_contract = 0x01BE23585060835E02B77ef475b0Cc51aA1e0709;

  // The gas lane to use, which specifies the maximum gas price to bump to.
  // For a list of available gas lanes on each network,
  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  bytes32 keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;

  // A reasonable default is 100000, but this value could be different
  // on other networks.
  uint32 callbackGasLimit = 100000;

  // The default is 3, but you can set this higher.
  uint16 requestConfirmations = 3;

  // For this example, retrieve 2 random values in one request.
  // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
  uint32 numWords =  1;

  // Storage parameters
  uint8 public randomWord;
  uint256 public requestId;
  uint64 public subscriptionId;
  address public owner;

  // map rollers to requestIds        requestIdToAddress
  mapping(uint256 => address) private s_rollers;
  // map vrf results to rollers         addressToRandomWord
  mapping(address => uint256) private s_results;

  event DiceRolled(uint256 indexed requestId, address indexed roller);
  event DiceLanded(uint256 indexed requestId, uint256 indexed result);

  constructor() VRFConsumerBaseV2(vrfCoordinator) {
    COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    LINKTOKEN = LinkTokenInterface(link_token_contract);
    owner = msg.sender;
    //Create a new subscription when you deploy the contract.
    createNewSubscription();
  }

  // Assumes the subscription is funded sufficiently.
  function requestRandomWords(address _roller) external returns (uint256) {
// require(LINKTOKEN.balanceOf(address(this)) >= (0.1 * 10 ** 18), "Not enough LINK - fill contract with faucet");

    // Will revert if subscription is not set and funded.
    uint256 tempRequestId = COORDINATOR.requestRandomWords(
      keyHash,
      subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );

    s_rollers[requestId] = _roller;
    s_results[_roller] = ROLL_IN_PROGRESS;

    // Store the latest requestId
    requestId = tempRequestId;

    // emit 
    emit DiceRolled(requestId, _roller);

    return requestId;
  }

  function fulfillRandomWords(
    uint256, /* requestId */
    uint256[] memory randomWords
  ) internal override {
    uint256 randomRange = (randomWords[0] % 100) + 1;

    randomWord = uint8(randomRange);

    s_results[s_rollers[requestId]] = randomRange ;
    
    emit DiceLanded(requestId, randomRange );
  }

  function result(address player) public returns (uint256) {
    require(s_results[player] != 0, 'Dice not rolled');
    require(s_results[player] != ROLL_IN_PROGRESS, 'Roll in progress');
    randomWord = 0;
    return s_results[player];
   }

  // Create a new subscription when the contract is initially deployed.
  function createNewSubscription() private onlyOwner {
    subscriptionId = COORDINATOR.createSubscription();
    // Add this contract as a consumer of its own subscription.
    COORDINATOR.addConsumer(subscriptionId, address(this));
  }

  // Assumes this contract owns link.
  // 1000000000000000000 = 1 LINK
  function topUpSubscription(uint256 amount) external onlyOwner {
    LINKTOKEN.transferAndCall(address(COORDINATOR), amount, abi.encode(subscriptionId));
  }

  function addConsumer(address consumerAddress) external onlyOwner {
    // Add a consumer contract to the subscription.
    COORDINATOR.addConsumer(subscriptionId, consumerAddress);
  }

  function removeConsumer(address consumerAddress) external onlyOwner {
    // Remove a consumer contract from the subscription.
    COORDINATOR.removeConsumer(subscriptionId, consumerAddress);
  }

  function cancelSubscription(address receivingWallet) external onlyOwner {
    // Cancel the subscription and send the remaining LINK to a wallet address.
    COORDINATOR.cancelSubscription(subscriptionId, receivingWallet);
    subscriptionId = 0;
  }

  // Transfer this contract's funds to an address.
  // 1000000000000000000 = 1 LINK
  function withdraw(uint256 amount, address to) external onlyOwner {
    LINKTOKEN.transfer(to, amount);
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }
}
