
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    arbitrum: {
      url: "https://arbitrum-one-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
      allowUnlimitedContractSize: true,
      chainId: 42161,
      gas: 5000000, //units of gas you are willing to pay, aka gas limit
      gasPrice:  50000000000, //gas is typically in units of gwei, but you must enter it as wei here
    },
    ethSepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
      allowUnlimitedContractSize: true,
      gas: 5000000, //units of gas you are willing to pay, aka gas limit
      gasPrice:  50000000000, //gas is typically in units of gwei, but you must enter it as wei here
    },
    arbSepolia: {
      url: "https://arbitrum-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 421614,
      allowUnlimitedContractSize: true,
      gas: 5000000, //units of gas you are willing to pay, aka gas limit
      gasPrice:  50000000000, //gas is typically in units of gwei, but you must enter it as wei here
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      },
    ], 
  },
}