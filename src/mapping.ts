import { BetPlaced, BetClaimed, Donut } from '../generated/Donut/Donut'
import { DonutBet, Transaction } from '../generated/schema'
import { ethereum, BigInt } from '@graphprotocol/graph-ts'

function createTx(event: ethereum.Event): string {
  let tx = new Transaction(event.transaction.hash.toHex())
  tx.block = event.block.number
  tx.timestamp = event.block.timestamp
  tx.hash = event.block.hash
  tx.save()

  return tx.id
}

export function handleBetPlaced(event: BetPlaced): void {
  let donutBet = new DonutBet(event.params.id.toHex())

  donutBet.bet = event.params.bet
  donutBet.creator = event.params.creator
  donutBet.value = event.params.value
  donutBet.createdTx = createTx(event)
  donutBet.hasWon = parseInt(event.block.hash.toHexString().charAt(65), 16) === donutBet.bet

  donutBet.save()
}

export function handleBetClaimed(event: BetClaimed): void {
  let id = event.params.id.toHex()
  let donutBet = DonutBet.load(id)
  let donut = Donut.bind(event.address)

  donutBet.claimedTx = createTx(event)
  donutBet.rewardReceived = donutBet.value.times(BigInt.fromI32(donut.multiplier()))

  donutBet.save()
}
