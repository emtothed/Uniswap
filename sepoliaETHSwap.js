const { ethers } = require("ethers");
require("dotenv").config();
const providerUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const SwapRouterABI = require("./abi/sepoliaRouterABI.json"); // Router ABI for sepolia

//////Sepolia config-----------------------------------------------------------
const swapRouterAddress = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";
const WETHAddress = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const UsdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

const swapRouter = new ethers.Contract(
  swapRouterAddress,
  SwapRouterABI,
  wallet
);

async function swapETHForToken(swapAmount, tokenAddress) {
  const network = await provider.getNetwork();
  console.log(`Swaping on : ${network.name} chain`);

  const params = {
    tokenIn: WETHAddress,
    tokenOut: tokenAddress,
    fee: 3000,
    recipient: wallet.address,
    deadline: Math.floor(Date.now() / 1000 + 60 * 10), // 10 minutes
    amountIn: ethers.utils.parseEther(swapAmount.toString()),
    amountOutMinimum: 0, // No min
    sqrtPriceLimitX96: 0, // No limit
  };

  console.log("=============================================================");
  const tx = await swapRouter.exactInputSingle(params, {
    value: ethers.utils.parseEther(swapAmount.toString()),
  });
  console.log(`Swap transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`Swap transaction confirmed in block ${receipt.blockNumber}`);
}

// Swap 0.01 ETH for USDC
swapETHForToken(0.01, UsdcAddress).catch(console.error);
