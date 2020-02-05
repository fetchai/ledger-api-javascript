interface ServerListItem {
    readonly name: string;
    readonly versions: string;
    readonly patch: number;
    readonly build: string;
    readonly prerelease: string;
}
export declare class Bootstrap {
    static list_servers(active?: boolean): Promise<Array<ServerListItem>>;
    static is_server_valid(server_list: Array<ServerListItem>, network: string): boolean;
    static get_ledger_address(network: string): Promise<string>;
    /**
     *Splits a url into a protocol, host name and port
     * @param address
     */
    static split_address(address: string): Array<string | number>;
    /**
     * Queries bootstrap for the requested network and returns connection details
     * @param network
     */
    static server_from_name(network: string): Promise<Array<string | number>>;
}
export {};
