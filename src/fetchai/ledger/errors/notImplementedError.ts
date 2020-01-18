import {Base} from './base'

export class NotImplementedError extends Base {
    public errors: string;

    constructor(errors: string) {
        super('This function has not been implemented');
        this.errors = errors
    }
}
