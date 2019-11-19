/* eslint-disable no-undef */

// create the APIs


async function main() {
    const api = new result.LedgerApi('127.0.0.1', 8000)
// generate a random identity
    const identity1 = new result.Entity()
    const b = await api.tokens.balance(identity1)
    console.log('BALANCE in wealth : ', b);
    const tx = await api.tokens.wealth(identity1, 1000)
    await api.sync([tx])
   await  api.tokens.balance(identity1)
}
main();
