import {LedgerApi} from "../../../fetchai/ledger/api";
import {Entity} from "../../../fetchai/ledger/crypto";
import  of  from 'await-of';
import axios from 'axios';

const HOST = '127.0.0.1';
const PORT = 8000;

jest.mock('axios');
jest.mock('of');

describe(':LedgerApi', () => {

      test('test single sync request', async () => {
    const api = new LedgerApi(HOST, PORT)
    const identity1 = new Entity();
        debugger;
  const users = [{name: 'Bob'}];
  const resp = {data: users};
  axios.get.mockResolvedValue(resp);
  of.mockResolvedValue(resp);
debugger;
    const b = await api.tokens.balance(identity1);
    const t  =  await api.tokens.wealth(identity1, 1000);
    const done =  await api.sync([t]);
    const d =  await api.tokens.balance(identity1);
    });

});
