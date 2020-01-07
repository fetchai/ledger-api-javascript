import {Base} from './base'

export class RunTimeError extends Base {
	public errors: any;

    constructor(errors) {
        super('Run time error')
        this.errors = errors
    }
}
