const BurnToken = artifacts.require("BurnToken");

module.exports = function (deployer) {
  deployer.deploy(BurnToken, 1000000);
};
