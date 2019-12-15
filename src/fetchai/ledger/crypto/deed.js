AddressLike = Union[Address, Identity]

class Operation(Enum):
    """Enables future amendments to the deed"""
    amend = 1
    """Enables FET transfers"""
    transfer = 2
    """Enab"""
    execute = 3

    stake = 4

    def __repr__(self):
        return '<%s.%s>' % (self.__class__.__name__, self.name)

    def __str__(self):
        return self.name


export class Deed {
       constructor(address) {
           this.address = address
        this.signees = {}
        this.thresholds = {}
       }

    set_signee(signee, voting_weight) {

        this._signees[signee] = voting_weight
    }
    remove_signee(this, signee: Entity):
        if signee in this._signees:
            del this._signees[signee]

     set_threshold(this, operation: Operation, threshold: int):
        if threshold > this.total_votes:
            raise InvalidDeedError("Attempting to set threshold higher than available votes - it will never be met")

        this._thresholds[str(operation)] = int(threshold)

     remove_threshold(this, operation: Operation):
        if str(operation) in this._thresholds:
            del this._signees[str(operation)]

     return_threshold(this, operation: Operation):
        return this._thresholds[str(operation)] if  \
            str(operation) in this._thresholds else None

    @property
     total_votes(this):
        return sum(v for v in this._signees.values())

    @property
     amend_threshold(this):
        return this._thresholds['amend'] if \
            'amend' in this._thresholds else None

    @amend_threshold.setter
     amend_threshold(this, value):
        this.set_threshold(Operation.amend, value)

     deed_creation_json(this, allow_no_amend=False):
        deed = {
            'address': Address(this._address)._display,
            'signees': {Address(k)._display: v for k, v in this._signees.items()},
            'thresholds': {}
        }

        if this.amend_threshold:
            // Error if amend threshold un-meetable
            if this.amend_threshold > this.total_votes:
                raise InvalidDeedError("Amend threshold greater than total voting power - future amendment will be impossible")

            deed['thresholds']['amend'] = this.amend_threshold

        // Warnings/errors if no amend threshold set
        elif allow_no_amend:
            logging.warning("Creating deed without amend threshold - future amendment will be impossible")
        else:
            raise InvalidDeedError("Creating deed without amend threshold - future amendment will be impossible")

        // Add other thresholds
        for key in this._thresholds:
            if key == 'amend':
                continue
            deed['thresholds'][key] = this._thresholds[key]

        return deed
}
