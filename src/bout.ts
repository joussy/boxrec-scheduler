import { Boxer } from './boxer';
export class Bout {
    opponent: Boxer;
    titles: string[];
    location: string;
    date: Date;
    constructor() {
        this.titles = [];
    }
    static fromJSON(json: any): Bout {
        if (json == null)
            return null;
        return Object.assign(Object.create(Bout.prototype), json, {
            date: new Date(json.date),
            opponent: Boxer.fromJSON(json.opponent)
        });
    }
}