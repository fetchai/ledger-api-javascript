import {Base} from './base'

export class NetworkUnavailableError extends Base {
    constructor(errors) {
        super('Network unavailable error')
        this.errors = errors
    }
}
