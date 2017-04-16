var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
const { URLSearchParams } = require('url');
var url = require('url');
//import * as tcheerio from '@types/cheerio';

export class Bout {
    opponent: Boxer;
    titles: string[];
    location: string;
    date: Date;
    constructor() {
        this.titles = [];
    }
}

export class Records {
    w: number;
    l: number;
    d: number;
    toString() {
        return `W:${this.w}, L:${this.l}, D:${this.d}`;
    }
}

export class Boxer {
    id: number;
    name: string;
    nickname: string;
    record: Records;
    bouts: Bout[];

    constructor() {
        this.bouts = [];
    }
}

export class BoxRec {
    cache: Boxer[];
    constructor() {
        this.cache = [];
        this.LoadCache();
    }

    private LoadCache(): void {
        fs = require('fs');
        var thisObj = this;
        fs.readFile('cache.json', 'utf8', function (err, data) {
            if (err) {
                console.log("cache doesn't exists, creating one ...");
                fs.writeFile('cache.json', [], function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("Cache created!");
                    }
                });
            }
            if (typeof (data) == "string" && data.length > 0)
                thisObj.cache = <Boxer[]>JSON.parse(data);
            console.log("Cache loaded!");
        });
    }

    private SaveCache(): void {
        fs.writeFile("cache.json", JSON.stringify(this.cache, null, 4), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }

    private AppendCache(boxer: Boxer) {
        var index = this.cache.findIndex(x => x.id == boxer.id);
        if (index > -1)
            this.cache[index] = boxer;
        else
            this.cache.push(boxer);
        this.SaveCache();
    }

    private FindInCache(boxerId: number): Boxer {
        return this.cache.find(x => x.id == boxerId);
    }

    private static extractInfo(data: any): Boxer {
        var $ = cheerio.load(data);
        var boxer = new Boxer();
        var myUrl = url.parse($('link[itemprop="url"]').attr('href'));
        boxer.id = parseInt(myUrl.path.split('/')[2]);

        boxer.name = $('.boxerTitle').first().text().trim();
        boxer.nickname = $('span[itemprop="alternateName"]').text();
        boxer.record = new Records();
        boxer.record.w = parseInt($('.bgwonBlock').first().text());
        boxer.record.l = parseInt($('.bglostBlock').first().text());
        boxer.record.d = parseInt($('.bgdrawBlock').first().text());
        boxer.bouts = $('.tBoutList').map(function (i: number, elem) {
            var bout = new Bout();
            bout.date = $('.profileDateWidth', elem).text().length > 0 ? new Date($('.profileDateWidth', elem).text()) : null;
            bout.opponent = new Boxer();
            bout.opponent.name = $('.boxerLink', elem).text();
            bout.titles = $('a[href*="boxrec.com/title/"]', elem).map(function (j, titleElem) {
                return $(titleElem).text();
            }).toArray();
            bout.location = $('a[href*="boxrec.com/venue/"]', elem).first().text();
            return bout;
        }).toArray();
        return boxer;
    }

    private performHttpRequest(id: number, simulate: boolean): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (simulate) {
                fs.readFile('boxrec-sample.html', 'utf8', function (err, data) {
                    if (!err) {
                        setTimeout(x => resolve(data), 1000);
                    }
                    else
                        reject(err);
                });
            }
            else {
                request('http://boxrec.com/boxer/' + id, function (err, response, body) {
                    if (typeof id !== 'number')
                        return reject();
                    else
                        return resolve(body);
                });
            }
        });
    }

    private performSearch(id: number, simulate: boolean): Promise<Boxer> {
        return new Promise<Boxer>((resolve, reject) => {
            var boxer = this.FindInCache(id);
            if (boxer != null) {
                console.log("Entry found in the cache, skipping http request ...");
                return resolve(boxer);
            }
            else {
                this.performHttpRequest(id, simulate).then(data => {
                    boxer = BoxRec.extractInfo(data);
                    this.AppendCache(boxer);
                    return resolve(boxer);
                }).catch(x => reject(x));
            }
        });
    }

    public findById(id: number): Promise<Boxer> {
        return this.performSearch(id, false);
    }

    public simulateFindById(id: number): Promise<Boxer> {
        return this.performSearch(id, true);
    }

    public findByName(name, cb): Promise<Boxer> {
        var thisObj = this;
        return new Promise<Boxer>((resolve, reject) => {
            request('http://www.google.com/search?q=' + name + '%20site%3Aboxrec.com', function (err, response, body) {
                var $ = cheerio.load(body);
                var id = parseInt($('cite').first().text().slice(17));
                thisObj.performSearch(id, false).then(x => resolve(x));
            });
        });
    }
}