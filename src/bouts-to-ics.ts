import * as BoxRec from './boxrec';
var icalendar = require('icalendar');

export class BoxerToIcs {
    private static convert(boxer: BoxRec.Boxer, upcomingOnly: boolean): any[] {
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
        });
    }

    public static fromBoxers(boxers: BoxRec.Boxer[]): string {
        var thisObj = this;
        var ical = new icalendar.iCalendar();
        var events = [];
        boxers.forEach(boxer => events.push(...thisObj.convert(boxer, false)));
        events.forEach(event => ical.addComponent(event));
        return ical.toString();
    }
};