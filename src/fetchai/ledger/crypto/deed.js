import {ValidationError} from "../errors";

AddressLike = Union[Address, Identity]

// class Operation(Enum):
//     """Enables future amendments to the deed"""
//     amend = 1
//     """Enables FET transfers"""
//     transfer = 2
//     """Enab"""
//     execute = 3
//
//     stake = 4
//
//     def __repr__(self):
//         return '<%s.%s>' % (self.__class__.__name__, self.name)
//
//     def __str__(self):
//         return self.name


export class Deed {
       constructor(address) {
           this.address = address
        this.signees = []
        this.thresholds = {}
        this.OPERATIONS = {"AMEND":1, "TRANSFER":2, "EXECUTE":3, "STAKE": 4}
       }

    set_signee(signee, voting_weight) {
        this.signees.push({signee: signee, voting_weight: voting_weight})
    }

    remove_signee(signee){
        // if signee in this._signees:
        //     del this._signees[signee]
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

       Deed.valid_operation(operation)
       this.thresholds[operation] = threshold
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

     amend_threshold(){

           if(typeof this.thresholds.AMEND !== "undefined") {
               return this.thresholds.AMEND
           } else {
               return null;
           }
     }

     set_amend_threshold(value) {
         this.set_threshold(this.Operation.AMEND, value)
     }


     deed_creation_json(allow_no_amend=false){

           const signees = {}
               this.signees.forEach((obj) => {
                   let address = new Address(obj.signee).toString()
                   signees[address] = obj.voting_weight

     })

        const deed = {
            'address': new Address(this.address).toString(),
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
            logging.warning("Creating deed without amend threshold - future amendment will be impossible")
        } else {
           throw new InvalidDeedError("Creating deed without amend threshold - future amendment will be impossible")
        }
        // Add other thresholds
        for(let key in this.thresholds){
              deed['thresholds'][key] = this.thresholds[key]
        }

        return deed;
}
static valid_operation(operation)
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
