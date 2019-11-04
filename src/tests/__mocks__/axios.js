export default jest.fn((request) => {
      const requests = [balance, wealth, status_chain, status];
       let req, res;
   for (let i = 0; i < requests.length; i++)
   {
       [req, res] =  requests[i].call();
        if(equals(request, req)) {
        return Promise.resolve(res);
        }
   }
       return Promise.reject();
});


function balance(){
    debugger;
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/fetch/token/balance","data":{"address":"2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5"},"headers":{"Content-Type":"application/json; charset=utf-8"}}'),
        JSON.parse('{"data": {"balance": 275}}')]
}


function wealth(){
    return [
        JSON.parse('{"method":"post","url":"http://127.0.0.1:8000/api/contract/fetch/token/wealth","data":{"ver":"1.2","data":"oSCAl6OJh12f8ttl9GTNglv4vlnTzB5rQs3FLhwEdq4yDE1pAQGAC2ZldGNoLnRva2VuBndlYWx0aCp7ImFtb3VudCI6IDEwMDAgInRpbWVzdGFtcCI6MTU3MjgxODU2OTIzMX0EKjivzRm2uTkgcwV8jd4qxY0Spny6uXc374AsTOB+QDccgXdgm7l+zN0KtN93+drXnQgNZGYI894K/w1INoA6/EAgUYTmrx+5iMM96EKfeIrU8jE29ATRVdHTW5KTho56BnScJOPDui3TBOck5xKjccziTyxRFSg9DxzZ5Pxc8SiG"},"headers":{"content-type":"application/vnd+fetch.transaction+json"}}'),
        JSON.parse('{"status": 200, "data": {"txs":["be448a628ed7d406eaf497b7bf56722f1df661c67856b9cedf6d75180859964c"],"counts":{"received":1,"submitted":1}}}')];
}

function status_chain(){
    return [
        JSON.parse('{"method":"get","url":"http://127.0.0.1:8000/api/status/chain","params":{"size":1},"headers":{"Content-Type":"application/json; charset=utf-8"}}'),
        JSON.parse('{"data":{"chain":[{"blockNumber":5}]}}')];
}

function status(){
    return[
        JSON.parse('{"method":"get","url":"http://127.0.0.1:8000/api/status/tx/bbc6e88d647ab41923216cdaaba8cdd01f42e953c6583e59179d9b32f52f5777","request_headers":{"Content-Type":"application/json; charset=utf-8"}}'),
        JSON.parse('{"data":{"status": "Executed"}}')
    ];
}


/*
taken from stack overflow, but modified somewhat to ignore matching very long strings which seem to sometimes get corrupted.
measures that objects are the same in terms of properties and their values.
 */
function equals( x, y ) {
  if ( x === y ) return true;
  for ( var p in x ) {
    if ( ! x.hasOwnProperty( p )) continue;
    if ( ! y.hasOwnProperty( p ) ) return false;
    if ( x[ p ] === y[ p ] ) continue;
    if(typeof x[ p ] === "string" && x[ p ].length > 200) continue;
    if ( typeof( x[ p ] ) !== "object" ) return false;
    if ( ! equals( x[ p ],  y[ p ] ) ) return false;
  }
  for ( p in y ) {
    if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
  }
  return true;
}




