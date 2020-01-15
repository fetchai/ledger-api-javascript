import {ValidationError} from '../errors'
import {Address} from './address'
import {InvalidDeedError} from '../errors/invalidDeedError'
import {Entity} from "./entity";

    export enum OPERATIONS
    {
        AMEND = "amend",
        TRANSFER = "transfer",
        EXECUTE = "execute",
        STAKE = "stake"
    }



export class Deed {
	public signees: any;
	public thresholds: any;

    set_signee(signee: Entity, voting_weight: number) {
        this.signees.push({signee: signee, voting_weight: voting_weight})
    }

    remove_signee(signee: Entity) : void {
        for (let i = 0; i < this.signees.length; i++) {
            if (this.signees[i].signee.public_key_hex() === signee.public_key_hex()) {
                this.signees.splice(i, 1)
                break
            }
        }
    }

    set_threshold(operation: OPERATIONS, threshold: number): void {
        if (threshold > this.total_votes()) {
            throw new InvalidDeedError('Attempting to set threshold higher than available votes - it will never be met')
        }

        this.valid_operation(operation)
        // null removes this from list of thresholds
        if (threshold === null) {
            delete this.thresholds[operation]
        } else {
            this.thresholds[operation] = threshold
        }
    }

    remove_threshold(operation: OPERATIONS): void {
        for (var key in this.thresholds) {
            if (key === operation) {
                delete this.thresholds.key
            }
        }
    }

    return_threshold(operation: OPERATIONS) : number {
        if (typeof this.thresholds[operation] === 'undefined') return null
        return this.thresholds[operation]
    }

    total_votes() : number {
        return this.signees.reduce((accum: number, curr: any) : number => accum + curr.voting_weight)
    }

    // lets change this to make it more uniform
    amend_threshold() : number | null {

        if (typeof this.thresholds.AMEND !== 'undefined') {
            return this.thresholds.AMEND
        } else {
            return null
        }
    }

    set_amend_threshold(value: number) : void {
        this.set_threshold(OPERATIONS.AMEND, value)
    }


    deed_creation_json(allow_no_amend: boolean = false) {

        const signees: any = {}
        for (var i = 0; i < this.signees.length; i++) {
            let address = new Address(this.signees[i].signee).toString()
            signees[address] = this.signees[i].voting_weight
        }
 const thresholds: any = {}
        const deed = {
            'signees': signees,
            'thresholds':  thresholds
        }

        if (typeof this.thresholds.AMEND !== 'undefined') {
            // Error if amend threshold un-meetable
            if (this.thresholds.AMEND > this.total_votes()) {
                throw new InvalidDeedError('Amend threshold greater than total voting power - future amendment will be impossible')
            }
        } else if (!allow_no_amend) {
            throw new InvalidDeedError('Creating deed without amend threshold - future amendment will be impossible')        }

        let lower: string
        // Add other thresholds
        for (let key in this.thresholds) {
            lower = key.toLowerCase()
            deed['thresholds'][lower] = this.thresholds[key]
        }
        return deed
    }

    valid_operation(operation: OPERATIONS) : void {
        if (!Object.values(OPERATIONS).includes(operation)) {
            let str = ''
            for (let op in OPERATIONS) {
                str += op + ', '
            }
            str.substring(0, str.length - 2)
            throw new ValidationError(` ${operation} is not valid a valid operation. Valid operations are : ${str}`)
        }
    }

}
