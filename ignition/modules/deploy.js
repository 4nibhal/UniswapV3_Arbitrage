const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("UniswapArbitrageV1", (m) => {
  const UniswapArbitrageV1 = m.contract("UniswapArbitrageV1");

  return { UniswapArbitrageV1 };
});