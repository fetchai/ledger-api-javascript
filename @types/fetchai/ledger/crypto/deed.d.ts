import { Entity } from './entity';
export declare enum OPERATIONS {
    AMEND = "amend",
    TRANSFER = "transfer",
    EXECUTE = "execute",
    STAKE = "stake"
}
interface Signee {
    signee: Entity;
    voting_weight: number;
}
interface Thresholds {
    [OPERATIONS: string]: number;
}
interface DeedJson {
    readonly signees: {
        [key: string]: number;
    };
    readonly thresholds: {
        [key: string]: number;
    };
}
export declare class Deed {
    signees: Array<Signee>;
    thresholds: Thresholds;
    set_signee(signee: Entity, voting_weight: number): void;
    remove_signee(signee: Entity): void;
    set_threshold(operation: OPERATIONS, threshold: number): void;
    remove_threshold(operation: OPERATIONS): void;
    return_threshold(operation: OPERATIONS): number;
    total_votes(): any;
    amend_threshold(): number | null;
    set_amend_threshold(value: number): void;
    deed_creation_json(allow_no_amend?: boolean): DeedJson;
    valid_operation(operation: OPERATIONS): void;
}
export {};
