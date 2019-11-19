const TRANSFER_CONTRACT = `
persistent sharded balance_state : UInt64;

@init
function setup(owner : Address)
  use balance_state[owner];

  balance_state.set(owner, 1000000u64);
endfunction

@action
function transfer(from: Address, to: Address, amount: UInt64)
  use balance_state[from, to];

  // Check if the sender has enough balance to proceed
  if (balance_state.get(from, 0u64) >= amount)
    // update the account balances
    balance_state.set(from, balance_state.get(from) - amount);
    balance_state.set(to, balance_state.get(to, 0u64) + amount);
  endif

endfunction

@query
function balance(address: Address) : UInt64
  use balance_state[address];

  return balance_state.get(address, 0u64);
endfunction

`

const SIMPLE_CONTRACT = `
@init
function init(owner: Address)
endfunction

@action
function action1()
endfunction

@action
function action2()
endfunction

@query
function query1()
endfunction

@query
function query2()
endfunction
`

const MULTIPLE_INITS = `
@init
function setup(owner: Address)
endfunction

@init
function alternative(owner: Address)
endfunction
`

const NO_INIT = `
@action
function action1()
endfunction
`

export {TRANSFER_CONTRACT, SIMPLE_CONTRACT, MULTIPLE_INITS, NO_INIT}
