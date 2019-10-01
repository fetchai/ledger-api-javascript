import { Base } from './base'

export class ApiError extends Base {
  constructor (errors) {
    super('API error')
    this.errors = errors
  }
}
