import * as BoxRec from './boxrec';
var icalendar = require('icalendar');
var box = new BoxRec.BoxRec();

export class BoxerToIcs {
    convert(boxer: BoxRec.Boxer, upcomingOnly: boolean): any[] {
        return boxer.bouts.map((bout) => {
            //workaround for the JSON Cast, see http://choly.ca/post/typescript-json/
            if (bout.date != null)
                bout.date = new Date(bout.date.toString());
            if (bout.date != null
                && (!upcomingOnly || bout.date > new Date())) {
                var uid = `${boxer.id}_${bout.opponent.name}_${bout.date.toUTCString()}`.replace(/[^\w\s]/gi, '').replace(/ /g, '_');
                var event = new icalendar.VEvent(uid);
                event.setSummary(`${boxer.name} (${boxer.record.toString()}) vs ${bout.opponent.name}`);
                var dateEnd = new Date(bout.date.valueOf());
                dateEnd.setHours(22);
                bout.date.setHours(0);
                event.setDate(bout.date, dateEnd);
                event.setLocation(bout.location);
                event.setDescription('Titles to defend: ' + bout.titles.join(' // '));
                return event;
            }
            //    attendees: [
            //        { name: boxer.name },
            //        { name: bout.opponent }
            //    ],
            //    categories: ['Boxing'],
            //    alarms: [
            //        { action: 'DISPLAY', trigger: '-PT24H', description: 'Reminder', repeat: true, duration: 'PT15M' },
            //        { action: 'AUDIO', trigger: '-PT30M' }
            //    ]
            //});
        });
    }

    fromIds(ids: string[]): Promise<string> {
        var thisObj = this;
        var promiseList = [];
        for (var i = 0; i < ids.length; i++) {
            promiseList.push(box.findById(parseInt(ids[i])));
        }
        return new Promise<string>((resolve, reject) => {
            Promise.all(promiseList).then(boxers => {
                var ical = new icalendar.iCalendar();
                var events = [];
                boxers.forEach(boxer => events.push(...thisObj.convert(boxer, false)));
                //var ret = "".concat(...boxers.map(boxer => thisObj.convert(boxer, false)));
                events.forEach(event => ical.addComponent(event));
                resolve(ical.toString());
            }).catch(x => reject(x));
        });
    }
    private sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};