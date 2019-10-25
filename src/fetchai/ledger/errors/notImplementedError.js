import { Base } from './base'

export class NotImplementedError extends Base {
	constructor (errors) {
		super(errors)
		this.errors = errors
	}
}
