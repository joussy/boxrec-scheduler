import * as BoxRec from './boxrec';
const http = require('http');
var boxRec = new BoxRec.BoxRec();
var url = require('url');


const hostname = '127.0.0.1';
const port = 3000;
const server = http.createServer((req, res) => {
    console.log(port);
    res.setHeader('Content-Type', 'text/plain');
    var params = url.parse(req.url, true).query;
    if (params.boxerids == null)
        return res.end('Error');
    var ids = params.boxerids.split(',');
    var idsClean : number[] = ids.map(id => parseInt(id));
    //var idsClean = [...new Set(ids.map(id => parseInt(id)))]; //unique values. PLEASE RE-IMPLEMENT THIS LINE
    boxRec.idstoIcs(idsClean).then(data => {
        res.end(data)
    }).catch(x => {
        res.end("Error")
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
