import {RunTimeError} from 'src/fetchai/ledger/errors/runTimeError'

export class LedgerApi {

    constructor(host, port, network) {

    }

    sync(txs, timeout= false){
      timeout = (timeout === false) ? 120 : timeout;

      if(!Array.isArray(txs) || !txs.length) {
           throw new TypeError('Unknown argument type');
      }

      const remaining = txs.length;
      const start = Date.now();





function loop() {

     if(remaining === 0) return;


     if (elapsed_time >= limit){
         Throw new RunTimeError('Timeout waiting for txs:' + )
    }
                raise RuntimeError('Timeout waiting for txs: {}'.format(', '.join(list(remaining))))

		setTimeout(loop, 10);
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
