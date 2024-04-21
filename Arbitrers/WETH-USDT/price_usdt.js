// IMPORTS //
const ethers = require('ethers');
const fs = require('fs');
const v3PoolArtifact = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
require("dotenv").config();

// CONSTANTS //
const provider = new ethers.JsonRpcProvider(''); // Your provider
const pools = JSON.parse(fs.readFileSync('Arbitrers/WETH-USDT/pools_usdt_testnet_eth.json', 'utf8')); // The JSON with info about the pool !!!! ACTUAL SEPOLIA ETH !!!!
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Your private key defined in .env file

const UniswapV3FlashSwapRefinedABI = require('').abi; // Insert the ABI generated by deploying the contract on ur desired network
const UniswapV3FlashSwapRefinedAddress = ''; // Insert address depend on the network

// SQUARE ROOT TO PRICE //
function sqrtToPrice(sqrt, decimals) {
    return (Number(sqrt) / (2 ** 96)) ** 2 / (10 ** decimals[1] / 10 ** decimals[0]);
}

/* PRICE TO TICK //

function priceToTick(price) {
    return Math.floor(Math.log(price) / Math.log(1.0001));
}

*/

// PRICE POOLS //
async function checkPrice(pool) {
    const slot0 = await pool.contract.slot0();
    const priceToken0InTermsOfToken1 = sqrtToPrice(String(slot0.sqrtPriceX96), pool.decimals);
    const priceToken1InTermsOfToken0 = 1 / priceToken0InTermsOfToken1;
    const amountAfterFeeToken0 = priceToken0InTermsOfToken1 * (1 - pool.fee);
    const amountAfterFeeToken1 = priceToken1InTermsOfToken0 * (1 - pool.fee);

    console.log('Uni V3', '|', 'pair:', pool.pair, '|', 'dex:', pool.dex, '|', 'price afer fee of Token 0:', amountAfterFeeToken0, 'price after fee of Token 1:', amountAfterFeeToken1);

    return { amountAfterFeeToken0, amountAfterFeeToken1 };
}


// PRICE COMPARISON //
async function comparePools(pool1, pool2) {
    const price1 = await checkPrice(pool1);
    const price2 = await checkPrice(pool2);

    if (isNaN(price1.amountAfterFeeToken0) || isNaN(price2.amountAfterFeeToken0) || isNaN(price1.amountAfterFeeToken1) || isNaN(price2.amountAfterFeeToken1)) {
        console.log('Error: one of the prices is not a valid number. Skipping comparison.');
        return;
    }

    const priceDifferenceToken0 = Math.abs(price1.amountAfterFeeToken0 - price2.amountAfterFeeToken0);
    const priceDifferenceToken1 = Math.abs(price1.amountAfterFeeToken1 - price2.amountAfterFeeToken1);
    const priceDifferencePercentToken0 = Math.abs((price1.amountAfterFeeToken0 - price2.amountAfterFeeToken0) / price1.amountAfterFeeToken0 * 100);
    const priceDifferencePercentToken1 = Math.abs((price1.amountAfterFeeToken1 - price2.amountAfterFeeToken1) / price1.amountAfterFeeToken1 * 100);

    console.log('Price difference betwen', pool1.dex, 'and', pool2.dex, ':', priceDifferenceToken0, 'for Token 0 and', priceDifferenceToken1, 'for Token 1');
    console.log('Price difference in percentage betwen', pool1.dex, 'and', pool2.dex, ':', priceDifferencePercentToken0, '% for Token 0 and', priceDifferencePercentToken1, '% for Token 1');
    
    /* TICKS //
    const lowerPricePool1 = Math.min(price1.amountAfterFeeToken0, price1.amountAfterFeeToken1);
    const upperPricePool1 = Math.max(price1.amountAfterFeeToken0, price1.amountAfterFeeToken1);
    
    const lowerPricePool2 = Math.min(price2.amountAfterFeeToken0, price2.amountAfterFeeToken1);
    const upperPricePool2 = Math.max(price2.amountAfterFeeToken0, price2.amountAfterFeeToken1);
    
    const lowerTickPool1 = priceToTick(lowerPricePool1);
    const upperTickPool1 = priceToTick(upperPricePool1);
    
    const lowerTickPool2 = priceToTick(lowerPricePool2);
    const upperTickPool2 = priceToTick(upperPricePool2);
    
    console.log('Pool 1 - Lower tick:', lowerTickPool1, 'Upper tick:', upperTickPool1);
    console.log('Pool 2 - Lower tick:', lowerTickPool2, 'Upper tick:', upperTickPool2);
    */
   
    return { price1, price2 };
}


// ARBITRAGE STRATEGY //
async function arbitrageStrategy(pool1, pool2, price1, price2) {

    const gasLimit = ethers.parseUnits('800000', 'wei');
    const gasPrice = ethers.parseUnits('1', 'gwei'); // 1 gwei
    const oneWeth = ethers.parseUnits('1', 'ether');

    if (price1.amountAfterFeeToken0 < price2.amountAfterFeeToken0) {
        // Buy in pool1 and sell in pool2
        console.log('Arbitrage opportunity detected: Buy in pool1 and sell in pool2');
        const flashSwapContract = new ethers.Contract(UniswapV3FlashSwapRefinedAddress, UniswapV3FlashSwapRefinedABI, signer);
        /* 
            This values are used to call FlashSwap on your contract, you can change them to your needs
            To understand the formeters, check the FlashSwap function in the contract code 
        */
        await flashSwapContract.flashSwap(pool1.address, 500, pool1.WETH, pool1.USDT, oneWeth, { gasLimit, gasPrice });
    } else if (price1.amountAfterFeeToken0 > price2.amountAfterFeeToken0) {
        // Buy in pool2 and sell in pool1
        console.log('Arbitrage opportunity detected: Buy in pool2 and sell in pool1');
        const flashSwapContract = new ethers.Contract(UniswapV3FlashSwapRefinedAddress, UniswapV3FlashSwapRefinedABI, signer);
        await flashSwapContract.flashSwap(pool2.address, 3000, pool2.WETH, pool2.USDT, oneWeth, { gasLimit, gasPrice });
    }
}



// MAIN //
async function main() {
    for (const pool of pools) {
        pool.contract = new ethers.Contract(pool.address, v3PoolArtifact.abi, provider);
        await checkPrice(pool);
        pool.contract.on('Swap', () => {
            console.log('Swap event detected, checking price...');
            checkPrice(pool).catch(error => console.error('Error checking price:', error));
        });
        pool.timeoutId = setInterval(() => checkPrice(pool).catch(error => console.error('Error checking price:', error)), 15000);
    }

    setInterval(async () => {
        for (let i = 0; i < pools.length; i++) {
            for (let j = i + 1; j < pools.length; j++) {
                const prices = await comparePools(pools[i], pools[j]).catch(error => console.error('Error comparing pools:', error));
                if (prices && prices.price1 && prices.price2) {
                    await arbitrageStrategy(pools[i], pools[j], prices.price1, prices.price2).catch(error => console.error('Error executing arbitrage strategy:', error));
                }
            }
        }
    }, 15000);
}

main();

