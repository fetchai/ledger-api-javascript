"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../errors");
var address_1 = require("./address");
var invalidDeedError_1 = require("../errors/invalidDeedError");
var OPERATIONS;
(function (OPERATIONS) {
    OPERATIONS["AMEND"] = "amend";
    OPERATIONS["TRANSFER"] = "transfer";
    OPERATIONS["EXECUTE"] = "execute";
    OPERATIONS["STAKE"] = "stake";
})(OPERATIONS = exports.OPERATIONS || (exports.OPERATIONS = {}));
var Deed = /** @class */ (function () {
    function Deed() {
    }
    Deed.prototype.set_signee = function (signee, voting_weight) {
        this.signees.push({ signee: signee, voting_weight: voting_weight });
    };
    Deed.prototype.remove_signee = function (signee) {
        for (var i = 0; i < this.signees.length; i++) {
            if (this.signees[i].signee.public_key_hex() === signee.public_key_hex()) {
                this.signees.splice(i, 1);
                break;
            }
        }
    };
    Deed.prototype.set_threshold = function (operation, threshold) {
        if (threshold > this.total_votes) {
            throw new invalidDeedError_1.InvalidDeedError('Attempting to set threshold higher than available votes - it will never be met');
        }
        this.valid_operation(operation);
        // null removes this from list of thresholds
        if (threshold === null) {
            delete this.thresholds[operation];
        }
        else {
            this.thresholds[operation] = threshold;
        }
    };
    Deed.prototype.remove_threshold = function (operation) {
        for (var key in this.thresholds) {
            if (key === operation) {
                delete this.thresholds.key;
            }
        }
    };
    Deed.prototype.return_threshold = function (operation) {
        if (typeof this.thresholds[operation] === 'undefined')
            return null;
        return this.thresholds[operation];
    };
    Deed.prototype.total_votes = function () {
        return this.signees.reduce(function (accum, curr) { return accum + curr.voting_weight; });
    };
    // lets change this to make it more uniform
    Deed.prototype.amend_threshold = function () {
        if (typeof this.thresholds.AMEND !== 'undefined') {
            return this.thresholds.AMEND;
        }
        else {
            return null;
        }
    };
    Deed.prototype.set_amend_threshold = function (value) {
        this.set_threshold(OPERATIONS.AMEND, value);
    };
    Deed.prototype.deed_creation_json = function (allow_no_amend) {
        if (allow_no_amend === void 0) { allow_no_amend = false; }
        var signees = {};
        for (var i = 0; i < this.signees.length; i++) {
            var address = new address_1.Address(this.signees[i].signee).toString();
            signees[address] = this.signees[i].voting_weight;
        }
        var deed = {
            'signees': signees,
            'thresholds': {}
        };
        if (typeof this.thresholds.AMEND !== 'undefined') {
            // Error if amend threshold un-meetable
            if (this.thresholds.AMEND > this.total_votes()) {
                throw new invalidDeedError_1.InvalidDeedError('Amend threshold greater than total voting power - future amendment will be impossible');
            }
        }
        else if (!allow_no_amend) {
            throw new invalidDeedError_1.InvalidDeedError('Creating deed without amend threshold - future amendment will be impossible');
        }
        var lower;
        // Add other thresholds
        for (var key in this.thresholds) {
            lower = key.toLowerCase();
            deed['thresholds'][lower] = this.thresholds[key];
        }
        return deed;
    };
    Deed.prototype.valid_operation = function (operation) {
        if (!Object.values(OPERATIONS).includes(operation)) {
            var str = '';
            for (var op in OPERATIONS) {
                str += op + ', ';
            }
            str.substring(0, str.length - 2);
            throw new errors_1.ValidationError(" " + operation + " is not valid a valid operation. Valid operations are : " + str);
        }
    };
    return Deed;
}());
exports.Deed = Deed;
//# sourceMappingURL=deed.js.map