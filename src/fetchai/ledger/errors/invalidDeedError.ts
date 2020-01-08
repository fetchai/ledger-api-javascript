import {Base} from './base'

export class InvalidDeedError extends Base {
	public errors: string;

    constructor(errors) {
        super('Invalid Deed Error')
        this.errors = errors
    }
}
