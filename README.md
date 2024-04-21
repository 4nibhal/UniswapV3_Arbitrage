# WARNING
Work in progress. This is not a final version. I am still working on it.
## Arbitrage Trading Bot UNISWAPV3
This is a simple arbitrage trading bot for Uniswap V3. I have created this bot to learn about Uniswap V3 and arbitrage trading. This bot is not a financial advice. Use it at your own risk.

## How it works

- `Arbitrers` directory, contains bot for each pool. You can create a new bot for a new pool. 
- This bots need a json, with the pool information
- The bot will check the spot price of the tokens in the pool
using `slot0` function of the pool
- If the spot price is different from the price in the pool, the bot will make a trade calling the contract located in the `contracts` directory

###### Advices
- Cause now only check the spot price, we cannot predict the slippage of our own trade, so be careful
- Actually the contract is a example u can find in: https://solidity-by-example.org/defi/uniswap-v3-flash-swap/
- The contract is only a example, i suggest u to make ur own contract, and test it before using it in production
- <u> I am also currently calculating the upper and lower ticks of the price range, but I am not sure if I am doing the calculation correctly, and I am not currently putting the ticks to use. This part of the code will be commented out, if you find a use for it, or are not calculating the ticks correctly, please let me know. </u>
- The address in `Arbitrers`pools are for <u>Arbitrum</u> change it for your desired network

###### Keep in mind
- This bot is not a financial advice. Use it at your own risk.
- This bot is not a final version. I am still working on it.
- This bot is not a high frequency trading bot. It is a simple arbitrage trading bot.
- This bot is not a professional trading bot. It is a simple arbitrage trading bot.
- The contract provided in the `contracts` directory is just an example. I am looking to make a final version, but I am still working on it.
- All commits are welcome. <u>Feel free to contribute to this project.</u>

## How to use
- Clone the repository
- `cd` into the repository
- Install the dependencies
    - `bun install` or  `npm install`
- Make `cp .env.example .env` and fill the `.env` file with your PRIVATEKEY. <u>(You can use .env to store your provider too)</u>
- Run the bot
    - `bun run Arbitrers/WETH-USDT/price_usdt.js`
    - `node run Arbitrers/WETH-USDT/price_usdt.js`
        - ( I recommend use `bun`)
