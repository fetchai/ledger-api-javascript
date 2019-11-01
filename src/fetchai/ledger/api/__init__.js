import {RunTimeError} from '../errors/runTimeError';
import {ApiError} from "../errors/apiError";
import {TokenApi } from './token'
import assert from 'assert'
import {TransactionApi} from "./tx";

export class LedgerApi {

    constructor(host=false, port=false, network=false) {
         this.tokens = new TokenApi(host, port)
         this.tx = new TransactionApi(host, port)
    }

async sync(txs, timeout=false) {

      const limit = (timeout === false) ? 120 : timeout*1000;

      if(!Array.isArray(txs) || !txs.length) {
           throw new TypeError('Unknown argument type');
      }

      const start = Date.now();
debugger;
const loop = async () => {

     if(txs.length === 0) return;
let res;
     for(let i =0; i <  txs.length; i++){
           try {
               let n = txs[i];
               let r = n.txs[0];
               res = await this._poll(r);
         } catch (e) {
               if (!(e instanceof ApiError)) {
                   throw e;
               }
         }
         // we expect failed requests to return null, or throw an ApiError
           if(res !== null)  {
               txs.splice(i, 1);
               i--;
           }
     }

     if(txs.length === 0) return;
     let elapsed_time = Date.now() - start;

     if (elapsed_time >= limit){
         const l = txs.reduce(t, f => t + " , " + f.name.substring(6))
         throw new RunTimeError('Timeout waiting for txs:' + l)
    }
		setTimeout(loop, 1);
	}
	loop();
    }

      async _poll(digest) {
           let status = await this.tx.status(digest);
           console.log("status poll: " + status);
          return /Executed|Submitted/.test(status);
      }
}
