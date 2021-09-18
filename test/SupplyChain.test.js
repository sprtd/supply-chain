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

      console.log('counter', skuCount)

      assert.equal(skuCount, 0)
      console.log('deployer address', deployerAccount)
      assert.equal(deployerAccount, owner)
    })

  })

  contract('Transaction', () => {
    const REVERT  = 'VM Exception while processing transaction: revert Only owner can call this function'
    it('Disallows non-owner account from adding new item', async() => {
      await truffleAssert.reverts(
        supplyChain.addItem('Alpha1', 10, { from: addr1 }), REVERT
      )

    })
  })
})
