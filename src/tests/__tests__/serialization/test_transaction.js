import {Transaction} from "../../../fetchai/ledger";
import {Entity} from "../../../fetchai/ledger/crypto/entity";



const _PRIVATE_KEYS = [
    '1411d53f88e736eac7872430dbe5b55ac28c17a3e648c388e0bd1b161ab04427',
    '3436c184890d498b25bc2b5cb0afb6bad67379ebd778eae1de40b6e0f0763825',
    '4a56a19355f934174f6388b3c80598abb151af79c23d5a7af45a13357fb71253',
    'f9d67ec139eb7a1cb1f627357995847392035c1e633e8530de5ab5d04c6e9c33',
    '80f0e1c69e5f1216f32647c20d744c358e0894ebc855998159017a5acda208ba'
];

const ENTITIES = () => {
    PRIVATE_KEYS.map(key => Entity.from_hex(key));

}();


const IDENTITIES = () => {
    PRIVATE_KEYS.map(key => new Identity.from_hex(key));
}


const _calculate_integer_stream_size = (len) => {
    if (len < 0x80) {
        return 1;
    } else if (len < 0x100) {
        return 2;
    } else if (len < 0x1000) {
        return 4;
    } else {
        return 8;
    }
}

// ENTITIES = [Entity.from_hex(x) for x in _PRIVATE_KEYS]
// IDENTITIES = [Identity(x) for x in ENTITIES]




function assertTxAreEqual(refence, other){
    expect(reference).toBeInstanceOf(Transaction);
    expect(other).toBeInstanceOf(Transaction);
    expect(reference.from_address()).toBe(other.from_address);
    expect(reference.transfers()).toBe(other.transfers());
    expect(reference.valid_from()).toBe(other.valid_from());
    expect(reference.valid_from()).toBe(other.valid_from());
    expect(reference.charge_rate()).toBe(other.charge_rate());
    expect(reference.charge_limit()).toBe(other.charge_limit());
    expect(reference.contract_digest()).toBe(other.contract_digest());
    expect(reference.contract_address()).toBe(other.contract_address());
    expect(reference.chain_code()).toBe(other.chain_code());
    expect(reference.action()).toBe(other.action());
    expect(reference.shard_mask()).toBe(other.shard_mask());
    expect(reference.data()).toBe(other.data());
    expect(reference.signers()).toBe(other.signers());
}

