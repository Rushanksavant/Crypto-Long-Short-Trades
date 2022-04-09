const { assert } = require("chai");
const { ethers, BigNumber } = require("hardhat");
const DAI_ABI = require("./ABIs/DAI_ABI.json");

describe("swapETHforDAI", function () {
    it("Swap ETH for DAI", async function () {
        const provider = ethers.provider;
        const [owner, addr1] = await ethers.getSigners();
        const DAI = new ethers.Contract("0x6b175474e89094c44da98b954eedeac495271d0f", DAI_ABI, provider);

        // Assert addr1 has 1000 ETH to start
        addr1Balance = await provider.getBalance(addr1.address);
        expectedBalance = ethers.BigNumber.from("10000000000000000000000");
        assert(addr1Balance.eq(expectedBalance));

        // Assert addr1 DAI balance is 0
        addr1Dai = await DAI.balanceOf(addr1.address);
        assert(addr1Dai.isZero());

        // Deploy swapETHforDAI
        const swapETHforDAI =
            await ethers.getContractFactory("swapETHforDAI")
                .then(contract => contract.deploy());
        await swapETHforDAI.deployed();

        // Swap 1 ETH for DAI
        await swapETHforDAI.connect(addr1).swapExactETHForTokens(
            0, // amountOutMin
            "0x6b175474e89094c44da98b954eedeac495271d0f", //dai
            "0x9d4454B023096f34B160D6B654540c56A1F81688", // contractShort
            { value: ethers.utils.parseEther("1") }
        );

        // Assert addr1Balance contains one less ETH
        expectedBalance = addr1Balance.sub(ethers.utils.parseEther("1"));
        addr1Balance = await provider.getBalance(addr1.address);
        assert(addr1Balance.lt(expectedBalance));

        // Assert DAI balance increased
        addr1Dai = await DAI.balanceOf("0x9d4454B023096f34B160D6B654540c56A1F81688"); // contractShort
        assert(addr1Dai.gt(ethers.BigNumber.from("0")));
        // console.log(parseInt(addr1Dai) / 10 ** 18)
    });
});
