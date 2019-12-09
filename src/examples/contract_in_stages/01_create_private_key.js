import { Entity } from '../../fetchai/ledger/crypto/entity'
import fs from 'fs'

async function main() {
    console.log('Creating private key...')
    const entity = new Entity()
    let writeStream = fs.createWriteStream('src/examples/contract_in_stages/private.key')
    const data = entity.prompt_dump('src/examples/contract_in_stages/private.key', '1234567890qwertyuiopQWERTYUIOP!@#$')
    writeStream.write(data)
    writeStream.end()
    console.log('Creating private key...complete')
}

main()
