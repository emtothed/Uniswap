const { ethers } = require("ethers");
require("dotenv").config();
const providerUrl = process.env.POLYGON_RPC_URL;
const privateKey = process.env.POLYGON_PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const SwapRouterABI = require("./abi/polygonRouterABI.json");
const WMaticAbi = require("./abi/wMaticAbi.json");

//////Polygon config-----------------------------------------------------------
const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const UsdcAddress = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const wMatickAddress = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const wMaticContract = new ethers.Contract(wMatickAddress, WMaticAbi, wallet);

const swapRouter = new ethers.Contract(
  swapRouterAddress,
  SwapRouterABI,
  wallet
);

async function swapWMaticForUSDC(wMaticAmount) {
  const network = await provider.getNetwork();
  console.log(`Swaping on : ${network.name} chain`);

  console.log("=============================================================");
  const approveTx = await wMaticContract.approve(
    swapRouterAddress,
    ethers.utils.parseEther(wMaticAmount.toString()),
    {
      gasPrice: await iGas(), // Using increased gas
    }
  );
  console.log(`Approve transaction hash: ${approveTx.hash}`);
  approveReceipt = await approveTx.wait();
  console.log(
    `Approve transaction confirmed in block ${approveReceipt.blockNumber}`
  );

  const params = {
    tokenIn: wMatickAddress,
    tokenOut: UsdcAddress,
    fee: 3000,
    recipient: wallet.address,
    deadline: Math.floor(Date.now() / 1000 + 60 * 10), // 100 minutes
    amountIn: ethers.utils.parseEther(wMaticAmount.toString()),
    amountOutMinimum: 0, // No min
    sqrtPriceLimitX96: 0, // No limit
  };

  console.log("=============================================================");
  const tx = await swapRouter.exactInputSingle(params, {
    gasPrice: await iGas(), // Using increased gas
  });
  console.log(`Swap transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`Swap transaction confirmed in block ${receipt.blockNumber}`);
}

// Swap 0.01 WMatic for USDC
swapWMaticForUSDC(0.01).catch(console.error);

async function wrapMatic(maticAmount) {
  const tx = await wMaticContract.deposit({
    value: ethers.utils.parseEther(maticAmount.toString()),
    gasPrice: await iGas(), // Using increased gas
  });

  console.log(`Transaction hash: ${tx.hash}`);
  Receipt = await tx.wait();
  console.log(`Approve transaction confirmed in block ${Receipt.blockNumber}`);
}

// Wrap 0.01 ETH
//wrapMatic(0.01).catch(console.error);

// This function returns increases gas price by 10% to prevent the tx to get stuckon the network
async function iGas() {
  let gasPrice = await provider.getGasPrice();
  return gasPrice.mul(110).div(100);
}
