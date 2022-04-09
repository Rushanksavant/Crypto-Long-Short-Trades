const { expect } = require("chai");
const { assert } = require('chai')
const { ethers } = require("hardhat");

const DAI_ABI = require("./ABIs/DAI_ABI.json");
const cDAI_ABI = require("./ABIs/cDAI_ABI.json");
const cEth_ABI = require("./ABIs/cEth_ABI.json");

describe("contractShort", function () {
    let provider;
    // contract pointers:
    let contractShort;
    let cEth;
    let cDai;
    let Dai;

    let max_borrow;

    beforeEach(async function () { // beforeEach is a mocha hook, works like constructor of solidity
        [owner, add1, add2, ...addrs] = await ethers.getSigners();
        // Deploy contractShort:
        contractShort = await ethers.getContractFactory("contractShort").then(contract => contract.deploy(
            "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", // cETH
            "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // cDAI
            "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
            18)); // Decimal
        await contractShort.deployed(); // contract address = contractShort.address

        // Contract instances we might need
        provider = ethers.provider;
        DAI = new ethers.Contract("0x6B175474E89094C44Da98b954EedeAC495271d0F", DAI_ABI, provider);
        cDai = new ethers.Contract("0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", cDAI_ABI, provider);
        cEth = new ethers.Contract("0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", cEth_ABI, provider);


        // Supply DAI- owner-> contract address
        // Deploy swapETHforDAI
        const swapETHforDAI =
            await ethers.getContractFactory("swapETHforDAI")
                .then(contract => contract.deploy());
        await swapETHforDAI.deployed();

        // Swap 1 ETH for DAI
        await swapETHforDAI.connect(owner).swapExactETHForTokens(
            0, // amountOutMin
            "0x6b175474e89094c44da98b954eedeac495271d0f", //dai
            contractShort.address, // contractShort
            { value: ethers.utils.parseEther("4") }
        );
        const DAI_recieved = await DAI.balanceOf(contractShort.address); // this is verified in swapETHforDAI.js
        // Supply DAI - contract address-> compound
        await contractShort.supply(DAI_recieved); // call supply()

        // Checking max borrow
        max_borrow = await contractShort.getMaxBorrow();

        // going short on eth
        await contractShort.goShort_ETH(parseInt(0.5 * max_borrow), Math.floor(Date.now() / 1000) + 60 * 10);
    });

    it("Verify cDAI mint", async function () { // this test verifies if the function caller is able to supply DAI to Compound and the contract address is able to recieve the cDAI
        const cDAI_recieved = await cDai.balanceOf(contractShort.address) // cDAI recieved by contract address 
        // console.log(cDAI_recieved)
        assert.operator(parseInt(cDAI_recieved), '>', 0) // cDAI recieved by contract address should be > 0
    });

    it("Verify borrowing is possible", async function () {
        assert.operator(parseInt(max_borrow), '>', 0); // if max_borrow is not defined, contractShort.getMaxBorrow() will throw error
        // console.log(max_borrow)
    });

    it("Verify Short operation", async function () {
        const DAI_recieved = await DAI.balanceOf(contractShort.address)
        // console.log(DAI_recieved)
        assert.operator(DAI_recieved, '>', 0); // contract address recieves DAI after swapping borrowed ETH
    })

    it("Verify Claim profits", async function () {
        console.log("pending")
        // await contractShort.claimProfits()
    })
});
