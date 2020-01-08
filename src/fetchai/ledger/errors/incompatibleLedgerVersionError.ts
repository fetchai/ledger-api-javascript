import {Base} from './base'

export class IncompatibleLedgerVersionError extends Base {
	public errors: string;

    constructor(errors) {
        super('Incompatible Ledger Version Error')
        this.errors = errors
    }
}
