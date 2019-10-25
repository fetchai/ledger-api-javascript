import { Base } from './base'

export class ValidationError extends Base {
	constructor (errors) {
		super(errors)
		this.errors = errors
	}
}
