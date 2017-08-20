var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
const { URLSearchParams } = require('url');
var url = require('url');
import { BoxerToIcs } from './bouts-to-ics';
import { EntityManager } from './entityManager';
import { Boxer } from './entity/boxer';
import { Record } from './entity/record';
import { Bout } from './entity/bout';

export class BoxRec {
    cache: Boxer[];
    entityManager: EntityManager;
    constructor() {
        this.cache = null;
        this.entityManager = new EntityManager();
    }

    private AppendCache(boxer: Boxer): Promise<void> {
        return this.entityManager.SaveBoxer(boxer);
    }

    private FindInCache(boxerId: number): Promise<Boxer> {
        //return this.entityManager.LoadBoxer(boxerId, true);
        return new Promise<Boxer>(resolve => resolve(null));
    }

    private static extractInfo(data: any): Boxer {
        var $ = cheerio.load(data);
        var boxer = new Boxer();

        var boxrecScript = JSON.parse($('script[type="application/ld+json"]').text());
        var pathArray = url.parse(boxrecScript.url).path.split('/')
        boxer.id = parseInt(pathArray[pathArray.length - 1]);

        boxer.name = boxrecScript.name;
        boxer.nickname = boxrecScript.alternateName;
        boxer.birthdate = new Date(boxrecScript.birthDate);
        boxer.record = new Record();
        boxer.record.w = parseInt($('.profileWLD .bgW').first().text());
        boxer.record.l = parseInt($('.profileWLD .bgL').first().text());
        boxer.record.d = parseInt($('.profileWLD .bgD').first().text());
        boxer.bouts = $('table.dataTable tr.drawRowBorder').map(function (i: number, elem) {
            var bout = new Bout();
            bout.id = $(elem).attr('id');
            bout.date = $('td:nth-of-type(2)', elem).text().length > 0 ? new Date($('td:nth-of-type(2)', elem).text()) : null;
            bout.boxer1 = boxer;
            bout.boxer2 = new Boxer();
            bout.boxer2.name = $('.personLink', elem).text();
            var opponentUrl = $('a.personLink', elem).attr('href');
            pathArray = url.parse(opponentUrl).path.split('/')
            bout.boxer2.id = parseInt(pathArray[pathArray.length - 1]);
            bout.titles = $(`#second${bout.id} a[href*="/title/"]`).map(function (j, titleElem) {
                return $(titleElem).text();
            }).toArray();
            bout.location = $('td:nth-of-type(7)', elem).text().trim();
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
            }).catch(e => console.log(e));
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
        promiseList = ids.map(id => { return this.simulateFindById(id) });
        return new Promise<string>((resolve, reject) => {
            Promise.all(promiseList).then(boxers => {
                resolve(BoxerToIcs.fromBoxers(boxers));
            }).catch(x => reject(x));
        });
    }
}