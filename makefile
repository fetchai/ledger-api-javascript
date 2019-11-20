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

test: bundle
	@npm run test

test_with_coverage:
	@npm run coverage

balance: lint compile
	@node dist/examples/balance.js

wealth: lint compile
	@node dist/examples/wealth.js

# Create bundle.js file
bundle:
	@./node_modules/.bin/webpack

# Run e2e testcases
e2e_test: bundle
	@npx jest src/tests/__tests__/e2e/cbt.test.js

# Run unit testcases
unit_test:
	@npx jest src/test --testPathIgnorePatterns cbt.test.js
