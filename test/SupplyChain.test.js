const truffleAssert  = require('truffle-assertions')
const SupplyChain = artifacts.require('SupplyChain')
let supplyChain, accounts, deployer, addr1, addr2, addr3


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
})
