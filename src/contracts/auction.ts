const AUCTION_CONTRACT = ` //------------------------------------------------------------------------------
//
//   Copyright 2019 Fetch.AI Limited
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//
//------------------------------------------------------------------------------

// This contract require release v0.9.1 or above
// Note that this is experimental functionality

persistent beneficiary : Address;
persistent auctionEndTime : UInt64;
persistent highestBidder : Address;
persistent highestBid : UInt64;
persistent sharded pendingReturns : UInt64;
persistent ended : Bool;


@init
function constructor(benefitAddr: Address)

    use beneficiary;
    use auctionEndTime;
    use highestBidder;
    use highestBid;

    beneficiary.set(benefitAddr);
    var now : UInt64 = getContext().block().blockNumber();
    var biddingTime : UInt64 = 200u64;
    auctionEndTime.set(now + biddingTime);

    highestBidder.set(null);
    highestBid.set(0u64);

endfunction


@action
function bid()

    use auctionEndTime;
    use highestBid;

    var tx = getContext().transaction();
    var sender_addr = tx.from();
    var sender_value = tx.getTotalTransferAmount();
    var now = getContext().block().blockNumber();

    assert(now <= auctionEndTime.get(), "Auction already ended.");
    assert(sender_value > highestBid.get(), "There already is a higher bid.");

    if(highestBid.get() != 0u64)
        var highestBidderAddress = highestBidder.get();
        use pendingReturns[highestBidderAddress];
        pendingReturns.set(highestBidderAddress, highestBid.get());
        // pendingReturns.set(highestBidderAddress, currentPendingReturns + highestBid.get());
    endif

    highestBidder.set(sender_addr);
    highestBid.set(sender_value);

endfunction


@action
function withdraw(): Bool

    var tx = getContext().transaction();
    var receiver_addr = tx.from();
    use pendingReturns[receiver_addr];

    var amount : UInt64 = pendingReturns.get(receiver_addr);
    if(amount > 0u64)
        pendingReturns.set(receiver_addr, 0u64);

        if(!receiver_addr.send(amount))
            pendingReturns.set(receiver_addr, amount);
            return false;
        endif

    endif
    return true;

endfunction


@action
function endAuction()

    use auctionEndTime;
    use ended;
    use beneficiary;
    use highestBid;

    var now = getContext().block().blockNumber();

    assert(now >= auctionEndTime.get(), "Auction not yet ended.");
    assert(!ended.get(), "auctionEnd has already been called.");
    ended.set(true);
    transfer(beneficiary.get(), highestBid.get());

endfunction`

export {AUCTION_CONTRACT}
