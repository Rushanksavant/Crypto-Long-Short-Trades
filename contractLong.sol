// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8;
// Going Long on ETH:
// 1. supply eth
// 2. borrow stable coin
// 3. buy eth on uniswap
// hold until eth price goes up
// 4. sell eth on uniswap
// 5. repay borrowed stable coin
// 6. keep the difference as profits

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/compound.sol";
import "./interfaces/uniswap.sol";

contract contractLong{
    // state variables:
    CEth public cEth;
    CErc20 public cTokenBorrow;
    IERC20 public tokenBorrow;
    uint public decimals;

    // contracts we will need:
    Comptroller public comptroller = Comptroller(0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B);
    PriceFeed public pricefeed = PriceFeed(0x922018674c12a7F0D394ebEEf9B58F186CdE13c1);
    IUniswapV2Router public uniswapRouter = IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    IUniswapV2Pair public uniswapPair = IUniswapV2Pair(0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11); // weth_dai
    IERC20 public Weth = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    constructor(address _cEth, address _cTokenBorrow, address _tokenBorrow, uint _decimals) {
        cEth = CEth(_cEth);
        cTokenBorrow = CErc20(_cTokenBorrow); // cDAI
        tokenBorrow = IERC20(_tokenBorrow); // DAI
        decimals = _decimals;
        // Enter the ETH market using the comptroller to tell the protocol that we want to use the ETH as collateral.(and to enable borrow)
        address[] memory cTokens = new address[](1);
        cTokens[0] = address(cEth);
        require(comptroller.enterMarkets(cTokens)[0] == 0, "Comptroller.enterMarkets failed."); // comptroller.enterMarkets(cTokens) returns array of error codes
    }

    receive() external payable {} // so that this contract can recieve ether

    // Supply ETH to Compound, which will become our collateral.
    function supply() external payable { 
        cEth.mint{value: msg.value}();
    }

    // To know the maximum borrow amount possible using our collateral:
        // know the liquidity 
        // know the price of asset we want to borrow(Dai) (in USD)
        // scale-up liquidity by 10**decimal and divide by asset price in dollers to get max possible borrow amount
    function getMaxBorrow() public view returns(uint) {
        (uint errorCode, uint liquidity, uint shortFall) = comptroller.getAccountLiquidity(address(this));

        require(errorCode == 0, "Some error occured");
        require(liquidity > 0, "Liquidity = 0");
        require(shortFall == 0, "Shortfall > 0");

        uint price_USD = pricefeed.getUnderlyingPrice(address(cTokenBorrow));

        uint maxBorrowAmount = (liquidity * (10**decimals)) / price_USD;

        return maxBorrowAmount;  
    }

    // Going long on eth:
        // borrow some amount of asset(Dai) from compound(** amount < maxBorrowAmount)
        // buy weth on uniswap using this borrowed asset:
            // get the amount of asset present with this contract address
            // approve uniswap(router contract) to use asset amount for transaction
            // swap asset for weth:
                // get reserves from weth-asset(dai) pair contract
                // use getAmountOut from router to know exact amount of weth which can be recieved against asset(Dai)
                // swaping on uniswap using swapExactETHForTokens from router
    function goLong_ETH(uint borrowAmount, uint uniswapTransactionDeadline) external {
        require(cTokenBorrow.borrow(borrowAmount)==0, "Cannot borrow specified amount of asset, check colleteral");

        uint assetAmount = tokenBorrow.balanceOf(address(this));
        tokenBorrow.approve(address(uniswapRouter), assetAmount);

        // Uniswap:
        // get reserves
        (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) = uniswapPair.getReserves();
        // get exact amount of weth which can be recieved against assetAmount of Dai
        uint amountWETH = uniswapRouter.getAmountOut(assetAmount, reserve0, reserve1);
        // swapping
        address[] memory path = new address[](2);
        path[0] = address(tokenBorrow);
        path[1] = address(Weth);
        uniswapRouter.swapExactTokensForETH(assetAmount, amountWETH, path, address(this), uniswapTransactionDeadline);
        // uniswapTransactionDeadline in js:
        // Math.floor(Date.now() / 1000)-> present time in miliseconds
        // Math.floor(Date.now() / 1000) + 60 * 10-> present time + 10 minutes
    } 

    // After the ETH price in increased, we will claim the profits:
        // sell eth back to uniswap, in exchange of asset(Dai)
            // putting amountOutMin as 1, previously we used getAmountOut to find amountOutMin
        // repaying the total borrowed balance(borrowed amount + borrow interest) to Compound 
        // redeeming the underlying Eth (which was previously supplied as collateral)
    function claimProfits() external{
        // sell eth
        uint myWeth_Balance = Weth.balanceOf(address(this));
        address[] memory path = new address[](2);
        path[0] = address(Weth);
        path[1] = address(tokenBorrow); 
        uniswapRouter.swapExactETHForTokens{value: address(this).balance}(1, path, address(this), block.timestamp); // verify 1

        // repay borrow
        uint borrowed_current = cTokenBorrow.borrowBalanceCurrent(address(this));
        tokenBorrow.approve(address(cTokenBorrow), borrowed_current);
        require(cTokenBorrow.repayBorrow(borrowed_current) == 0, "Repay failed");

        // redeem
        uint supplied_current = cEth.balanceOfUnderlying(address(this));
        require(cEth.redeemUnderlying(supplied_current) == 0, "Redeem failed");
    }

    // following functions are to track the current borrow balance, underlying balance and liquidity status
    function getSuppliedBalance() external returns (uint) {
        return cEth.balanceOfUnderlying(address(this));
    }
    function getBorrowBalance() external returns (uint) {
        return cTokenBorrow.borrowBalanceCurrent(address(this));
    }
    function getAccountLiquidity() external view returns (uint liquidity, uint shortfall) {
        // liquidity and shortfall in USD scaled up by 1e18
        (uint error, uint _liquidity, uint _shortfall) = comptroller.getAccountLiquidity(address(this));
        require(error == 0, "error");
        return (_liquidity, _shortfall);
    }
}
