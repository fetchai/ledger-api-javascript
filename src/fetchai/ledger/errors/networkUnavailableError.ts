import {Base} from './base'

export class NetworkUnavailableError extends Base {
	public errors: any;

    constructor(errors) {
        super('Network unavailable error')
        this.errors = errors
    }
}
