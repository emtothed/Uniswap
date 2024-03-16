const { ethers } = require("ethers");
require("dotenv").config();
const providerUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const SwapRouterABI = require("./abi/sepoliaRouterABI.json"); // Router ABI for sepolia
const WETHAbi = require("./abi/wEthAbi.json");

//////Sepolia config-----------------------------------------------------------
const swapRouterAddress = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";
const WETHAddress = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const UsdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

const WETHContract = new ethers.Contract(WETHAddress, WETHAbi, wallet);
const swapRouter = new ethers.Contract(
  swapRouterAddress,
  SwapRouterABI,
  wallet
);

async function swapWETHForUSDC(swapAmount) {
  const network = await provider.getNetwork();
  console.log(`Swaping on : ${network.name} chain`);

  console.log("=============================================================");
  const approveTx = await WETHContract.approve(
    swapRouterAddress,
    ethers.utils.parseEther(swapAmount.toString())
  );
  console.log(`Approve transaction hash: ${approveTx.hash}`);
  approveReceipt = await approveTx.wait();
  console.log(
    `Approve transaction confirmed in block ${approveReceipt.blockNumber}`
  );

  const params = {
    tokenIn: WETHAddress,
    tokenOut: UsdcAddress,
    fee: 3000,
    recipient: wallet.address,
    deadline: Math.floor(Date.now() / 1000 + 60 * 100), // 100 minutes
    amountIn: ethers.utils.parseEther(swapAmount.toString()),
    amountOutMinimum: 0, // No min
    sqrtPriceLimitX96: 0, // No limit
  };

  console.log("=============================================================");
  const tx = await swapRouter.exactInputSingle(params);
  console.log(`Swap transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`Swap transaction confirmed in block ${receipt.blockNumber}`);
}

// Swap 0.01 WETH for USDC
swapWETHForUSDC(0.01).catch(console.error);

async function wrapETH(ETHAmount) {
  const tx = await WETHContract.deposit({
    value: ethers.utils.parseEther(ETHAmount.toString()),
  });
  console.log(`Transaction hash: ${tx.hash}`);
  Receipt = await tx.wait();
  console.log(`Approve transaction confirmed in block ${Receipt.blockNumber}`);
}

// Wrap 0.01 ETH
//wrapETH(0.01).catch(console.error);
