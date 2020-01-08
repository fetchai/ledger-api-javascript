import {Base} from './base'

export class ValidationError extends Base {
	public errors: string;

    constructor(errors) {
        super('Validation Error')
        this.errors = errors
    }
}
