const SupplyChain = artifacts.require('SupplyChain.sol')


module.exports = async deployer => {
  try {
    await deployer.deploy(SupplyChain)
    const supplyChain = await SupplyChain.deployed(SupplyChain)
    console.log('supply chain address: ', supplyChain.address)

  } catch(err) {
    console.log(err)
  }
}