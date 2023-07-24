import {
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
  MIN_DELAY,
  developmentChains,
} from "../helper-hardhat-config"
// @ts-ignore
import { ethers, network } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"

export async function queueAndExecute() {
  // Call Box Store Function
  const args = [NEW_STORE_VALUE]
  const functionToCall = FUNC
  const box = await ethers.getContract("Box")
  const encodeFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
  const describtionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))

  // Execute Function
  const governor = await ethers.getContract("GovernorContract")
  console.log("Queueing...")
  const queueTx = await governor.queue([box.address], [0], [encodeFunctionCall], describtionHash)
  await queueTx.wait(1)

  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)
  }

  console.log("Executing...")
  const execute = await governor.execute([box.address], [0], [encodeFunctionCall], describtionHash)
  await execute.wait(1)
  console.log(`Box value: ${await box.retrieve()}`)
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
