import {ValidationError} from '../errors'
import {Address} from './address'
import {InvalidDeedError} from '../errors/invalidDeedError'
import {Entity} from './entity'
import {validJSONObject} from "../utils/json";

// todo refatcor as per reverse mapping enum hack https://stackoverflow.com/questions/44883072/reverse-mapping-for-string-enums
export enum OPERATIONS {
    AMEND = 'amend',
    TRANSFER = 'transfer',
    EXECUTE = 'execute',
    STAKE = 'stake'
}

interface Signee {
    signee: Address;
    voting_weight: number;
}

interface Thresholds {
    [OPERATIONS: string]: number;
}

//json to be sent as data when creating deed.
interface DeedJson {
    readonly signees: {
        [key: string]: number;
    };
    readonly thresholds: {
        [key: string]: number;
    };
}

const one_or_greater_integer = (voting_weight: number): void => {

    if(!Number.isInteger(voting_weight)){
        throw new ValidationError(`Voting weight must be integer. Voting weight:  ${voting_weight} is not an integer `)
    }

     if(voting_weight < 1){
                 throw new ValidationError(`Voting weight must be integer greater than 1. Voting weight:  ${voting_weight}
                  is not greater than 1 `)
     }
}

export class Deed {
    public signees: Array<Signee> = [];
    public thresholds: Thresholds = {};
    public required_amend: boolean = true;


    get_signees(): Array<Address>  {
        return this.signees.map(el => el.signee)
    }


    get_votes(): Array<number> {
        return this.signees.map(el => el.voting_weight)
    }

    operations(): Array<string> {
        return Object.keys(this.thresholds)
    }

    total_votes(): any {
        return this.signees.reduce((accum: any, curr: any): any => accum + curr.voting_weight)
    }

    set require_amend(value: boolean) {
        this.required_amend = value;
    }

    get require_amend() : boolean {
        return this.required_amend
    }



    set_signee(signee: AddressLike, voting_weight: number): void {

         signee = new Address(signee)
         one_or_greater_integer(voting_weight)
        this.signees.push({signee: signee, voting_weight: voting_weight})
    }


     get_signee(signee: AddressLike): number | null {
         signee = new Address(signee)
         const target = this.signees.find(el => el.signee.toString() === signee.toString())
         return typeof target == "undefined" ? null : target[0].voting_weight
     }

    remove_signee(signee: AddressLike): void {
        signee = new Address(signee)
        var idx = this.signees.findIndex(el => el.signee.toString() === signee.toString());
        this.signees.splice(idx,1);
    }

    set_operation(operation: OPERATIONS, threshold: number): void {
        one_or_greater_integer(threshold)

        this.thresholds[operation] = threshold

    }

     remove_operation(operation: OPERATIONS): void {
         for (const key in this.thresholds) {
            if (key === operation) {
                delete this.thresholds[key]
            }
        }
     }

    // set_threshold(operation: OPERATIONS, threshold: NumericInput): void {
    //
    //
    //
    //     if (threshold > this.total_votes()) {
    //         throw new InvalidDeedError('Attempting to set threshold higher than available votes - it will never be met')
    //     }
    //
    //     this.valid_operation(operation)
    //     // null removes this from list of thresholds
    //     if (threshold === null) {
    //         delete this.thresholds[operation]
    //     } else {
    //         this.thresholds[operation] = threshold
    //     }
    // }

    get_threshold(operation: OPERATIONS): number | null {
        if (typeof this.thresholds[operation] === 'undefined') return null
        return this.thresholds[operation]
    }

    return_threshold(operation: OPERATIONS): number {
        if (typeof this.thresholds[operation] === 'undefined') return null
        return this.thresholds[operation]
    }



    // lets change this to make it more uniform
    amend_threshold(): number | null {
        if (typeof this.thresholds.AMEND !== 'undefined') {
            return this.thresholds.AMEND
        } else {
            return null
        }
    }

    // set_amend_threshold(value: number): void {
    //     this.set_threshold(OPERATIONS.AMEND, value)
    // }

    validate(): void {

        const amend_threshold = this.get_threshold(OPERATIONS.AMEND)

        if(this.required_amend && amend_threshold === null){
            throw new InvalidDeedError('The Amend operation is mandatory but it not present')
        }

        // cache the total voting weight
        const total_voting_weight = this.total_votes()

        for (const k in this.thresholds){
            if(this.thresholds[k] > total_voting_weight){
                throw new InvalidDeedError(`Threshold value ${this.thresholds[k]} for '${k}' operation is greater than total voting weight ${total_voting_weight}`)
            }
        }
    }


     to_json_object(): DeedJson {
        this.validate()

        const signees: any = {}
        const thresholds: any = {}

        for (let i = 0; i < this.signees.length; i++) {
            const address = this.signees[i].signee.toString()
            signees[address] = this.signees[i].voting_weight
        }

        let lower: string

         for (const key in this.thresholds) {
            lower = key.toLowerCase()
            thresholds[lower] = this.thresholds[key]
        }

        return {
            'signees': signees,
            'thresholds': thresholds,
        }
    }

    from_json_object(json_deed: DeedJson, require_amend: boolean = true){
        if(!validJSONObject(json_deed)){
            throw new ValidationError("invalid JSON")
        }

        const deed = new Deed();
        deed.require_amend = require_amend

        for(let k in json_deed.signees){
            this.set_signee(k, json_deed.signees[k])
        }

        for(let k in json_deed.thresholds){
            this.set_operation(OPERATIONS[k.toUpperCase()], json_deed.thresholds[k])
        }

        this.thresholds = json_deed.thresholds;
}


    //
    // deed_creation_json(allow_no_amend = false): DeedJson {
    //
    //     const signees: any = {}
    //     for (let i = 0; i < this.signees.length; i++) {
    //         const address = new Address(this.signees[i].signee).toString()
    //         signees[address] = this.signees[i].voting_weight
    //     }
    //     const thresholds: any = {}
    //     const deed = {
    //         'signees': signees,
    //         'thresholds': thresholds
    //     }
    //
    //     if (typeof this.thresholds.AMEND !== 'undefined') {
    //         // Error if amend threshold un-meetable
    //         if (this.thresholds.AMEND > this.total_votes()) {
    //             throw new InvalidDeedError('Amend threshold greater than total voting power - future amendment will be impossible')
    //         }
    //     } else if (!allow_no_amend) {
    //         throw new InvalidDeedError('Creating deed without amend threshold - future amendment will be impossible')
    //     }
    //
    //     let lower: string
    //     // Add other thresholds
    //     for (const key in this.thresholds) {
    //         lower = key.toLowerCase()
    //         deed['thresholds'][lower] = this.thresholds[key]
    //     }
    //     return deed
    // }

    // valid_operation(operation: OPERATIONS): void {
    //     if (!Object.values(OPERATIONS).includes(operation)) {
    //         let str = ''
    //         for (const op in OPERATIONS) {
    //             str += op + ', '
    //         }
    //         str.substring(0, str.length - 2)
    //         throw new ValidationError(` ${operation} is not valid a valid operation. Valid operations are : ${str}`)
    //     }
    // }

}
