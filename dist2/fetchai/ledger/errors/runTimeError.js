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
var RunTimeError = /** @class */ (function (_super) {
    __extends(RunTimeError, _super);
    function RunTimeError(errors) {
        var _this = _super.call(this, 'Run time error') || this;
        _this.errors = errors;
        return _this;
    }
    return RunTimeError;
}(base_1.Base));
exports.RunTimeError = RunTimeError;
//# sourceMappingURL=runTimeError.js.map