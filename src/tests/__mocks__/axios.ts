const {DEFAULT_PORT, LOCAL_HOST} = require('../utils/helpers')

type Tuple = [string, string];


export default jest.fn((request) => {

    const requests = [stake, create, stake_cooldown, collect_stake, deed, balance, balance_token, de_stake, contract_wealth, contract_status, contract_create, status_chain, status, server_status, query_contract, get_bad_ledger_address, get_bad_ledger_address_2, get_good_ledger_address, list_servers, list_servers_false, contract_action, tx_content, version]
    let req, res
    for (let i = 0; i < requests.length; i++) {
        [req, res] = requests[i].call(this)
        if (equals(request, req)) {
            if (requests[i].name === 'balance') balance_called++
            // kinda hacky but if balance called 3 times we return bigger value
            return Promise.resolve(res)
        }
    }
})

function create(): Tuple {
    return [
        JSON.parse('{"method":"get","url":"http://127.0.0.1:8000/api/status/tx/"}'),
        JSON.parse('{"status": 200, "data":{"status": "Executed", "exit_code": 2, "tx": "0x00", "charge": 77, "charge_rate": 33, "fee": 5}}')]
}

function stake(): Tuple {
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/fetch/token/addStake","data":{"ver":"1.2","data":"oWCAAFMjmN2IPRmQ99rT/ealOlM0evwmgKBHSPfxWtA8rcTUwQPoATKAC2ZldGNoLnRva2VuCGFkZFN0YWtldHsiYWRkcmVzcyI6IkdNS2pPdmk5TExwL3B4U29RS01Jb2hlcVJJT0lDeDd4UzAvZi9naXJsVzQvUzVJYzdETytmQ1dNL1hBbG9ybXBRbmNPV3hkMWk4eEpZYnZjZGFBbEhBPT0iLCJhbW91bnQiOjEwMDB97oZBnwF4rK4EGMKjOvi9LLp/pxSoQKMIoheqRIOICx7xS0/f/girlW4/S5Ic7DO+fCWM/XAlormpQncOWxd1i8xJYbvcdaAlHEA3UZ6Q4iklaWDRrkZxEvVWLqT0dfYCaGXYRjBX55XAjEswudIl/XRtak+2zTUNrw0NsKyAxCLf1/ayRhIQ+WTd"},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}'),
        JSON.parse('{"status": 200, "data": {"txs":["68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516"]}}')]
}

function collect_stake(): Tuple {
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/fetch/token/collectStake","data":{"ver":"1.2","data":"oWCAAFMjmN2IPRmQ99rT/ealOlM0evwmgKBHSPfxWtA8rcTUwQPoAcEBLIALZmV0Y2gudG9rZW4MY29sbGVjdFN0YWtlAO6GQZ8BeKyuBBjCozr4vSy6f6cUqECjCKIXqkSDiAse8UtP3/4Iq5VuP0uSHOwzvnwljP1wJaK5qUJ3DlsXdYvMSWG73HWgJRxACRV31mXnLHFceJxfpn1KFZBdnDYlPeAB/CaquVwb+Wkia81pLKF5nV/36Fm7+wJoIbrs13eLeAvko22Wx1v6Fg=="},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}'),
        JSON.parse('{"status": 200, "data": {"txs":["68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516"]}}')]
}


function deed(): Tuple {
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/fetch/token/deed","data":{"ver":"1.2","data":"oWCAAFMjmN2IPRmQ99rT/ealOlM0evwmgKBHSPfxWtA8rcTUwQPoAcEnEIALZmV0Y2gudG9rZW4EZGVlZFN7InNpZ25lZXMiOnsiRlducXppdXp3OEV4UEpYVGU1SzlYdXIyWWIxWW1hRTRvWm5MS0NEQ0RVVXVKTHBoTCI6Mn0sInRocmVzaG9sZHMiOnt9fe6GQZ8BeKyuBBjCozr4vSy6f6cUqECjCKIXqkSDiAse8UtP3/4Iq5VuP0uSHOwzvnwljP1wJaK5qUJ3DlsXdYvMSWG73HWgJRxASsNGdihFfe5zJAVMQkiqsa7bc50H9eIvUzJJw/qxp8QxUkVzM9j+TP2XOB1NVHXnU6qykxbk1pP9dMVfIrqVAA=="},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}'),
        JSON.parse('{"status": 200, "data": {"txs":["68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516"] }}')]
}

function de_stake(): Tuple {
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/fetch/token/destake","data":{"ver":"1.2","data":"oWCAAFMjmN2IPRmQ99rT/ealOlM0evwmgKBHSPfxWtA8rcTUYwEZgAtmZXRjaC50b2tlbgdkZXN0YWtlc3siYWRkcmVzcyI6IkdNS2pPdmk5TExwL3B4U29RS01Jb2hlcVJJT0lDeDd4UzAvZi9naXJsVzQvUzVJYzdETytmQ1dNL1hBbG9ybXBRbmNPV3hkMWk4eEpZYnZjZGFBbEhBPT0iLCJhbW91bnQiOjMwMH0nNkyVCe4HbAQYwqM6+L0sun+nFKhAowiiF6pEg4gLHvFLT9/+CKuVbj9LkhzsM758JYz9cCWiualCdw5bF3WLzElhu9x1oCUcQCyOCFUURnKJc2yaV8qorrsMDCJ67lY4pFcJbPU+5SYGXqSbGb0AG1PGe3MucnWYWvkg1+HbH0Ec9k4/diTPWGs="},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}'),
        JSON.parse('{"status": 200, "data": {"txs":["68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516"]}}')]
}

function stake_cooldown(): Tuple {
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/fetch/token/cooldownStake","data":{"address":"dcgBKQnx4i3ayLbqcqstt4kSHNfDC4Am9TgyhF4RimY1eNHTP"},"headers":{"Content-Type":"application/json; charset=utf-8"}}'),
        JSON.parse('{"status": 200, "data": {"cooldownStake": 500}}')]
}

// e use this variable to
let balance_called = 0

function balance(): Tuple {
    return [
        JSON.parse(`{"method":"post","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/contract/fetch/token/balance","data":{"address":"2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5"},"headers":{"Content-Type":"application/json; charset=utf-8"}}`),
        (balance_called >= 2) ? JSON.parse('{"data": {"balance": 500}}') : JSON.parse('{"data": {"balance": 275}}')]
}

function balance_token(): Tuple {
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/fetch/token/balance","data":{"address":"dTSCNwHBPoDdESpxj6NQkPDvX3DN1DFKGsUPZNVWDVDrfur4z"},"headers":{"Content-Type":"application/json; charset=utf-8"}}'),
        JSON.parse('{"data": {"balance": 300}}')]
}

function tx_content(): Tuple {
    return [
        JSON.parse('{"method":"get","url":"http://127.0.0.1:8000/api/tx/be448a628ed7d333eaf497b7bf56722f1df661c67856b9cedf6d75180859964c"}'),
        JSON.parse('{"status": 200, "data": {"digest":"0x123456","action":"transfer","chainCode":"action.transfer","from":"U5dUjGzmAnajivcn4i9K4HpKvoTvBrDkna1zePXcwjdwbz1yB","validFrom":0,"validUntil":100,"charge":2,"chargeLimit":5,"transfers":[],"signatories":["abc"],"data":"def"}}')
    ]
}

function get_bad_ledger_address(): Tuple {
    return [
        JSON.parse('{"method":"get","url":"https://bootstrap.fetch.ai/endpoints","params":{"network":"def"}}'),
        JSON.parse('{"status": 404, "data": {"balance": 500}}')
    ]
}

function get_bad_ledger_address_2(): Tuple {
    return [
        JSON.parse('{"method":"get","url":"https://bootstrap.fetch.ai/endpoints","params":{"network":"def2"}}'),
        JSON.parse('{"status": 200, "data": {"balance": 500}}')
    ]
}

function get_good_ledger_address(): Tuple {
    return [
        JSON.parse('{"method":"get","url":"https://bootstrap.fetch.ai/endpoints","params":{"network":"alpha"}}'),
        JSON.parse('{"status": 200, "data": [{"address": "https://foo.bar:500"}]}')
    ]
}

function contract_action(): Tuple {
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/submit","data":{"ver":"1.2","data":"oUBAAKWva7cAnbFBKrLdfiAPcIP7x/PrkCWNtedeucg4NotTaQHAoIBx6gd6zAfUoBpUonLlSQi/LksfyjKIy3RLTGfm5dcAwcfeXWNAUnsbS8C5rh8Pgs1A39nnqqtphV1dElhllecUCHRyYW5zZmVySZPHIE2lr2u3AJ2xQSqy3X4gD3CD+8fz65AljbXnXrnIODaLU8cgTRwWjo4eHRKKX0nFjQxqAEBYN2yiEYPZ5R0hwv4gGujVzMh5NUmTSOVmEQSIBglvVMGxSIJqBrDd2pjGOpDew4UKXjEE9hEuT7g8mMeqv9Jl+49rhlDqjI7NwLUnWvxBBSzVazJdDEP7wV1qQIE8n7/kAc89OxblcNFWpWGUMKBhS9fln0qw1erNBVG2UmPDiPOBPQVT1egl6PDUvEDzMsYSZ1/HFHgExaThHDI="},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}'),
        JSON.parse('{"status": 200, "data": {"txs":["68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516"],"counts":{"received":1,"submitted":1}}}')
    ]
}

function list_servers(): Tuple {
    return [
        JSON.parse('{"method":"get","url":"https://bootstrap.fetch.ai/networks/","params":{"active":1}}'),
        JSON.parse('{"status": 200,"data": [{"name": "alpha", "versions": "*"}]}')
    ]
}


function list_servers_false(): Tuple {
    return [
        JSON.parse('{"method":"get","url":"https://bootstrap.fetch.ai/networks/","params":{}}'),
        JSON.parse('{"status": 200, "data": [{"name": "alpha","versions": "*"}]}')
    ]
}


function server_status(): Tuple {
    return [
        JSON.parse(`{"method":"get","url":"https://foo.bar:500/api/status"}`),
        JSON.parse('{"status": 200, "data": {"lanes": 4, "version": "0.9.0"}}')
    ]
}

function version(): Tuple {
    return [
        JSON.parse(`{"method":"get","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/status"}`),
        JSON.parse('{"data": {"lanes": 4, "version": "0.9.0"}}')
    ]
}

function contract_wealth(): Tuple {
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/fetch/token/transfer","data":{"ver":"1.2","data":"oWQAAFMjmN2IPRmQ99rT/ealOlM0evwmgKBHSPfxWtA8rcTUQjUTCsWqtELjn5qicRiVZpUikhLdLxq1txTp9r1YFRHBA+jBA+gBMu6GQZ8BeKyuBBjCozr4vSy6f6cUqECjCKIXqkSDiAse8UtP3/4Iq5VuP0uSHOwzvnwljP1wJaK5qUJ3DlsXdYvMSWG73HWgJRxAmK9I0scC/2iqo1iYr0MHSap5lvsSyqyLCZgoHJsTPWAgh6hvSqkVNBSswOIb0hPes9IexgByKgq9FO9axGD24Q=="},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}'),
        JSON.parse('{"status": 200, "data": {"txs":["be448a628ed7d333eaf497b7bf56722f1df661c67856b9cedf6d75180859964c"],"counts":{"received":1,"submitted":1}}}')]
}

function contract_status(): Tuple {
    return [
        JSON.parse(`{"method":"get","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/status/tx/be448a628ed7d406eaf497b7bf56722f1df661c67856b9cedf6d75180859964c","request_headers":{"Content-Type":"application/json; charset=utf-8"}}`),
        JSON.parse('{"status": 200, "data":{"status": "Executed", "exit_code": 2, "tx": "0x00", "charge": 77, "charge_rate": 33, "fee": 5}}')]
}

function contract_create(): Tuple {
    return [
        JSON.parse(`{"method":"post","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/contract/fetch/contract/create","data":{"ver":"1.2","data":"oSCApa9rtwCdsUEqst1+IA9wg/vH8+uQJY215165yDg2i1NpAcEPoIAOZmV0Y2guY29udHJhY3QGY3JlYXRlwQQKeyJ0ZXh0IjoiQ25CbGNuTnBjM1JsYm5RZ2MyaGhjbVJsWkNCaVlXeGhibU5sWDNOMFlYUmxJRG9nVlVsdWREWTBPd29LUUdsdWFYUUtablZ1WTNScGIyNGdjMlYwZFhBb2IzZHVaWElnT2lCQlpHUnlaWE56S1FvZ0lIVnpaU0JpWVd4aGJtTmxYM04wWVhSbFcyOTNibVZ5WFRzS0NpQWdZbUZzWVc1alpWOXpkR0YwWlM1elpYUW9iM2R1WlhJc0lERXdNREF3TURCMU5qUXBPd3BsYm1SbWRXNWpkR2x2YmdvS1FHRmpkR2x2YmdwbWRXNWpkR2x2YmlCMGNtRnVjMlpsY2lobWNtOXRPaUJCWkdSeVpYTnpMQ0IwYnpvZ1FXUmtjbVZ6Y3l3Z1lXMXZkVzUwT2lCVlNXNTBOalFwQ2lBZ2RYTmxJR0poYkdGdVkyVmZjM1JoZEdWYlpuSnZiU3dnZEc5ZE93b0tJQ0F2THlCRGFHVmpheUJwWmlCMGFHVWdjMlZ1WkdWeUlHaGhjeUJsYm05MVoyZ2dZbUZzWVc1alpTQjBieUJ3Y205alpXVmtDaUFnYVdZZ0tHSmhiR0Z1WTJWZmMzUmhkR1V1WjJWMEtHWnliMjBzSURCMU5qUXBJRDQ5SUdGdGIzVnVkQ2tLSUNBZ0lDOHZJSFZ3WkdGMFpTQjBhR1VnWVdOamIzVnVkQ0JpWVd4aGJtTmxjd29nSUNBZ1ltRnNZVzVqWlY5emRHRjBaUzV6WlhRb1puSnZiU3dnWW1Gc1lXNWpaVjl6ZEdGMFpTNW5aWFFvWm5KdmJTa2dMU0JoYlc5MWJuUXBPd29nSUNBZ1ltRnNZVzVqWlY5emRHRjBaUzV6WlhRb2RHOHNJR0poYkdGdVkyVmZjM1JoZEdVdVoyVjBLSFJ2TENBd2RUWTBLU0FySUdGdGIzVnVkQ2s3Q2lBZ1pXNWthV1lLQ21WdVpHWjFibU4wYVc5dUNncEFjWFZsY25rS1puVnVZM1JwYjI0Z1ltRnNZVzVqWlNoaFpHUnlaWE56T2lCQlpHUnlaWE56S1NBNklGVkpiblEyTkFvZ0lIVnpaU0JpWVd4aGJtTmxYM04wWVhSbFcyRmtaSEpsYzNOZE93b0tJQ0J5WlhSMWNtNGdZbUZzWVc1alpWOXpkR0YwWlM1blpYUW9ZV1JrY21WemN5d2dNSFUyTkNrN0NtVnVaR1oxYm1OMGFXOXVDZ289IiwiZGlnZXN0IjoiNzFlYTA3N2FjYzA3ZDRhMDFhNTRhMjcyZTU0OTA4YmYyZTRiMWZjYTMyODhjYjc0NGI0YzY3ZTZlNWQ3MDBjMSIsIm5vbmNlIjoiQzY4Ykp6ajFPU3c9In0EiAYJb1TBsUiCagaw3dqYxjqQ3sOFCl4xBPYRLk+4PJjHqr/SZfuPa4ZQ6oyOzcC1J1r8QQUs1WsyXQxD+8FdakBNNnOnZ/jGF98rIgkcpTnB2Sc6FHkwVXS1+VHKKQbKomQYws+Zg01F/tvcjbGTccC7lgdflh2SPm7+AZyjhc2/"},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}`),
        JSON.parse('{"data":{"txs":["d25a1d7d47756c95506e05fbe9a6b0c6f0ce7ba36666a5a0a1a1c3038cb41e79"],"counts":{"received":1,"submitted":1}}}')]
}

function query_contract(): Tuple {
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/25b6zQfoFcy7iVneBJtua7LrxTuiCzQA8F4GngJCZSpMKEfQpz/balance","data":{"address":"2FyD1Q6tJJDpoEUQTjf6Rt6Kbv45Q2ZGaqQgAzVunzSjMAN8AZ"},"headers":{"Content-Type":"application/json; charset=utf-8"}}'),
        JSON.parse('{"status": 200, "data":{"status":"success","result":1000000}}')]
}


function status(): Tuple {
    return [
        JSON.parse(`{"method":"get","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/status/tx/bbc6e88d647ab41923216cdaaba8cdd01f42e953c6583e59179d9b32f52f5777"}`),
        JSON.parse('{"status": 200, "data":{"status": "Executed", "exit_code": 2, "tx": "0x00", "charge": 77, "charge_rate": 33, "fee": 5}}')
    ]
}

function status_chain(): Tuple {
    return [
        JSON.parse(`{"method":"get","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/status/chain","params":{"size":1},"headers":{"Content-Type":"application/json; charset=utf-8"}}`),
        JSON.parse('{"data":{"chain":[{"blockNumber":5}]}}')]
}

/*
* Taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript/5522917 (Jean Vincent`s answer).
* Modified, to amoungst other things ignore matching very long strings, which seem to sometimes get corrupted
* and isn't needed for this. Measures that objects are the same in terms of properties and their values.
 */
function equals(x: any, y: any): boolean {
    if (x === y) return true
    let p
    for (p in x) {
        if (!x.hasOwnProperty(p)) continue
        if (!y.hasOwnProperty(p)) return false
        if (x[p] === y[p]) continue
        if (typeof x[p] === 'string' && x[p].length > 150) continue
        if (typeof (x[p]) !== 'object') return false
        if (!equals(x[p], y[p])) return false
    }
    for (p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false
    }
    return true
}




