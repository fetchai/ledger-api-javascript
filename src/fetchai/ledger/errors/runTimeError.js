import { Base } from './base'

export class RunTimeError extends Base {
	constructor (errors) {
		super('Run time error')
		this.errors = errors
	}
}
