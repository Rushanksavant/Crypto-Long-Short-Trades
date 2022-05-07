require("@nomiclabs/hardhat-waffle");
const dotenv = require("dotenv");
dotenv.config();


module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: `${process.env.ALCHEMY_Mainnet_URL}`,
        blockNumber: 12964900 // before london
      }
    }
  }
};
