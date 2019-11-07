import {Base} from './base'

export class IncompatibleLedgerVersionError extends Base {
    constructor(errors) {
        super('Incompatible Ledger Version Error')
        this.errors = errors
    }
}
