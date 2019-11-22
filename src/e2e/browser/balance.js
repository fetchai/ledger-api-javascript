/* eslint-disable no-undef */

// create the APIs
var api = new result.LedgerApi('127.0.0.1', 8000)
const identity1 = new result.Entity()
const prom = api.tokens.balance(identity1)
prom.then(function(b){
    console.log("b is : " + b);
    window.BALANCE = b;
})


// setTimeout(function(){
//     debugger;
//     // const [uri, port] = result.Bootstrap.server_from_name('betanet')
//     //result.Bootstrap.server_from_name('betanet')
//      console.log("it WWW is node::QQQ ");
// }, 5000)
