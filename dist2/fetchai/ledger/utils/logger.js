"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
// creates a logger object with format:
// <timestamp> <level>: <message>
var logger = winston_1.createLogger({
    level: 'debug',
    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.printf(function (info) { return info.timestamp + " " + info.level + ": " + info.message; })),
    transports: [new winston_1.transports.Console()]
});
exports.logger = logger;
// default: silent all logging levels
logger.transports.forEach(function (t) { return (t.silent = false); });
// allows other application to set its logger
var setLogger = function (logger) {
    logger = logger;
    return;
};
exports.setLogger = setLogger;
//# sourceMappingURL=logger.js.map