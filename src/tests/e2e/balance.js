/* eslint-disable no-undef */

// create the APIs


async function main() {
    var api = new result.LedgerApi('127.0.0.1', 8000)
    const identity1 = new result.Entity()
    const b = await api.tokens.balance(identity1)

     console.log("in !!! AWAITED B lance Balance: ", b)

    // b.then(function (value) {
    //     console.log("in !!! RESOLVED qqq balance Balance: ")
    //     console.log(value);
    // }, function (val) {
    //     console.log("in REJECTED Balance: ")
    //     console.log(val);
    // });
}

main();


