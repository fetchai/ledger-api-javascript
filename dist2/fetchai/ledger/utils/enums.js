"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PREFIX;
(function (PREFIX) {
    PREFIX["CONTRACT"] = "fetch.contract";
    PREFIX["TOKEN"] = "fetch.token";
})(PREFIX || (PREFIX = {}));
exports.PREFIX = PREFIX;
//Non-exhaustive list of common endpoints: additional custom endpoints may also exist
var ENDPOINT;
(function (ENDPOINT) {
    ENDPOINT["NONE"] = "";
    ENDPOINT["BALANCE"] = "balance";
    ENDPOINT["STAKE"] = "stake";
    ENDPOINT["COOLDOWNSTAKE"] = "cooldownStake";
    ENDPOINT["ADDSTAKE"] = "addStake";
    ENDPOINT["COLLECTSTAKE"] = "collectStake";
    ENDPOINT["DESTAKE"] = "destake";
    ENDPOINT["DEED"] = "deed";
    ENDPOINT["CREATE"] = "create";
    ENDPOINT["TRANSFER"] = "transfer";
})(ENDPOINT || (ENDPOINT = {}));
exports.ENDPOINT = ENDPOINT;
//# sourceMappingURL=enums.js.map