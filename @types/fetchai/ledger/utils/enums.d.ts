declare enum PREFIX {
    CONTRACT = "fetch.contract",
    TOKEN = "fetch.token"
}
declare enum ENDPOINT {
    NONE = "",
    BALANCE = "balance",
    STAKE = "stake",
    COOLDOWNSTAKE = "cooldownStake",
    ADDSTAKE = "addStake",
    COLLECTSTAKE = "collectStake",
    DESTAKE = "destake",
    DEED = "deed",
    CREATE = "create",
    TRANSFER = "transfer"
}
export { PREFIX, ENDPOINT };
