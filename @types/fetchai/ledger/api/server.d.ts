import { ApiEndpoint } from './common';
export declare class ServerApi extends ApiEndpoint {
    status(): Promise<any>;
    num_lanes(): Promise<number>;
    version(): Promise<string>;
}
