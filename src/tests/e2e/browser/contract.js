const tok_transfer_amount = 200
const fet_tx_fee = 160
let api = new result.LedgerApi('127.0.0.1', 8000)
const identity1 = new result.Entity()
const identity2 = new result.Entity()
const address1 = new result.Address(identity1)
const address2 = new result.Address(identity2)
const tx = api.tokens.wealth(identity1, 10000)

    tx.then((tx) => {
        const sync = api.sync([tx])
        sync.then(() => {
            const contract = new result.Contract(result.TRANSFER_CONTRACT, identity1)
            const created = contract.create(api, identity1, 4000)
            created.then(function(created){
                const sync2 = api.sync([created])
                sync2.then(() => {
                    const action = contract.action(api, 'transfer', fet_tx_fee, [identity1], [address1, address2, tok_transfer_amount])
                    action.then(function(txs){
                        const sync3 = api.sync([txs])
                        sync3.then(() => {
                            save_address_balances(api, contract,[address1, address2])
                        })
                    })
                })
            })
        })
    })

    // note this does not wait, and therefore, is for testing the balances once set.
    function save_address_balances(api, contract, addresses) {
        if(!Array.isArray(addresses)){
            // add error handling
            console.log('EXITED HERE ')
            return
        }
        let balance, query
        for (let i = 0; i < addresses.length; i++) {
            balance = api.tokens.balance(addresses[i])
            balance.then(res => window[`BALANCE${i}`] = res)
            query = contract.query(api, 'balance', {address: addresses[i]})
            query.then(tok => window[`TOK${i}`] = tok)
        }
    }
