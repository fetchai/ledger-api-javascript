import {Base} from './base'

export class NetworkUnavailableError extends Base {
	public errors: string;

    constructor(errors) {
        super('Network unavailable error')
        this.errors = errors
    }
}
