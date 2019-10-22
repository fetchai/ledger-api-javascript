# Fetch.AI Ledger Javascript API

### Building this library:

To build this repository

```
npm run build
```

### To run example:

Go to the dist directory and run the command:

```
node example/balance.js

```
#### To Debug Jest Tests Graphically:

Open In Chrome the following URL:

```
chrome://inspect
```

Click on "Open dedicated DevTools for Node" 

In terminal under project directory
```
npm run test:debug
```

Note: optionally set breakpoint by typing "debugger;" within your code

##### Sample output:

```
2019-10-01 18:22:12 info: Creating new Token api object with host:127.0.0.1 and port:8000
2019-10-01 18:22:12 info: Creating new api endpoint object with host:127.0.0.1 and port:8000
2019-10-01 18:22:12 info: request for check balance of address: 2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5
2019-10-01 18:22:12 info: Balance of 2JYHJirXFQd2ZertwThfLX87cbc2XyxXNzjJWwysNP2NXPmkN5 is 0
```

#### Directories:

```
src
├── examples
│   └── balance.js
├── fetchai
│   └── ledger
│       ├── api
│       │   ├── common.js
│       │   ├── index.js
│       │   └── token.js
│       ├── bitvector.js
│       ├── crypto
│       │   ├── entity.js
│       │   └── index.js
│       ├── errors
│       │   ├── apiError.js
│       │   ├── base.js
│       │   ├── index.js
│       │   ├── notImplementedError.js
│       │   └── validationError.js
│       ├── index.js
│       ├── transaction.js
│       └── utils
│           ├── index.js
│           └── logger.js
└── tests
    ├── jest.config.js
    └── __tests__
        └── test_bitvector.js

```

- examples: Working examples of ledger javascript apis
- fetchai: All javascript api for ledger
- tests: Test cases

### Test Example:

- Balance:

  ` make balance `

- wealth:

   ` make wealth `


### To run test cases:

    ` npm run test `


### Check transaction status:

` curl 127.0.0.1:8000/api/status/tx/<tx_hash> `

Output:

```
{"charge_rate": 0, "charge": 0, "exit_code": 0, "fee": 0, "tx": "/X66ZMfPKuQ4HE63gQBmbfAGWxnhUoT1t3IMYYTOZJU=", "status": "Unknown"}
```
