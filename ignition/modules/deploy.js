const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("UniswapArbitrageV3", (m) => {
  const UniswapArbitrageV3 = m.contract("UniswapArbitrageV3");

  return { UniswapArbitrageV3 };
});
