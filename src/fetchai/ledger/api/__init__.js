import {RunTimeError} from 'src/fetchai/ledger/errors/runTimeError'
import {ApiError} from "../errors";

export class LedgerApi {

    constructor() {}

    sync(txs, timeout=false){

      const limit = (timeout === false) ? 120 : timeout*1000;

      if(!Array.isArray(txs) || !txs.length) {
           throw new TypeError('Unknown argument type');
      }

      const start = Date.now();

function loop() {

     if(txs.length === 0) return;

     txs.forEach((item, index, object) => {
         assert(typeof item === "function");

         try {
              let res = tx.call();
              // we expect failed requests to return null, or throw an ApiError
              if(res !== null)  object.splice(index, 1);
         } catch (e) {
               if (!(e instanceof ApiError)) {
                   throw e;
               }
         }
    });

     if(txs.length === 0) return;
     let elapsed_time = Date.now() - start;

     if (elapsed_time >= limit){
         const l = txs.reduce(t, f => t + " , " + f.name.substring(6))
         throw new RunTimeError('Timeout waiting for txs:' + l)
    }
		setTimeout(loop, 1);
	}()


    }


    /*
        def sync(self, txs: Transactions, timeout=None):
        timeout = int(timeout or 120)
        # given the inputs make sure that we correctly for the input set of values
        if isinstance(txs, str):
            remaining = {txs}
        elif _iterable(txs):
            remaining = set(txs)
        else:
            raise TypeError('Unknown argument type')

        limit = timedelta(seconds=timeout)
        start = datetime.now()

        while True:
            # loop through all the remaining digests and poll them creating a set of completed in this round
            remaining -= set([digest for digest in remaining if self._poll(digest)])

            # once we have completed all the outstanding transactions
            if len(remaining) == 0:
                break

            # time out mode
            delta_time = datetime.now() - start
            if delta_time >= limit:
                raise RuntimeError('Timeout waiting for txs: {}'.format(', '.join(list(remaining))))

            time.sleep(1)
     */

}
