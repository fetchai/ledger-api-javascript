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
	@npm run test

test_with_coverage:
	@npm run coverage

balance: lint compile
	@node dist/examples/balance.js

wealth: lint compile
	@node dist/examples/wealth.js

bundle:
	@./node_modules/.bin/webpack

node_server: bundle
	@node src/tests/e2e/server
