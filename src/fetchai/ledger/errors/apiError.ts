import {Base} from './base'

export class ApiError extends Base {
	public errors: any;

    constructor(errors) {
        super('API error')
        this.errors = errors
    }
}
