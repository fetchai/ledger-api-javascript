# Fetch.AI Ledger JavaScript API

Official JavaScript client library for interacting with the Fetch.AI Ledger https://fetch.ai

#### Requirements:

- [Node.js](https://nodejs.org/en/)
- [Npm](https://www.npmjs.com/get-npm)

#### Installation

```
npm install
```

#### Testing:

```
npm run test
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


#### To Generate the docs:

```
npm run generate-docs
```

Note: It will create  `docs/` directory. Open `index.html` in browser to see the generated document.


#### Test Example:

- Balance:

  ` make balance `

- wealth:

  ` make wealth `

#### Directories:
```
- examples: Working examples of ledger javascript apis
- fetchai: All javascript api for ledger
- tests: Test cases
```

#### Building this library:

To build this repository(dist)

```
npm run build
```

#### Linting

```
make lint
```


#### Check transaction status:

` curl 127.0.0.1:8000/api/status/tx/<tx_hash> `

##### Output:

```
{"charge_rate": 0, "charge": 0, "exit_code": 0, "fee": 0, "tx": "/X66ZMfPKuQ4HE63gQBmbfAGWxnhUoT1t3IMYYTOZJU=", "status": "Unknown"}
```

#### Install updated google chrome stable version:

```
sudo apt-get upgrade google-chrome-stable
```
