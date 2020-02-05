import { Base } from './base';
export declare class IncompatibleLedgerVersionError extends Base {
    errors: string;
    constructor(errors: string);
}
