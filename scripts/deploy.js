const hre = require("hardhat");

async function main() {
  // Deploying contractLong
  const Contract_Long = await hre.ethers.getContractFactory("contracts/contractLong.sol:contractLong");
  const contractLong = await Contract_Long.deploy("0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", // cETH
    "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // cDAI
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    18); // Decimal
  await contractLong.deployed();
  console.log("Contract_Long deployed to:", contractLong.address);

  // Deploying contractShort
  const Contract_Short = await hre.ethers.getContractFactory("contracts/contractShort.sol:contractShort");
  const contractShort = await Contract_Short.deploy("0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", // cETH
    "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // cDAI
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    18); // Decimal
  await contractShort.deployed();
  console.log("Contract_Short deployed to:", contractShort.address);

  // Deploying swapETHforDAI (this is just for testing, to fund contractShort with DAI)
  const SwapETHforDAI = await hre.ethers.getContractFactory("swapETHforDAI");
  const swapETHforDAI = await SwapETHforDAI.deploy();
  await swapETHforDAI.deployed();
  console.log("SwapETHforDAI deployed to:", swapETHforDAI.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
