import { createLogger, format, transports } from 'winston'

// creates a logger object with format:
// <timestamp> <level>: <message>
let logger = createLogger({
	level: 'debug',
	format: format.combine(
		format.colorize(),
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
	),
	transports: [new transports.Console()]
})

// default: silent all logging levels
logger.transports.forEach(t => (t.silent = false))

// allows other application to set its logger
const setLogger = _logger => {
	logger = _logger
}

export { logger, setLogger }
