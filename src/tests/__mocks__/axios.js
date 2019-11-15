import {DEFAULT_PORT, LOCAL_HOST} from '../utils/helpers'

export default jest.fn((request) => {

    const requests = [balance, wealth, contract_wealth, contract_status, contract_create, status_chain, status, server_status, query_contract, get_bad_ledger_address, get_bad_ledger_address_2, get_good_ledger_address, list_servers, list_servers_false, contract_action]
    let req, res
    for (let i = 0; i < requests.length; i++) {
        [req, res] = requests[i].call()
        if (equals(request, req)) {
            if (requests[i].name === 'balance') balance_called++
            // kinda hacky but if balance called 3 times we return bigger value
            return Promise.resolve(res)
        }
    }
    return Promise.reject()
})
// e use this variable to
let balance_called = 0

function balance() {
    return [
        JSON.parse(`{"method":"post","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/contract/fetch/token/balance","data":{"address":"2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5"},"headers":{"Content-Type":"application/json; charset=utf-8"}}`),
        (balance_called >= 2) ? JSON.parse('{"data": {"balance": 500}}') : JSON.parse('{"data": {"balance": 275}}')]
}

function get_bad_ledger_address() {
    return [
        JSON.parse('{"method":"get","url":"https://bootstrap.fetch.ai/endpoints","params":{"network":"def"}}'),
        JSON.parse('{"status": 404, "data": {"balance": 500}}')
    ]
}

function get_bad_ledger_address_2() {
    return [
        JSON.parse('{"method":"get","url":"https://bootstrap.fetch.ai/endpoints","params":{"network":"def2"}}'),
        JSON.parse('{"status": 200, "data": {"balance": 500}}')
    ]
}

function get_good_ledger_address() {
    return [
        JSON.parse('{"method":"get","url":"https://bootstrap.fetch.ai/endpoints","params":{"network":"alpha"}}'),
        JSON.parse('{"status": 200, "data": [{"address": "https://foo.bar:500"}]}')
    ]
}

function contract_action() {
    return [
        JSON.parse(`{"method":"post","url":"http://127.0.0.1:8000/api/contract/submit","data":{"ver":"1.2","data":"oUBAAKWva7cAnbFBKrLdfiAPcIP7x/PrkCWNtedeucg4NotTaQHAoIBx6gd6zAfUoBpUonLlSQi/LksfyjKIy3RLTGfm5dcAwcfeXWNAUnsbS8C5rh8Pgs1A39nnqqtphV1dElhllecUCHRyYW5zZmVySZPHIE2lr2u3AJ2xQSqy3X4gD3CD+8fz65AljbXnXrnIODaLU8cgTRwWjo4eHRKKX0nFjQxqAEBYN2yiEYPZ5R0hwv4gGujVzMh5NUmTSOVmEQSIBglvVMGxSIJqBrDd2pjGOpDew4UKXjEE9hEuT7g8mMeqv9Jl+49rhlDqjI7NwLUnWvxBBSzVazJdDEP7wV1qQIE8n7/kAc89OxblcNFWpWGUMKBhS9fln0qw1erNBVG2UmPDiPOBPQVT1egl6PDUvEDzMsYSZ1/HFHgExaThHDI="},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}`),
        JSON.parse('{"status": 200, "data": {"txs":["68fa027aea39f85b09ef92cfc1cc13ceec706c6aadc0b908b549d2e57d611516"],"counts":{"received":1,"submitted":1}}}')
    ]
}

function list_servers() {
    return [
        JSON.parse('{"method":"get","url":"https://bootstrap.fetch.ai/networks/","params":{"active":1}}'),
        JSON.parse(`{
  "status": 200,
  "data": [
    {
      "name": "alpha",
      "versions": "*"
    }
  ]
}`)
    ]
}


function list_servers_false() {
    return [
        JSON.parse('{"method":"get","url":"https://bootstrap.fetch.ai/networks/","params":{}}'),
        JSON.parse(`{
  "status": 200,
  "data": [
    {
      "name": "alpha",
      "versions": "*"
    }
  ]
}`)
    ]
}


function server_status() {
    return [
        JSON.parse(`{"method":"get","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/status"}`),
        JSON.parse('{"data": {"lanes": 3, "version": "0.9.0"}}')
    ]
}

function wealth() {
    return [
        JSON.parse(`{"method":"post","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/contract/fetch/token/wealth","data":{"ver":"1.2","data":"oSCAl6OJh12f8ttl9GTNglv4vlnTzB5rQs3FLhwEdq4yDE1pAQGAC2ZldGNoLnRva2VuBndlYWx0aCp7ImFtb3VudCI6IDEwMDAgInRpbWVzdGFtcCI6MTU3MjgxODU2OTIzMX0EKjivzRm2uTkgcwV8jd4qxY0Spny6uXc374AsTOB+QDccgXdgm7l+zN0KtN93+drXnQgNZGYI894K/w1INoA6/EAgUYTmrx+5iMM96EKfeIrU8jE29ATRVdHTW5KTho56BnScJOPDui3TBOck5xKjccziTyxRFSg9DxzZ5Pxc8SiG"},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}`),
        JSON.parse('{"status": 200, "data": {"txs":["be448a628ed7d406eaf497b7bf56722f1df661c67856b9cedf6d75180859964c"],"counts":{"received":1,"submitted":1}}}')]
}

function contract_wealth() {
    return [
        JSON.parse(`{"method":"post","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/contract/fetch/token/wealth","data":{"ver":"1.2","data":"oSCApa9rtwCdsUEqst1+IA9wg/vH8+uQJY215165yDg2i1NpAQGAC2ZldGNoLnRva2VuBndlYWx0aC17ImFtb3VudCI6IDEwMDAwLCAidGltZXN0YW1wIjogMTU3MzYwMTY3NzI5MX0EiAYJb1TBsUiCagaw3dqYxjqQ3sOFCl4xBPYRLk+4PJjHqr/SZfuPa4ZQ6oyOzcC1J1r8QQUs1WsyXQxD+8FdakB4RkNJVSqcXay0m/HjiD2wdd3yZC0aajuun59Xn1TrdxvBprGZhmiAEVPwkpew4sio9BF2BLUlzt6YJ7LcO7Sk"},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}`),
        JSON.parse('{"status": 200, "data": {"txs":["be448a628ed7d333eaf497b7bf56722f1df661c67856b9cedf6d75180859964c"],"counts":{"received":1,"submitted":1}}}')]
}

function contract_status() {
    return [
        JSON.parse(`{"method":"get","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/status/tx/be448a628ed7d406eaf497b7bf56722f1df661c67856b9cedf6d75180859964c","request_headers":{"Content-Type":"application/json; charset=utf-8"}}`),
        JSON.parse('{"data":{"status": "Executed"}}')]
}

function contract_create() {
    return [
        JSON.parse(`{"method":"post","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/contract/fetch/contract/create","data":{"ver":"1.2","data":"oSCApa9rtwCdsUEqst1+IA9wg/vH8+uQJY215165yDg2i1NpAcEPoIAOZmV0Y2guY29udHJhY3QGY3JlYXRlwQQKeyJ0ZXh0IjoiQ25CbGNuTnBjM1JsYm5RZ2MyaGhjbVJsWkNCaVlXeGhibU5sWDNOMFlYUmxJRG9nVlVsdWREWTBPd29LUUdsdWFYUUtablZ1WTNScGIyNGdjMlYwZFhBb2IzZHVaWElnT2lCQlpHUnlaWE56S1FvZ0lIVnpaU0JpWVd4aGJtTmxYM04wWVhSbFcyOTNibVZ5WFRzS0NpQWdZbUZzWVc1alpWOXpkR0YwWlM1elpYUW9iM2R1WlhJc0lERXdNREF3TURCMU5qUXBPd3BsYm1SbWRXNWpkR2x2YmdvS1FHRmpkR2x2YmdwbWRXNWpkR2x2YmlCMGNtRnVjMlpsY2lobWNtOXRPaUJCWkdSeVpYTnpMQ0IwYnpvZ1FXUmtjbVZ6Y3l3Z1lXMXZkVzUwT2lCVlNXNTBOalFwQ2lBZ2RYTmxJR0poYkdGdVkyVmZjM1JoZEdWYlpuSnZiU3dnZEc5ZE93b0tJQ0F2THlCRGFHVmpheUJwWmlCMGFHVWdjMlZ1WkdWeUlHaGhjeUJsYm05MVoyZ2dZbUZzWVc1alpTQjBieUJ3Y205alpXVmtDaUFnYVdZZ0tHSmhiR0Z1WTJWZmMzUmhkR1V1WjJWMEtHWnliMjBzSURCMU5qUXBJRDQ5SUdGdGIzVnVkQ2tLSUNBZ0lDOHZJSFZ3WkdGMFpTQjBhR1VnWVdOamIzVnVkQ0JpWVd4aGJtTmxjd29nSUNBZ1ltRnNZVzVqWlY5emRHRjBaUzV6WlhRb1puSnZiU3dnWW1Gc1lXNWpaVjl6ZEdGMFpTNW5aWFFvWm5KdmJTa2dMU0JoYlc5MWJuUXBPd29nSUNBZ1ltRnNZVzVqWlY5emRHRjBaUzV6WlhRb2RHOHNJR0poYkdGdVkyVmZjM1JoZEdVdVoyVjBLSFJ2TENBd2RUWTBLU0FySUdGdGIzVnVkQ2s3Q2lBZ1pXNWthV1lLQ21WdVpHWjFibU4wYVc5dUNncEFjWFZsY25rS1puVnVZM1JwYjI0Z1ltRnNZVzVqWlNoaFpHUnlaWE56T2lCQlpHUnlaWE56S1NBNklGVkpiblEyTkFvZ0lIVnpaU0JpWVd4aGJtTmxYM04wWVhSbFcyRmtaSEpsYzNOZE93b0tJQ0J5WlhSMWNtNGdZbUZzWVc1alpWOXpkR0YwWlM1blpYUW9ZV1JrY21WemN5d2dNSFUyTkNrN0NtVnVaR1oxYm1OMGFXOXVDZ289IiwiZGlnZXN0IjoiNzFlYTA3N2FjYzA3ZDRhMDFhNTRhMjcyZTU0OTA4YmYyZTRiMWZjYTMyODhjYjc0NGI0YzY3ZTZlNWQ3MDBjMSIsIm5vbmNlIjoiQzY4Ykp6ajFPU3c9In0EiAYJb1TBsUiCagaw3dqYxjqQ3sOFCl4xBPYRLk+4PJjHqr/SZfuPa4ZQ6oyOzcC1J1r8QQUs1WsyXQxD+8FdakBNNnOnZ/jGF98rIgkcpTnB2Sc6FHkwVXS1+VHKKQbKomQYws+Zg01F/tvcjbGTccC7lgdflh2SPm7+AZyjhc2/"},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}`),
        JSON.parse('{"data":{"txs":["d25a1d7d47756c95506e05fbe9a6b0c6f0ce7ba36666a5a0a1a1c3038cb41e79"],"counts":{"received":1,"submitted":1}}}')]
}

function query_contract() {
    return [
        JSON.parse(`{"method":"post","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/contract/71ea077acc07d4a01a54a272e54908bf2e4b1fca3288cb744b4c67e6e5d700c1/LdZTa21Zcdk2RqbBtJVsxkV66g9SRZcZnpNTcZwSzKccFnFDB/balance","data":{"address":"2FyD1Q6tJJDpoEUQTjf6Rt6Kbv45Q2ZGaqQgAzVunzSjMAN8AZ"},"headers":{"Content-Type":"application/json; charset=utf-8"}}`),
        JSON.parse('{"data":{"status":"success","result":1000000}}')]
}


function status() {
    return [
        JSON.parse(`{"method":"get","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/status/tx/bbc6e88d647ab41923216cdaaba8cdd01f42e953c6583e59179d9b32f52f5777","request_headers":{"Content-Type":"application/json; charset=utf-8"}}`),
        JSON.parse('{"data":{"status": "Executed"}}')
    ]
}

function status_chain() {
    return [
        JSON.parse(`{"method":"get","url":"http://${LOCAL_HOST}:${DEFAULT_PORT}/api/status/chain","params":{"size":1},"headers":{"Content-Type":"application/json; charset=utf-8"}}`),
        JSON.parse('{"data":{"chain":[{"blockNumber":5}]}}')]
}



/*
* Taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript/5522917 (Jean Vincent`s answer).
* Modified, to amoungst other things ignore matching very long strings, which seem to sometimes get corrupted
* and isn't needed for this. Measures that objects are the same in terms of properties and their values.
 */
function equals(x, y) {
    if (x === y) return true
    for (var p in x) {
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




