// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/compound.sol";
import "./interfaces/uniswap.sol";

contract contractShort {
    // state variables:
    CEth public cEth;
    CErc20 public cDAI;
    IERC20 public DAI;
    uint256 public decimals;

    // contracts we will need:
    Comptroller public comptroller =
        Comptroller(0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B);
    PriceFeed public pricefeed =
        PriceFeed(0x922018674c12a7F0D394ebEEf9B58F186CdE13c1);
    IUniswapV2Router public uniswapRouter =
        IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    // IUniswapV2Pair public uniswapPair = IUniswapV2Pair(0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11); // weth_dai
    IERC20 public Weth = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    constructor(
        address _cEth,
        address _cDAI,
        address _DAI,
        uint256 _decimals
    ) {
        cEth = CEth(_cEth);
        cDAI = CErc20(_cDAI); // cDAI
        DAI = IERC20(_DAI); // DAI
        decimals = _decimals;
    }

    receive() external payable {} // this contract recieves eth while borrowing

    // Supply DAI to Compound, which will become our collateral. And enter DAI market to borrow other assets against collateral
    function supply(uint256 amountDAI) external payable {
        // Approve transfer of underlying
        DAI.approve(address(cDAI), amountDAI);

        // Supply DAI as collateral, get cDAI in return
        require(cDAI.mint(amountDAI) == 0, "Supply failed");

        // Enter the market so we can borrow another type of asset(eth)
        address[] memory cTokens = new address[](1);
        cTokens[0] = address(cDAI);
        require(
            comptroller.enterMarkets(cTokens)[0] == 0,
            "Comptroller.enterMarkets failed."
        );
    }

    // To know the maximum borrow amount possible using our collateral:
    // know the liquidity
    // know the price of ETH (in USD)
    // scale-up liquidity by 10**decimal and divide by asset price in dollers to get max possible borrow amount
    function getMaxBorrow() public view returns (uint256) {
        (uint256 errorCode, uint256 liquidity, uint256 shortFall) = comptroller
            .getAccountLiquidity(address(this));

        require(errorCode == 0, "Some error occured");
        require(liquidity > 0, "Liquidity = 0");
        require(shortFall == 0, "Shortfall > 0");

        uint256 price_USD = pricefeed.getUnderlyingPrice(address(cEth));

        uint256 maxBorrowAmount = (liquidity) / price_USD;

        return maxBorrowAmount;
    }

    // Going short on eth:
    // borrow some amount of eth from compound(** amount < maxBorrowAmount)
    // buy DAI on uniswap using this borrowed eth
    function goShort_ETH(
        uint256 borrowAmount,
        uint256 uniswapTransactionDeadline
    ) external {
        require(
            cEth.borrow(borrowAmount) == 0,
            "Cannot borrow specified amount of eth, check colleteral"
        );

        // swapping
        address[] memory path = new address[](2);
        path[0] = address(Weth);
        path[1] = address(DAI);
        uniswapRouter.swapExactETHForTokens{value: address(this).balance}(
            1,
            path,
            address(this),
            uniswapTransactionDeadline
        );
        // uniswapTransactionDeadline in js:
        // Math.floor(Date.now() / 1000)-> present time in miliseconds
        // Math.floor(Date.now() / 1000) + 60 * 10-> present time + 10 minutes
    }

    // After the ETH price in decreased, we will claim the profits:
    // sell DAI back to uniswap, in exchange of eth
    // repaying the total borrowed balance(borrowed amount + borrow interest) to Compound
    // redeeming the underlying DAI (which was previously supplied as collateral)
    function claimProfits() external {
        // sell DAI
        uint256 daiAmount = DAI.balanceOf(address(this));
        DAI.approve(address(uniswapRouter), daiAmount);

        address[] memory path = new address[](2);
        path[0] = address(DAI);
        path[1] = address(Weth);
        uniswapRouter.swapExactTokensForETH(
            daiAmount,
            1,
            path,
            address(this),
            block.timestamp
        );

        // repay borrow
        uint256 borrowed_current = cEth.borrowBalanceCurrent(address(this));
        require(address(this).balance > borrowed_current, "Insufficient ETH"); // because address(this).balance = borrowed_current + profits
        cEth.repayBorrow{value: borrowed_current}();

        // redeem
        uint256 supplied_current = cDAI.balanceOfUnderlying(address(this));
        require(cDAI.redeemUnderlying(supplied_current) == 0, "Redeem failed");
    }

    // following functions are to track the current borrow balance, underlying balance and liquidity status
    function getSuppliedBalance() external returns (uint256) {
        return cDAI.balanceOfUnderlying(address(this));
    }

    function getBorrowBalance() external returns (uint256) {
        return cEth.borrowBalanceCurrent(address(this));
    }

    function getAccountLiquidity()
        external
        view
        returns (uint256 liquidity, uint256 shortfall)
    {
        // liquidity and shortfall in USD scaled up by 1e18
        (uint256 error, uint256 _liquidity, uint256 _shortfall) = comptroller
            .getAccountLiquidity(address(this));
        require(error == 0, "error");
        return (_liquidity, _shortfall);
    }
}
