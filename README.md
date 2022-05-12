# Crypto-Long-Short-Trades

## Going Long on ETH:
- Supply eth to Compound Protocol 
- Borrow stable coin from Compound Protocol (against eth supplied)
- Buy eth on Uniswap with this borrowed stable coin
- hold until eth price goes up
- Sell eth on Uniswap, in exchange of stable coin
- Repay borrowed stable coin to Compound(along with borrow interest)
- Keep the difference(and interests earned on Compound) as profits
- Profits will be in stable coin (can be exchanged)


![dapp screenshot](https://github.com/Rushanksavant/Crypto-Long-Short-Trades/blob/main/imgs/long.PNG)

## Going Short on ETH:
- Supply stable coin to Compound Protocol 
- Borrow eth from Compound Protocol
- Buy stable coin on Uniswap with this borrowed eth
- hold until eth price goes down
- Sell stable coin on Uniswap, in exchange of eth
- Repay borrowed eth to Compound(along with borrow interest)
- Keep the difference(and interests earned on Compound) as profits
- Profits will be in eth (can be exchanged)

![dapp screenshot](https://github.com/Rushanksavant/Crypto-Long-Short-Trades/blob/main/imgs/short.PNG)


## Smart Contracts:
- **Imports(for both the contracts):**
  - @openzeppelin/contracts/token/ERC20/IERC20.sol
  - Compound
    - interface CErc20
    - interface CEth
    - interface Comptroller
    - interface PriceFeed
  - Uniswap
    - interface IUniswapV2Router

- ***Contracts used(for both the contracts):***
  - CEth
  - CErc20 (cDai)
  - IERC20 (DAI)
  - Comptroller
  - PriceFeed
  - IUniswapV2Router
  - IERC20 (weth)

### 1. contractLong

- ***constructor(address _cEth, address _cTokenBorrow, address _tokenBorrow, uint256 _decimals){}***
	- contract pointer assignments
	- entering the Ceth market to supply ETH
	- assgining owner to deployer
- ***receive() external payable {}***
- ***modifier onlyOwner() {}***
- ***function supply() external payable {}***
	- supply eth to compound and get ceth
- ***function getMaxBorrow() public view returns (uint256) {}***
	- getting account liquidity (using comptroller)
	- getting price of DAI (using pricefeed)
	- returns max borrow - (liquidity) / (dai price)
- ***function goLong_ETH(uint256 borrowAmount, uint256 uniswapTransactionDeadline) external onlyOwner {}***
	- borrow DAI
	- approve uniswapRouter to take all DAI from contract address
	- swapind all DAI for eth on uniswap
- ***function claimProfits(uint256 uniswapTransactionDeadline) external onlyOwner{}***
	- sell all eth from contract address on uniswap for DAI
	- get current borrowed balance on compound (using ctoken/cDai), borrowed balance + interest on borrow
	- approving cDai to spend all DAI from contract address
	- repaying borrow
	- get current balance of underlying(eth) supplied to compound (using ctoken/ceth), supplied balance + interest on supply
	- redeem underlying
- ***function withdraw_DAI() external onlyOwner {}***
	- withdraw DAI(profits) to contract deploywer's address
- ***function getSuppliedBalance() external returns (uint256) {}***
	- returns balance of underlying supplied to compound (using ctoken/ceth), supplied balance + interest on supply
- ***function getBorrowBalance() external returns (uint256) {}***
	- returns borrow balance (suing ctoken/cDai), borrowed balance + interest on borrow
- ***function getAccountLiquidity() external view returns (uint256 liquidity, uint256 shortfall) {}***
	- returns account liquidity and shortfall (using comptroller)


### 2. contractShort 
(uses another contract ***swapETHforDAI.sol***, to swap eth for dai) 

- ***constructor (address _cEth, address _cDAI, address _DAI, uint256 _decimals) {}***
	- contract pointer assignments
	- entering the CDai market 
	- assgining owner to deployer
- ***receive() external payable {}***
- ***modifier onlyOwner() {}***
- ***function supply(uint256 amountDAI) external payable {}***
	- approve cDai to spend all DAI from contract address
	- supply DAI to compound and get cDai
- ***function getMaxBorrow() public view returns (uint256) {}***
	- same as contractLong, but this time pricefeed is used to get price of ceth
- ***function goShort_ETH( uint256 borrowAmount, uint256 uniswapTransactionDeadline) external onlyOwner {}***
	- borrow eth (using ceth)
	- swap al the borrowed eth on uniswap for as many DAI as possible
- ***function claimProfits(uint256 uniswapTransactionDeadline) external onlyOwner {}***
	- approve uniswap router to spend all DAI from contract balance
	- exchange all DAI for ETH
	- get current borrow balance (using ceth), borrowed balance + interest on borrow
	- repay the borrow
	- get current balance of underlying (DAI) supplied, supplied balance + interest on supply
	- redeem underlying
- ***function withdraw_ETH() external onlyOwner {}***
	- transfer all eth from contract balance to contract deployer
- ***function getSuppliedBalance() external returns (uint256) {}***
	- returns balance of underlying (using cDai), supplied balance + interest on supply
- ***function getBorrowBalance() external returns (uint256) {}***
	- returns borrow balance (using ceth), borrowed balance + interest on borrow
- ***function getAccountLiquidity() external view returns (uint256 liquidity, uint256 shortfall) {}*** 
	- returns account liquidity and shortfall (using comptroller)

