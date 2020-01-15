"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TRANSFER_CONTRACT = "\npersistent sharded balance_state : UInt64;\n\n@init\nfunction setup(owner : Address)\n  use balance_state[owner];\n\n  balance_state.set(owner, 1000000u64);\nendfunction\n\n@action\nfunction transfer(from: Address, to: Address, amount: UInt64)\n  use balance_state[from, to];\n\n  // Check if the sender has enough balance to proceed\n     if (balance_state.get(from, 0u64) >= amount)\n    // update the account balances\n    balance_state.set(from, balance_state.get(from) - amount);\n    balance_state.set(to, balance_state.get(to, 0u64) + amount);\n  endif\n\nendfunction\n\n@query\nfunction balance(address: Address) : UInt64\n  use balance_state[address];\n\n  return balance_state.get(address, 0u64);\nendfunction\n\n";
exports.TRANSFER_CONTRACT = TRANSFER_CONTRACT;
var COMPLEX_TRANSFER_CONTRACT = "persistent sharded balance_state : UInt64;\npersistent supply_state : UInt64;\n\n/**\n*//** some random comments to test our parser. \n*/\n\n/*\n\n/***\n\n*/\n\n//*/\n\n//contract FIP1\n//  @query\n//  totalSupply() : UInt64;\n\n//  @query\n//  balanceOf(address: Address) : UInt64;\n\n//  @action\n//  transfer(from: Address, to: Address, value: UInt64) : Bool\n\n//endcontract\n\n@init\nfunction init(owner: Address)\n\tuse supply_state;\n\tuse balance_state[owner];\n\n\tsupply_state.set(92817u64);\n\tbalance_state.set(owner, 92817u64);\n\nendfunction\n\n@query\nfunction totalSupply(): UInt64\n\n    use supply_state;\n    var x = toFloat64(supply_state.get());\n    return supply_state.get();\n    //return toFloat64(supply_state.get())/toFloat64(leftShift(1u64, 31u64));\n\nendfunction\n\n\n@query\nfunction balanceOf(address: Address) : UInt64\n\t\n    use balance_state[address];\n    return balance_state.get(address, 0u64);\n\nendfunction\n\n\n@action\nfunction transfer(from: Address, to: Address, value: UInt64) : Bool\n\n    if(!from.signedTx())\n      return false;\n    endif\n\n    use balance_state[from, to];\n    var from_balance = balance_state.get(from, 0u64);\n    var to_balance = balance_state.get(to, 0u64);\n\n    if(from_balance < value)\n      return false;\n    endif\n\n    var u_from = from_balance - value;\n    var u_to = to_balance + value;\n\n    balance_state.set(from, u_from);\n    balance_state.set(to, u_to);\n    return true;\n\nendfunction";
exports.COMPLEX_TRANSFER_CONTRACT = COMPLEX_TRANSFER_CONTRACT;
var SIMPLE_CONTRACT = "\n@init\nfunction init(owner: Address)\nendfunction\n\n@action\nfunction action1()\nendfunction\n\n@action\nfunction action2()\nendfunction\n\n@query\nfunction query1()\nendfunction\n\n@query\nfunction query2()\nendfunction\n";
exports.SIMPLE_CONTRACT = SIMPLE_CONTRACT;
var MULTIPLE_INITS = "\n@init\nfunction setup(owner: Address)\nendfunction\n\n@init\nfunction alternative(owner: Address)\nendfunction\n";
exports.MULTIPLE_INITS = MULTIPLE_INITS;
var NO_ANNOTATIONS = "\nfunction setup(owner: Address)\nendfunction\n\nfunction alternative(owner: Address)\nendfunction";
exports.NO_ANNOTATIONS = NO_ANNOTATIONS;
var NO_INIT = "\n@action\nfunction action1()\nendfunction\n";
exports.NO_INIT = NO_INIT;
var MISSING_PERSISTENT_STATEMENT = "\n@action\nfunction transfer(from: Address, to: Address, amount: String)\n  use balance_state[\"this_string\", to, amount];   \n  use test;\n  // Check if the sender has enough balance to proceed\n  if (balance_state.get(from, 0u64) >= amount)\n    // update the account balances\n    balance_state.set(from, balance_state.get(from) - amount);\n    balance_state.set(to, balance_state.get(to, 0u64) + amount);\n  endif\n\nendfunction";
exports.MISSING_PERSISTENT_STATEMENT = MISSING_PERSISTENT_STATEMENT;
var INVALID_USE_PARAMETER_TYPE = "\npersistent sharded balance_state : UInt64;\n\n@init\nfunction setup(owner : Contract)\n  use balance_state[owner];\n\n  balance_state.set(owner, 1000000u64);\nendfunction";
exports.INVALID_USE_PARAMETER_TYPE = INVALID_USE_PARAMETER_TYPE;
var COMPLEX_USE_STATEMENTS_CONTRACT = "\npersistent sharded balance_state : UInt64;\n\n@init\nfunction setup(owner : Address)\n  use balance_state[owner];\n\n  balance_state.set(owner, 1000000u64);\nendfunction\n\n@action\nfunction transfer(from: Address, to: Address, amount: String)\n  use balance_state[\"this_string\", to, amount];   \n  use test;\n  // Check if the sender has enough balance to proceed\n  if (balance_state.get(from, 0u64) >= amount)\n    // update the account balances\n    balance_state.set(from, balance_state.get(from) - amount);\n    balance_state.set(to, balance_state.get(to, 0u64) + amount);\n  endif\n\nendfunction\n\n@query\nfunction balance(address: Address) : UInt64\n  use balance_state[address];\n  return balance_state.get(address, 0u64);\nendfunction\n\n";
exports.COMPLEX_USE_STATEMENTS_CONTRACT = COMPLEX_USE_STATEMENTS_CONTRACT;
var MUTLISIG_CONTRACT = "\nconst CONTRACT_TEXT = \npersistent sharded balance_state : UInt64;\npersistent supply_state : UInt64;\n@init\nfunction init(owner: Address)\n    use supply_state;\n    use balance_state[owner];\n    supply_state.set(92817u64);\n    balance_state.set(owner, 92817u64);\nendfunction\n@query\nfunction totalSupply(): UInt64\n    use supply_state;\n    return supply_state.get();\nendfunction\n@query\nfunction balanceOf(address: Address) : UInt64\n    use balance_state[address];\n    return balance_state.get(address, 0u64);\nendfunction\n@action\nfunction transfer(from: Address, to: Address, value: UInt64) : Int64\n    if(!from.signedTx())\n      return 0i64;\n    endif\n    use balance_state[from, to];\n    var from_balance = balance_state.get(from, 0u64);\n    var to_balance = balance_state.get(to, 0u64);\n    if(from_balance < value)\n      return 0i64;\n    endif\n    var u_from = from_balance - value;\n    var u_to = to_balance + value;\n    balance_state.set(from, u_from);\n    balance_state.set(to, u_to);\n    return 1i64;\nendfunction\n";
exports.MUTLISIG_CONTRACT = MUTLISIG_CONTRACT;
//# sourceMappingURL=transfer.js.map