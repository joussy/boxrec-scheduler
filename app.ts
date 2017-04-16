import * as BoxRec from './boxrec';
import * as BoutsToIcs from './bouts-to-ics';
var express = require('express');
var boutsToIcs = new BoutsToIcs.BoxerToIcs();

//box.findById(178678, function (err: any, boxer: BoxRec.Boxer) {
//    console.log(boxer.name); // 'Gennady Golovkin' 
//    console.log(boxer.nickname); // 'Gennady Golovkin' 
//    var ics = boutsToIcs.convert(boxer, false);
//});

var app = express();

app.get('/', function (req, res) {
    res.header("Content-Type", 'text/plain');
    var ids = req.query.boxerids.split(',');
    ids = [...new Set(ids)]; //unique values
    boutsToIcs.fromIds(ids).then(data => {
        res.send(data)
    }).catch(x => {
        res.send("Error")
    });

    //ids.forEach((id) => {
    //    box.findById(parseInt(id), function (err: any, boxer: BoxRec.Boxer) {
    //        console.log(boxer.name);
    //        var ics = boutsToIcs.convert(boxer, false);
    //        res.send(ics);
    //    });
    //});
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});