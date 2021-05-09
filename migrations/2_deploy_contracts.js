const BurnToken = artifacts.require("BurnToken");
const BurnTokenSale = artifacts.require("BurnTokenSale");

module.exports = function (deployer) {
  deployer.deploy(BurnToken, 1000000).then(function(){
    //Token price is 0.001 Ether
    var tokenPrice = 1000000000000000; 
    return deployer.deploy(BurnTokenSale, BurnToken.address, tokenPrice);
  });
  
};
