
// SPDX-License-Identifier: MIT;
pragma solidity >=0.5.0 <0.9.0;
import "hardhat/console.sol";

contract SupplyChain {
  address owner;

  uint skuCount;

  enum State {
    Unassigned,
    ForSale, 
    Sold, 
    Shipped
  }

  struct Item {
    string name;
    uint sku;
    uint price;
    State state;
    address seller;
    address buyer;
  }

  event ForSale(uint skuCount, uint timestamp);
  event Sold(uint skuCount, uint timestamp);
  event Shipped(uint skuCount, uint timestamp);
  

  mapping(uint => Item) items;
  
  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this function");
    _;
  }

  modifier verifyCaller(address _account) {
    require(msg.sender == _account, 'unauthorized to ship');
    _;
  }

  modifier paidEnough(uint _amount) {
    require(msg.value >= _amount, 'insufficient payment');
    _;
  }

  modifier forSale(uint _sku) {
    require(items[_sku].state == State.ForSale, 'item not up for sale');
    _;
  }

  modifier sold(uint _sku) {
    require(items[_sku].state == State.Sold, 'item not sold');
    _;
  }
  
  modifier shipped(uint _sku) {
      require(items[_sku].state == State.Shipped, 'item not shipped');
      _;
  }

  modifier checkValue(uint _sku)  {
    _;
    address buyer = items[_sku].buyer;
    
    uint _price = items[_sku].price;
    uint amountToRefund = msg.value - _price;
    (bool success,) = payable(buyer).call{value: amountToRefund}('');
    require(success, 'failed to send ether');
      
  }
  
  
  
  constructor()  {
    skuCount = 0;
    owner = msg.sender;
  }
  
  function getSkuCount() public view returns(uint) {
     return skuCount;
  }

  function addItem(string memory _name, uint _price) onlyOwner public  {
    require(bytes(_name).length > 0, 'name cannot be blank values');
    require(_price > 0, 'price must be greater than 0');
    skuCount += 1;
    _price = _price;
    items[skuCount] = Item({
      sku: skuCount,
      name: _name,
      price: _price,
      state: State.ForSale,
      seller: msg.sender,
      buyer: address(0)
    });

    emit ForSale(skuCount, block.timestamp);
  }

  function buyItem(uint _skuCount)  public forSale(_skuCount) paidEnough(items[_skuCount].price) checkValue(_skuCount)  payable {
    address buyer = msg.sender;
    uint price = items[_skuCount].price;
    items[_skuCount].buyer = buyer;
    items[skuCount].state = State.Sold;
    uint state = uint(items[_skuCount].state);
    (bool success,) = payable(items[_skuCount].seller).call{value: price}('');
    require(success, 'failed to send ether');
    console.log('%s:', state);
    emit Sold(_skuCount, block.timestamp);
  }
  
  function fetchSeller() public view returns(address) {
      return items[skuCount].seller;
  }


  function fetchSpecificBuyer(uint _sku) public view returns(address) {
    return items[_sku].seller;
  }


  function getOwner() public view returns(address) {
      return owner;
  }

  function fetchItems(uint _skuCount) public  view returns(uint sku, string memory name, uint price, string memory status, address seller, address buyer) {
    require(_skuCount > 0, "id cannot be zero");
    sku = items[_skuCount].sku;
    name = items[_skuCount].name;
    price = items[_skuCount].price;
    uint state = uint(items[_skuCount].state);
    console.log('state of item: %s', state);
    
    if(state == 0) {
      status = 'Unassigned';
    } else if(state == 1) {
        status = 'For Sale';
    } else if(state == 2) {
        status = 'Sold';
    } else if(state == 3) {
        status = 'Shipped';
    } 
    
    
    seller = items[_skuCount].seller;
    buyer = items[_skuCount].buyer;
  }
  

  function shipItem(uint _skuCount) public sold(_skuCount) verifyCaller(address(items[_skuCount].seller))  {
    items[_skuCount].state = State.Shipped;
    // console.log("%s cool", items[_skuCount].state);
    emit Shipped(_skuCount, block.timestamp);
  }

}

 