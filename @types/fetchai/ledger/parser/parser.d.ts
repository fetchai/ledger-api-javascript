interface FuncInfo {
    readonly identifier: string;
    readonly type: string;
}
interface UseStatementInfo {
    readonly sharded: boolean;
    readonly identifier: string;
    readonly params?: Array<string>;
}
export declare class Parser {
    static remove_comments(source: string): string;
    static get_functions(source: string): Array<string>;
    static get_sharded_use_names(source: string): Array<string>;
    static get_annotations(source: string): Record<string, string>;
    static get_func_params(func_source: string): Array<FuncInfo>;
    static parse_use_statements(source: string): Array<UseStatementInfo>;
    static get_resource_addresses(source: string, func_name: string, ordered_args: MessagePackable): Array<string>;
}
export {};
