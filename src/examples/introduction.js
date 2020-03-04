// *************************************
// ***** Importing the library *****
// *************************************


/** Import from /dist/fetchai/ledger/path/to/class with Javascript
* Import from as above or  /src/fetchai/ledger with Typescript
* Include /index.js for vanilla page includes
* This includes the whole library as a single object called Fetchai
* Access classes with dot notation eg Entity as Fetchai.Entity
* Run examples from <project root>/dist/examples/<example file name> **/

import {Entity} from '../fetchai/ledger/crypto/entity'
import {Address} from '../fetchai/ledger/crypto/address'
import {Identity} from '../fetchai/ledger/crypto'

const PASSWORD = 'Password!12345'
const ADDRESS = 'dTSCNwHBPoDdESpxj6NQkPDvX3DN1DFKGsUPZNVWDVDrfur4z'

async function main() {
    // *************************************
    // ***** Working with Private Keys *****
    // *************************************

    // Create a new (random) private key by instantiating an Entity object
    const entity = new Entity()

    // Return the private key as a hexadecimal string
    const private_key_hex = entity.private_key_hex()

    console.log(`The new private key in hexadecimal is:  ${private_key_hex}\n`)

    // Return the private key as a Buffer (Node.js) or a Uint8Array (browser)
    const private_key_buffer = entity.private_key()

    // Get the public key from an Entity object
    console.log(
        `The associated public key in hexadecimal is:  ${entity.public_key_hex()}\n`
    )

    // Construct an Entity from a Buffer (Node.js) or Uint8Array (browser) holding a private key
    const entity2 = new Entity(private_key_buffer)

    // Construct an entity from a private key stored as a base64 string
    const entity3 = Entity.from_base64(private_key_buffer.toString('base64'))

    console.assert(
        entity.private_key_hex() == entity3.private_key_hex(),
        'Private keys should match\n'
    )

    // *************************************
    // ***** Serializing Private Keys ******
    // *************************************

    // serialize to JSON with AES
    const json_object = await entity.to_json_object(PASSWORD)

    console.log(
        `This serializes to the the following encrypted JSON object :\n`,
        json_object
    )

    // Re-create an entity from an encrypted JSON object
    const entity4 = await Entity.from_json_object(json_object, PASSWORD)

    console.log(
        `Which can be de-serialized to an Entity containing the following hex private key: ${entity.private_key_hex()}\n`
    )

    console.assert(
        entity.private_key_hex() === entity4.private_key_hex(),
        'Private keys should match'
    )

    /**
     * Check if a password is strong enough to be accepted by our serialization functionality.
     * A password must contain 14 chars or more, with one or more uppercase, lowercase, numeric and a one or more special char
     */
    console.log(
        `The given password ${PASSWORD}${
            Entity.strong_password(PASSWORD)
                ? ' is strong enough'
                : ' is not strong enough'
        } to be used with our serialization functionality\n`
    )

    // *************************************
    // ***** Working with Public keys ******
    // *************************************

    // Identity only represents only a public key; where an Entity objects represent a public/private key pair
    let identity = new Identity(entity)

    // Obtain public key as a string encoded in hexadecimal
    const public_key_hex = identity.public_key_hex()

    // Obtain public key as a string encoded in base64
    const public_key_base64 = identity.public_key_base64()

    // Obtain public key as a Buffer in Nodejs or a Uint8Array in the browser
    const public_key_bytes = identity.public_key_bytes()

    // Construct an identity from a hexadecimal-encoded public key
    const ident2 = Identity.from_hex(public_key_hex)

    // Construct an identity from a public key in base64 form
    const ident3 = Identity.from_base64(public_key_base64)

    console.log('An Identity object represents a public key\n')

    // Construct an identity from Buffer (Node.js) or a Uint8Array in the browser
    const ident4 = new Identity(public_key_bytes)

    // *************************************
    // ****** Working with Addresses *******
    // *************************************

    // Construct an address from an entity object
    const address = new Address(entity)

    // Obtain the Address as base58-encoded string: the public representation of an Address
    const address2 = new Address(ADDRESS)

    // Validate that a string is  valid (verify checksum, valid base58-encoding and length)
    console.log(
        `The Address generated from our entity ${
            Address.is_address(ADDRESS) ? 'is valid.' : 'is not valid.'
        }\n`
    )

    // We can get the base 58 value of an address from an address object as follows:
    const public_address = address.toString()

    console.log(
        `The public base58 representation of this Address is: ${public_address}\n`
    )
}

main()
