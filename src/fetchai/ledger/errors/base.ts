export class Base extends Error {
    constructor(message = '') {
        super(message)
        //TODO review  reinstating
        // this.name = this.constructor.name

        // Error.captureStackTrace && Error.captureStackTrace(this, this.constructor)
    }
}
