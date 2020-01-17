enum PREFIX {
    CONTRACT = 'fetch.contract',
    TOKEN = 'fetch.token',
}

//Non-exhaustive list of common endpoints: additional custom endpoints may also exist
enum ENDPOINT {
    NONE = '',
    BALANCE = 'balance',
    STAKE = 'stake',
    COOLDOWNSTAKE = 'cooldownStake',
    ADDSTAKE = 'addStake',
    COLLECTSTAKE = 'collectStake',
    DESTAKE = 'destake',
    DEED = 'deed',
    CREATE = 'create',
    TRANSFER = 'transfer'
}

export {PREFIX, ENDPOINT}
