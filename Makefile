clean:
	@rm -rf ./dist

# Compile Es6 project
compile:
	@npm run build

# Lint Es6 project
lint:
	npx eslint src/ --ext=ts,js --fix

# Build Es6 project
build: clean compile

test:
	@npm install wait-on
	@npx jest src/test --maxConcurrency=1

test_with_coverage:
	@npm run coverage

balance: lint compile
	@node dist/examples/balance.js

wealth: lint compile
	@node dist/examples/wealth.js
