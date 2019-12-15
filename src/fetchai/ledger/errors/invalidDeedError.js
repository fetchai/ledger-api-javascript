import {Base} from './base'

export class InvalidDeedError extends Base {
    constructor(errors) {
        super('Invalid Deed Error')
        this.errors = errors
    }
}
