import {Base} from './base'

export class ValidationError extends Base {
    public errors: string;

    constructor(errors: string) {
        super('Validation Error')
        this.errors = errors
    }
}
