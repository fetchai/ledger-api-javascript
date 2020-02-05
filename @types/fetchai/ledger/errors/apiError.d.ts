import { Base } from './base';
export declare class ApiError extends Base {
    errors: string;
    constructor(errors: string);
}
