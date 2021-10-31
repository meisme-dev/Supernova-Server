var express = require('express');
var app = express();

let server = app.listen(1999, () => {
    console.log('Server started', server.address());
});