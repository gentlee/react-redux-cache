import {schema} from 'normalizr'

export const bankSchema = new schema.Entity('banks', undefined, {
  idAttribute: 'staticId',
})

export const userSchema = new schema.Entity('users', {
  bank: bankSchema,
})
