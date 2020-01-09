"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
var InvalidDeedError = /** @class */ (function (_super) {
    __extends(InvalidDeedError, _super);
    function InvalidDeedError(errors) {
        var _this = _super.call(this, 'Invalid Deed Error') || this;
        _this.errors = errors;
        return _this;
    }
    return InvalidDeedError;
}(base_1.Base));
exports.InvalidDeedError = InvalidDeedError;
//# sourceMappingURL=invalidDeedError.js.map