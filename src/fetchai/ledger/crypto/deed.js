import {ValidationError} from "../errors";
import {Address} from "./address";
import {InvalidDeedError} from "../errors/invalidDeedError";

export class Deed {
       constructor(address) {
           this.address = address
        this.signees = []
        this.thresholds = {}
        this.OPERATIONS = {"AMEND":1, "TRANSFER":2, "EXECUTE":3, "STAKE": 4}
       }

    set_signee(signee, voting_weight) {
        this.signees.push({ signee: signee, voting_weight: voting_weight})
    }

    remove_signee(signee){

        for(let i = 0; i < this.signees.length; i++){
            if(this.signees[i].signee.public_key_hex() === signee.public_key_hex()){
                  this.signees.splice(i, 1);
                break;
            }
        }
    }

     set_threshold(operation, threshold) {
         if (threshold > this.total_votes) {
             throw new InvalidDeedError("Attempting to set threshold higher than available votes - it will never be met")
         }

       this.valid_operation(operation)
         // null removes this from list of thresholds
      if(threshold === null){
          delete this.thresholds[operation]
      } else {
          this.thresholds[operation] = threshold
      }
      }

     remove_threshold(operation){
          for (var key in this.thresholds) {
           if(key === operation) {
               delete this.thresholds.key
           }
        }
    }
     return_threshold(operation) {
           if(typeof this.thresholds[operation] === "undefined") return null;
         return this.thresholds[operation]
     }

     total_votes(){
          return this.signees.reduce((accum, curr) => accum + curr.voting_weight)
     }

     // lets change this to make it more uniform
     amend_threshold(){

           if(typeof this.thresholds.AMEND !== "undefined") {
               return this.thresholds.AMEND
           } else {
               return null;
           }
     }

     set_amend_threshold(value) {
         this.set_threshold("AMEND", value)
     }


     deed_creation_json(allow_no_amend=false){

           const signees = {}
          for( var i = 0; i < this.signees.length; i++){
              let address = new Address(this.signees[i].signee).toString()
               signees[address] = this.signees[i].voting_weight
               console.log("signeesa adres" + signees[address])
          }

        const deed = {
            'signees': signees,
            'thresholds': {}
        }

        if(typeof this.thresholds.AMEND !== "undefined") {
            // Error if amend threshold un-meetable
            if (this.thresholds.AMEND > this.total_votes()) {
                throw new InvalidDeedError("Amend threshold greater than total voting power - future amendment will be impossible")
            }
        }
        // Warnings/errors if no amend threshold set
        else if(allow_no_amend) {
           // logging.warning("Creating deed without amend threshold - future amendment will be impossible")
        } else {
            debugger
           throw new InvalidDeedError("Creating deed without amend threshold - future amendment will be impossible")
        }
        let lower;
        // Add other thresholds
        for(let key in this.thresholds){
            lower = key.toLowerCase()
              deed['thresholds'][lower] = this.thresholds[key]
        }
        return deed;
}
valid_operation(operation)
{
    if (typeof this.OPERATIONS[operation] === "undefined") {
        let str = "";
        for (var operation in this.OPERATIONS) {
            str += operation + ", ";
        }
        str.substring(0, str.length - 2);
        throw new ValidationError(` ${operation} is not valid a valid operation. Valid operations are : ${str}`)
    }
}

}
