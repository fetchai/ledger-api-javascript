import {Base} from './base'

export class RunTimeError extends Base {
    constructor(errors) {
        super(errors)
        this.errors = errors
    }
}
