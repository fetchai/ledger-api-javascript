import {Base} from './base'

export class ApiError extends Base {
	public errors: string;

    constructor(errors: string ) {
        super('API error')
        this.errors = errors
    }
}
