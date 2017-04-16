import * as BoxRec from './boxrec';
import * as BoutsToIcs from './bouts-to-ics';
var express = require('express');
var boutsToIcs = new BoutsToIcs.BoxerToIcs();

var app = express();

app.get('/', function (req, res) {
    res.header("Content-Type", 'text/plain');
    var ids = req.query.boxerids.split(',');
    boutsToIcs.fromIds(ids).then(data => {
        res.send(data)
    }).catch(x => {
        res.send("Error")
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});