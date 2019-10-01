import { Base } from './base'

export class ValidationError extends Base {
  constructor (errors) {
    super('Validation Error')
    this.errors = errors
  }
}
