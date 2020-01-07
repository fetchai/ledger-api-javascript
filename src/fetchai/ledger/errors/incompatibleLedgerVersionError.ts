import {Base} from './base'

export class IncompatibleLedgerVersionError extends Base {
	public errors: any;

    constructor(errors) {
        super('Incompatible Ledger Version Error')
        this.errors = errors
    }
}
