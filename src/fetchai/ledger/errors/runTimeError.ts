import {Base} from './base'

export class RunTimeError extends Base {
	public errors: string;

    constructor(errors) {
        super('Run time error')
        this.errors = errors
    }
}
