import {Bootstrap} from '../fetchai/ledger/api'

async function main() {
    const server = await Bootstrap.server_from_name('alpha')
    console.log(server)
}
main()
