var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
const { URLSearchParams } = require('url');
var url = require('url');
import { BoxerToIcs } from './bouts-to-ics';
import { Boxer } from './boxer';
import { Record } from './record';
import { Bout } from './bout';

export class BoxRec {
    cache: Boxer[];
    constructor() {
        this.cache = null;
    }

    private LoadCache(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.cache != null)
                return resolve();
            fs = require('fs');
            var thisObj = this;
            fs.readFile('cache.json', 'utf8', function (err, data) {
                if (err) {
                    console.log("cache doesn't exists, creating one ...");
                    fs.writeFile('cache.json', [], function (err) {
                        if (err) {
                            console.log(err);
                            return reject();
                        }
                        else {
                            console.log("Cache created!");
                        }
                    });
                }
                if (typeof (data) == "string" && data.length > 0)
                    thisObj.cache = (<any[]>JSON.parse(data)).map(boxerJson => Boxer.fromJSON(boxerJson));
                else
                    thisObj.cache = [];
                console.log("Cache loaded!");
                return resolve();
            });
        });
    }

    private SaveCache(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile("cache.json", JSON.stringify(this.cache, null, 4), function (err) {
                if (err) {
                    console.log(err);
                    return reject();
                }
                console.log("The file was saved!");
                return resolve();
            });
        });
    }

    private AppendCache(boxer: Boxer) : Promise<void> {
        var thisObj = this;
        return new Promise<void>(resolve => {
            var index = this.cache.findIndex(x => x.id == boxer.id);
            if (index > -1)
                thisObj.cache[index] = boxer;
            else
                this.cache.push(boxer);
            this.SaveCache().then(() => resolve());
        });
    }

    private FindInCache(boxerId: number): Promise<Boxer> {
        var thisObj = this;
        return new Promise<Boxer>((resolve, reject) => {
            this.LoadCache().then(() => {
                resolve(thisObj.cache.find(x => x.id == boxerId));
            }).catch(() => reject());
        });
    }

    private static extractInfo(data: any): Boxer {
        var $ = cheerio.load(data);
        var boxer = new Boxer();
        var myUrl = url.parse($('link[itemprop="url"]').attr('href'));
        boxer.id = parseInt(myUrl.path.split('/')[2]);

        boxer.name = $('.boxerTitle').first().text().trim();
        boxer.nickname = $('span[itemprop="alternateName"]').text();
        boxer.record = new Record();
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
            this.FindInCache(id).then(boxer => {
                if (boxer != null) {
                    console.log("Entry found in the cache, skipping http request ...");
                    return resolve(boxer);
                }
                else {
                    this.performHttpRequest(id, simulate).then(data => {
                        boxer = BoxRec.extractInfo(data);
                        this.AppendCache(boxer).then(() => resolve(boxer));
                    }).catch(x => reject(x));
                }
            });
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

    public idstoIcs(ids: number[]): Promise<string> {
        //var idsClean = [...new Set(ids.map(id => parseInt(id)))]; //unique values
        var thisObj = this;
        var promiseList = [];
        promiseList = ids.map(id => { return this.findById(id) });
        return new Promise<string>((resolve, reject) => {
            Promise.all(promiseList).then(boxers => {
                resolve(BoxerToIcs.fromBoxers(boxers));
            }).catch(x => reject(x));
        });
    }
}