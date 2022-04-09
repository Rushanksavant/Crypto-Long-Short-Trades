const { expect } = require("chai");
const { assert } = require('chai')
const { ethers } = require("hardhat");

const DAI_ABI = require("./ABIs/DAI_ABI.json");
const cDAI_ABI = require("./ABIs/cDAI_ABI.json");
const cEth_ABI = require("./ABIs/cEth_ABI.json");

describe("contractLong", function () {
  let provider;
  // contract pointers:
  let contractLong;
  let cEth;
  let cDai;
  let Dai;

  let max_borrow;

  beforeEach(async function () { // beforeEach is a mocha hook, works like constructor of solidity
    [owner, add1, add2, ...addrs] = await ethers.getSigners();
    // Deploy contractLong:
    contractLong = await ethers.getContractFactory("contractLong").then(contract => contract.deploy(
      "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", // cETH
      "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // cDAI
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
      18)); // Decimal
    await contractLong.deployed(); // contract address = contractLong.address

    // Contract instances we might need
    provider = ethers.provider;
    DAI = new ethers.Contract("0x6B175474E89094C44Da98b954EedeAC495271d0F", DAI_ABI, provider);
    cDai = new ethers.Contract("0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", cDAI_ABI, provider);
    cEth = new ethers.Contract("0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", cEth_ABI, provider);


    // Supply ETH- owner-> contract address-> compound. And mint cEth for contract address 
    await contractLong.connect(owner).supply({ value: ethers.utils.parseEther("3") }); // call supply()

    // Checking max borrow
    max_borrow = await contractLong.getMaxBorrow();

    // console.log(await provider.getBalance(contractLong.address)) // the contract eth balance is zero. It will increase after going Long
    // going long on eth
    // goLong_ETH takes 2 arguments: 
    // borrowAmount -> borrowing 50% of max borrow limit (0.5*max_borrow)
    // uniswapTransactionDeadline -> keeping 10 mins as deadline (Math.floor(Date.now() / 1000) + 60 * 10)
    await contractLong.goLong_ETH(parseInt(0.5 * max_borrow), Math.floor(Date.now() / 1000) + 60 * 10);

    // claiming profits
    // await contractLong.claimProfits();
    // console.log(parseInt(0.5 * max_borrow))
    // console.log(parseInt(await DAI.balanceOf(contractLong.address)))
  });

  it("Verify cETH mint", async function () { // this test verifies if the function caller is able to supply ETH to Compound and the contract address is able to recieve the cEth
    const cETH_recieved = await cEth.balanceOf(contractLong.address) // cEth recieved by contract address 
    assert.operator(parseInt(cETH_recieved), '>', 0) // cEth recieved by contract address should be > 0
  });

  it("Verify borrowing is possible", async function () {
    assert.operator(parseInt(max_borrow), '>', 0); // if max_borrow is not defined, contractLong.getMaxBorrow() will throw error
    // console.log(max_borrow)
  })

  it("Verify Long operation", async function () {
    const ETH_recieved = await provider.getBalance(contractLong.address)
    assert.operator(ETH_recieved, '>', 0); // contract address recieves eth after swapping borrowed DAI
  })

  it("Verify Profits claim operation", async function () {
    console.log("pending")
    // await contractLong.claimProfits(Math.floor(Date.now() / 1000) + 60 * 10);
    // console.log(parseInt(0.5 * max_borrow))
    // console.log(parseInt(await DAI.balanceOf(contractLong.address)))
    // console.log(parseInt(await cDai.borrowBalanceCurrent(contractLong.address)))
  })
});
