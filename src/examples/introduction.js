import {Entity} from '../fetchai/ledger/crypto/entity'
import {Address} from '../fetchai/ledger/crypto/address'
import {Identity} from '../fetchai/ledger/crypto'

const PASSWORD = 'Password!12345'
const ADDRESS = 'dTSCNwHBPoDdESpxj6NQkPDvX3DN1DFKGsUPZNVWDVDrfur4z'


// *************************************
// ***** Working with Private Keys *****
// *************************************


// Create a new (random) Private key by instantiating an Entity object like so:
const entity = new Entity()

// Return the private key as a hexadecimal string
const private_key_hex = entity.private_key_hex()

console.log(`The new Private Key in Hexadecimal is:  ${private_key_hex}\n`)

// We can return the private key as a buffer
const private_key_buffer = entity.private_key()

// We can also get the public key from an Entity object
console.log(`The associated public key in Hexadecimal is:  ${entity.public_key_hex()}\n`)

// We can Construct an Entity from a buffer holding a private key
const entity2 = new Entity(private_key_buffer)

// We can  Construct an entity from a private key stored as a base64 string
const entity3 = Entity.from_base64(private_key_buffer.toString('base64'))
console.log(entity.private_key_hex())
console.log(entity2.private_key_hex())
console.log(entity3.private_key_hex())

console.assert(entity.private_key_hex() == entity3.private_key_hex(), 'Private keys should match across the given entities \n')

// *************************************
// ***** Serializing Private Keys ******
// *************************************

// We provide in-built JSON serialization methods, which encrypt the private Key using AES
const json_object = entity.to_json_object(PASSWORD)

console.log('This serializes to the the following encrypted JSON object :', json_object)

// One can use the below method to create an entity from and encrypted JSON object
const entity4 = Entity.from_json_object(json_object, PASSWORD)

console.log(`Which can be de-serialized to an Entity containing the following Hex Private Key: ${entity.private_key_hex()}\n`)

console.assert(entity.private_key_hex() === entity4.private_key_hex(), 'Private keys should match across the three given entities')

/**
 * Check if a password is strong enough to be accepted by our serialization functionality.
 * A password must contain 14 chars or more, with one or more uppercase, lowercase, numeric and a one or more special char
 */
const password_flag = Entity.strong_password(PASSWORD)

let result = (password_flag) ? ' is strong enough  :' : ' is not strong enough'

console.log(`The given password ${PASSWORD} ${result} to be used with our serialization functionality\n`)

// *************************************
// ***** Working with Public keys ******
// *************************************


// Whilst an Entity objects represent a Public/Private key pair an Identity only represents a public key.
let identity = new Identity(entity)

// We can obtain public keys in hex, or as a buffer
const public_key_hex = identity.public_key_hex()

const public_key_base64 = identity.public_key_base64()

const public_key_bytes = identity.public_key_bytes()

// We can Construct an identity from a public key in hexadecimal form
const ident2 = Identity.from_hex(public_key_hex)

// We can Construct an identity from a public key in base64 form
const ident3 = Identity.from_base64(public_key_base64)

console.log('An Identity Object represents a public key\n')

// We can Construct an identity from buffer
const ident4 = new Identity(public_key_bytes)


// *************************************
// ****** Working with Addresses *******
// *************************************

// We can construct an address from an entity object
const address = new Address(entity)

// Or from a base58 string (The public representation of an Address)
const address2 = new Address(ADDRESS)

// We can also validate that a string is a valid address as follows
const valid_address_flag = Address.is_address(ADDRESS)

let valid_message = (valid_address_flag) ? 'is valid.' : 'is not valid.'

console.log(`The given Address ${ADDRESS} ${valid_message}\n`)

// We can get the base 58 value of an address from an address object as follows:
const public_address = address.toString()

console.log(`The public base58 representation of the Address associated with our above entity is: ${public_address}`)

