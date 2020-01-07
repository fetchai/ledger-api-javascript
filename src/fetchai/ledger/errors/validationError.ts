import {Base} from './base'

export class ValidationError extends Base {
	public errors: any;

    constructor(errors) {
        super('Validation Error')
        this.errors = errors
    }
}
