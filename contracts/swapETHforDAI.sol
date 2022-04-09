// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/uniswap.sol";

contract swapETHforDAI {
    IUniswapV2Router public uniswapRouter =
        IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    IERC20 public Weth = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    // swapping
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address token,
        address reciever
    ) external payable {
        address[] memory path = new address[](2);
        path[0] = address(Weth);
        path[1] = token;
        uniswapRouter.swapExactETHForTokens{value: msg.value}(
            amountOutMin,
            path,
            reciever,
            block.timestamp
        );
    }
}
