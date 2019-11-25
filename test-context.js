var context = require.context('./src/tests/__tests__', true, /.js$/)
context.keys().forEach(context)
