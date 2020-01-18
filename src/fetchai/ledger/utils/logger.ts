import {createLogger, format, transports} from 'winston'

// creates a logger object with format:
// <timestamp> <level>: <message>
const logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.colorize(),
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [new transports.Console()]
});


// default: silent all logging levels
logger.transports.forEach((t): false => (t.silent = false));

export {logger}
