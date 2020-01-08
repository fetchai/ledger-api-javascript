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
var Base = /** @class */ (function (_super) {
    __extends(Base, _super);
    function Base(message) {
        if (message === void 0) { message = ''; }
        return _super.call(this, message) || this;
        //TODO review  reinstating
        // this.name = this.constructor.name
        // Error.captureStackTrace && Error.captureStackTrace(this, this.constructor)
    }
    return Base;
}(Error));
exports.Base = Base;
//# sourceMappingURL=base.js.map