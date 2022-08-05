require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
 require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const KOVAN_RPC_URL= process.env.KOVAN_RPC_URL;
const PRIAVTE_KEY = process.env.PRIAVTE_KEY;
const ETHERSCAN_API_KEY= process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY= process.env.COINMARKETCAP_API_KEY
module.exports = {
  solidity:{
    compilers:[
      {version: "0.6.6"},
      {version: "0.8.8"},
    ]
  },
  networks: {
    hardhat:{
      chainId:31337,
    },
    kovan: {
      url:KOVAN_RPC_URL,
      accounts:[PRIAVTE_KEY],
      chainId: 42,
      blockConfirmations:6,
      gas:6000000,
    },
    rinkeby:{
      url:RINKEBY_RPC_URL,
      accounts:[PRIAVTE_KEY],
      chainId:4,
      blockConfirmations:6,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts:{
    deployer:{
      default:0
    }
  }
};
