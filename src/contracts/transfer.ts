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

const COMPLEX_TRANSFER_CONTRACT = `persistent sharded balance_state : UInt64;
persistent supply_state : UInt64;

/**
*//** some random comments to test our parser. 
*/

/*

/***

*/

//*/

//contract FIP1
//  @query
//  totalSupply() : UInt64;

//  @query
//  balanceOf(address: Address) : UInt64;

//  @action
//  transfer(from: Address, to: Address, value: UInt64) : Bool

//endcontract

@init
function init(owner: Address)
\tuse supply_state;
\tuse balance_state[owner];

\tsupply_state.set(92817u64);
\tbalance_state.set(owner, 92817u64);

endfunction

@query
function totalSupply(): UInt64

    use supply_state;
    var x = toFloat64(supply_state.get());
    return supply_state.get();
    //return toFloat64(supply_state.get())/toFloat64(leftShift(1u64, 31u64));

endfunction


@query
function balanceOf(address: Address) : UInt64
\t
    use balance_state[address];
    return balance_state.get(address, 0u64);

endfunction


@action
function transfer(from: Address, to: Address, value: UInt64) : Bool

    if(!from.signedTx())
      return false;
    endif

    use balance_state[from, to];
    var from_balance = balance_state.get(from, 0u64);
    var to_balance = balance_state.get(to, 0u64);

    if(from_balance < value)
      return false;
    endif

    var u_from = from_balance - value;
    var u_to = to_balance + value;

    balance_state.set(from, u_from);
    balance_state.set(to, u_to);
    return true;

endfunction`


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

const NO_ANNOTATIONS = `
function setup(owner: Address)
endfunction

function alternative(owner: Address)
endfunction`

const NO_INIT = `
@action
function action1()
endfunction
`
const MISSING_PERSISTENT_STATEMENT = `
@action
function transfer(from: Address, to: Address, amount: String)
  use balance_state["this_string", to, amount];   
  use test;
  // Check if the sender has enough balance to proceed
  if (balance_state.get(from, 0u64) >= amount)
    // update the account balances
    balance_state.set(from, balance_state.get(from) - amount);
    balance_state.set(to, balance_state.get(to, 0u64) + amount);
  endif

endfunction`


const INVALID_USE_PARAMETER_TYPE = `
persistent sharded balance_state : UInt64;

@init
function setup(owner : Contract)
  use balance_state[owner];

  balance_state.set(owner, 1000000u64);
endfunction`

const COMPLEX_USE_STATEMENTS_CONTRACT = `
persistent sharded balance_state : UInt64;

@init
function setup(owner : Address)
  use balance_state[owner];

  balance_state.set(owner, 1000000u64);
endfunction

@action
function transfer(from: Address, to: Address, amount: String)
  use balance_state["this_string", to, amount];   
  use test;
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

const MUTLISIG_CONTRACT = `
const CONTRACT_TEXT = 
persistent sharded balance_state : UInt64;
persistent supply_state : UInt64;
@init
function init(owner: Address)
    use supply_state;
    use balance_state[owner];
    supply_state.set(92817u64);
    balance_state.set(owner, 92817u64);
endfunction
@query
function totalSupply(): UInt64
    use supply_state;
    return supply_state.get();
endfunction
@query
function balanceOf(address: Address) : UInt64
    use balance_state[address];
    return balance_state.get(address, 0u64);
endfunction
@action
function transfer(from: Address, to: Address, value: UInt64) : Int64
    if(!from.signedTx())
      return 0i64;
    endif
    use balance_state[from, to];
    var from_balance = balance_state.get(from, 0u64);
    var to_balance = balance_state.get(to, 0u64);
    if(from_balance < value)
      return 0i64;
    endif
    var u_from = from_balance - value;
    var u_to = to_balance + value;
    balance_state.set(from, u_from);
    balance_state.set(to, u_to);
    return 1i64;
endfunction
`

export {
    TRANSFER_CONTRACT,
    COMPLEX_TRANSFER_CONTRACT,
    NO_ANNOTATIONS,
    INVALID_USE_PARAMETER_TYPE,
    MISSING_PERSISTENT_STATEMENT,
    COMPLEX_USE_STATEMENTS_CONTRACT,
    SIMPLE_CONTRACT,
    MULTIPLE_INITS,
    NO_INIT,
    MUTLISIG_CONTRACT
}
