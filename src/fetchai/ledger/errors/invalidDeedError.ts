import {Base} from './base'

export class InvalidDeedError extends Base {
	public errors: any;

    constructor(errors) {
        super('Invalid Deed Error')
        this.errors = errors
    }
}
