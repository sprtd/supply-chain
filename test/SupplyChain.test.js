const truffleAssert  = require('truffle-assertions')
const SupplyChain = artifacts.require('SupplyChain')
let supplyChain, accounts, deployer, addr1, addr2, addr3
let buyerBefore = 0x0000000000000000000000000000000000000000
let sellerBefore = 0x0000000000000000000000000000000000000000
let initialState = 'Unassigned'

// conversion helpers
const toWei = payload => web3.utils.toWei(payload.toString(), 'ether')
const fromWei = payload => web3.utils.fromWei(payload, 'ether')


contract('SupplyChain', async  accountsPayload => {
  accounts = accountsPayload
  owner = accounts[0]
  addr1 = accounts[1]
  addr2 = accounts[2]
  addr3 = accounts[3]
  before(async() => {
    supplyChain = await SupplyChain.deployed()
  })

  contract('Deployment', async() => {
    it('Sets sku to zero on deployment', async () => {
      const skuCount = await supplyChain.getSkuCount()
      const deployerAccount = await supplyChain.getOwner()
      assert.equal(skuCount, 0)
      console.log('deployer address', deployerAccount)
      assert.equal(deployerAccount, owner)
    })

  })

  contract('Revert Non-Owner', () => {
    it('Disallows non-owner account from adding new item', async() => {
      const REVERT  = 'Returned error: VM Exception while processing transaction: revert Only owner can call this function'
      try {
        await supplyChain.addItem('Alpha1', 10, { from: addr1})
        throw null;
        
      } catch(err) {
        assert(err.message.startsWith(REVERT), `Expected ${REVERT} but got ${err.message} instead`)
        
      }

    })
  })

  contract('Add Item', () => {
    it('Allows only owner account to add item', async() => {
      const nameBefore = 'Alpha 1'
      const priceBefore = 10
      let buyer = 0x0000000000000000000000000000000000000000
      const skuCountBefore = await supplyChain.getSkuCount()
      await supplyChain.addItem(nameBefore, priceBefore, { from: owner })
      const skuCountAfter = await supplyChain.getSkuCount()
      
      const newlyAddedItems  = await supplyChain.fetchItems(skuCountAfter)
      const { name: nameAfter, price: priceAfter, status: statusAfter, seller: sellerAfter, buyer: buyerAfter, sku: skuAfter } = newlyAddedItems
      console.log('name after addition', nameAfter)
      assert(nameAfter, nameBefore)
      assert(priceAfter, priceBefore)
      assert(skuCountBefore, skuCountBefore.toNumber() + 1)
      assert(statusAfter, 'For Sale')
      assert(sellerAfter, owner)
      assert(buyerAfter, buyer)
    })
  })
  
  contract('Buys Item', () => {
    it('Can buy item put up for sale', async() => {
      const id = 1
      const itemBefore = await supplyChain.fetchItems(id)
      const { name: nameBefore, price: priceBefore, status: statusBefore, seller: sellerBefore, buyer: buyerBefore, sku: skuBefore } = itemBefore
      assert.equal(statusBefore, initialState)
      
      const setName = 'alpha 1'
      const num = 1
      const setPrice = toWei(num.toString())
      
      await supplyChain.addItem(setName, setPrice, { from : owner })
      
      
      
      
      const itemAfterAdd = await supplyChain.fetchItems(num)
      const { name: nameAfter, price: priceAfter, status: statusAfter, seller: sellerAfter, buyer: buyerAfter, sku: skuAfter } = itemAfterAdd
      console.log('status before buy item', statusAfter)
      assert.equal(statusAfter, 'For Sale')
      assert.equal(sellerAfter, owner)
      
      
      const ownerETHBalBefore = await web3.eth.getBalance(owner)
      
      
      console.log('owner eth balance before', fromWei(ownerETHBalBefore))
      const payAmount = toWei(num)
      
      await supplyChain.buyItem(id, { from : addr1, value: payAmount })
      const itemAfterBuy = await supplyChain.fetchItems(1)
      const { name: nameAfterBuy, price: priceAfterBuy, status: statusAfterBuy, seller: sellerAfterBuy, buyer: buyerAfterBuy, sku: skuAfterBuy } = itemAfterBuy
      
      const ownerETHBalAfterBuy = await web3.eth.getBalance(owner)
      console.log('owner balance after buy', fromWei(ownerETHBalAfterBuy))
      
      // item status changed to sold
      assert.equal(statusAfterBuy, 'Sold')

      // buyer changed to address 1
      assert.equal(buyerAfterBuy, addr1)

      const ethDiff = ownerETHBalAfterBuy - ownerETHBalBefore
      console.log('eth diff', fromWei(ethDiff.toString()))

      // difference between seller's initial ETH balance and seller's final ETH balance is the amount paid by  buyer
      assert.equal(fromWei(payAmount), fromWei(ethDiff.toString()))
    })
  })

})
