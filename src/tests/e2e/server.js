const express = require('express')
var path = require('path')

const app = express()
const port = 3000

// viewed at http://localhost:3000
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'))
})

app.use(express.static(path.join(__dirname + '../../../../bundle')))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
