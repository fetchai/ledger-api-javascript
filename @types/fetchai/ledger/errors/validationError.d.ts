import { Base } from './base';
export declare class ValidationError extends Base {
    errors: string;
    constructor(errors: string);
}
