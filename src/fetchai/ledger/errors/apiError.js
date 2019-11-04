import {Base} from './base'

export class ApiError extends Base {
    constructor(errors) {
        super(errors)
        this.errors = errors
    }
}
