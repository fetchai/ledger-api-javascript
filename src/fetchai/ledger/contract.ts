import * as fs from "fs";
import assert from "assert";
import { Address } from "./crypto/address";
import { BitVector } from "./bitvector";
import { ContractTxFactory } from "./api/contracts";
import { createHash, randomBytes } from "crypto";
import { default as atob } from "atob";
import { default as btoa } from "btoa";
import { LedgerApi } from "./api";
import { calc_digest, convert_number, logger } from "./utils";
import { RunTimeError, ValidationError } from "./errors";
import { Parser } from "./parser/parser";
import { ShardMask } from "./serialization/shardmask";
import { Entity } from "./crypto/entity";
import { ServerApi } from "./api/server";
import {Identity} from "./crypto";
import {Transaction} from "./transaction";
import {isArray} from "util";

interface ContractJSONSerialized {
    readonly version: number;
    readonly owner: string;
    readonly source: string;
    readonly nonce: string;
}

interface CreateContractOptions {
    api: LedgerApi;
    owner: Entity;
    fee: NumericInput;
}

interface QueryContractOptions {
    api: LedgerApi;
    name: string;
    data: any;
}

/**
 *   Previous versions of the API provided the list of signers as an input, this was mostly done as a work
    * around for the multi-signature support. This has been deprecated and the signer param should be an Entity
   * but Array<Entity> is left in for compatibility
 *
 */
interface ActionContractOptions {
    api: LedgerApi;
    name: string;
    fee: NumericInput;
    signer:  Entity | Array<Entity>;
     args: MessagePackable;
}

const calc_address = (owner: Address, nonce: Buffer): Buffer => {
    assert(owner instanceof Address);
    const hash_func = createHash("sha256");
    hash_func.update(owner.toBytes());
    hash_func.update(nonce);
    return hash_func.digest();
};

export class Contract {
    public _address: Address;
    public _digest: Address;
    public _init: string | null;
    public _nonce: Buffer;
    public _owner: Address;
    public _source: string;

    constructor(source: string, owner: AddressLike, nonce?: Buffer) {
        assert(typeof source === "string");
        this._source = source;
        this._digest = new Address(calc_digest(source));
        this._owner = new Address(owner);
        this._nonce = nonce || randomBytes(8);
        this._address = new Address(calc_address(this._owner, this._nonce));
        const annotations = Parser.get_annotations(source);

        if (
            typeof annotations["@init"] !== "undefined" &&
            annotations["@init"].length > 1
        ) {
            throw new ValidationError(
                `Contract may not have more than one @init function, found: ${annotations[
                    "@init"
                ].join(", ")}`
            );
        } else if (
            typeof annotations["@init"] !== "undefined" &&
            annotations["@init"].length > 0
        ) {
            this._init = annotations["@init"][0];
        } else {
            this._init = null;
        }
    }

    static loads(s: string): Contract {
        return Contract.from_json_object(JSON.parse(s));
    }

    static load(fp: string): Contract {
        const obj = JSON.parse(fs.readFileSync(fp, "utf8"));
        return Contract.from_json_object(obj);
    }



    build_shard_mask(num_lanes: number, name: string | null = null, ordered_args: MessagePackable): BitVector {
        let resource_addresses;
        try {
            resource_addresses = Parser.get_resource_addresses(
                this._source,
                name,
                ordered_args
            );
        } catch {
            return new BitVector()
        }
        return ShardMask.resources_to_shard_mask(
            resource_addresses,
            num_lanes
        );
    }

    static from_json_object(obj: ContractJSONSerialized): Contract {
        assert(obj["version"] === 1);
        const source = atob(obj.source);
        const owner = obj["owner"];
        const nonce = atob(obj["nonce"]);
        return new Contract(source, owner, Buffer.from(nonce, "base64"));
    }

    name(): string {
        return this._digest.toBytes().toString("hex") + this._address.toHex();
    }

    encoded_source(): string {
        return btoa(this._source);
    }

     async create_as_tx(api: LedgerApi, from_address: AddressLike, fee: NumericInput,
                     signers:Array<Identity>) :Promise<Transaction> {
        fee = convert_number(fee)
         const num_lanes = await (api.server as ServerApi).num_lanes()
         //todo delete after checked with ed  if this is ok with [this._owner] as argument here.
         const shard_mask = this.build_shard_mask(num_lanes, this._init, [this._owner])
        const tx = await ContractTxFactory.create({from_address: new Address(from_address), contract: this, fee: fee, signers: signers, shard_mask: shard_mask})
        await api.set_validity_period(tx)
        return tx
     }


    // combined getter/setter mimicking the python.
    owner(owner: AddressLike | null = null): Address {
        if (owner !== null) this._owner = new Address(owner);
        return this._owner;
    }

    digest(): Address {
        return this._digest;
    }

    source(): string {
        return this._source;
    }

    dumps(): string {
        return JSON.stringify(this.to_json_object());
    }

    dump(fp: string): void {
        fs.writeFileSync(fp, JSON.stringify(this.to_json_object()));
    }

    nonce(): string {
        return btoa(this._nonce);
    }

    nonce_bytes(): Buffer {
        return this._nonce;
    }

    address(): Address {
        return this._address;
    }

    async create({
        api,
        owner,
        fee
    }: CreateContractOptions): Promise<string> {
        this.owner(owner);
        fee = convert_number(fee);

        const num_lanes = await (api.server as ServerApi).num_lanes();
        const shard_mask: BitVector = this.build_shard_mask(num_lanes, this._init, [this._owner])

        return api.contracts.create({
            owner: owner,
            contract: this,
            fee: fee,
            shard_mask: shard_mask
        });
    }

    async query({ api, name, data = null }: QueryContractOptions): Promise<any> {
        if (this._owner === null) {
            throw new RunTimeError(
                "Contract has no owner, unable to perform any queries. Did you deploy it?"
            );
        }

        const annotations = Parser.get_annotations(this._source);

        if (
            typeof annotations["@query"] === "undefined" ||
            !annotations["@query"].includes(name)
        ) {
            throw new ValidationError(
                `Contract does not contain function: ${name} with annotation @query`
            );
        }
        const [success, response] = await api.contracts.query({
            contract_owner: this._address,
            query: name,
            data: data
        });

        if (!success) {
            if (response !== null && "msg" in response) {
                throw new RunTimeError(
                    "Failed to make requested query: " + response["msg"]
                );
            } else {
                throw new RunTimeError(
                    "Failed to make requested query with no error message."
                );
            }
        }
        return response["result"];
    }

    async action({
        api,
        name,
        fee,
        signer = null,
        args
    }: ActionContractOptions): Promise<any> {
        fee = convert_number(fee);
        // verify if we are used undefined
        if (this._owner === null) {
            throw new RunTimeError(
                'Contract has no owner, unable to perform any actions. Did you deploy it?'
            );
        }

        // TODO(WK): Reinstate without breaking contract-to-contract calls
        // const annotations = Parser.get_annotations(this._source);
        //
        // if (
        //     typeof annotations["@action"] === "undefined" ||
        //     !annotations["@action"].includes(name)
        // ) {
        //     throw new ValidationError(
        //         `Contract does not contain function: ${name} with annotation @action`
        //     );
        // }

        signer = Contract.convert_to_single_entity(signer)
        const num_lanes = await api.server.num_lanes();
        const shard_mask = this.build_shard_mask(num_lanes, name, args)

        return api.contracts.action({
            contract_address: this._address,
            action: name,
            fee: fee,
            args: args,
            signer: signer,
            shard_mask: shard_mask
        });
    }

    static convert_to_single_entity(value: Entity | Array<Entity>): Entity
    {
        if(value instanceof Entity) return value;
        if(!isArray(value)
            || value.length > 1
            || !(value[0] instanceof Entity))
            throw new ValidationError('Expected Entity, or Array of Entities (legacy support)')
        return value[0]
    }



    to_json_object(): ContractJSONSerialized {
        return {
            version: 1,
            owner: this._owner.toString(), // None if self._owner is None else str(self._owner),
            source: this.encoded_source(),
            nonce: this.nonce()
        };
    }
}
