import { Record } from './record';
import { Bout } from './bout';

export class Boxer {
    id: number;
    name: string;
    nickname: string;
    record: Record;
    bouts: Bout[];
    birthdate: Date;

    constructor() {
        this.bouts = [];
    }
    static fromJSON(json: any): Boxer {
        if (json == null)
            return null;
        var bouts: Bout[] = null;
        //if (json.bouts != null)
        //    bouts = (<any[]>json.bouts).map(boutJson => Bout.fromJSON(boutJson));
        return Object.assign(Object.create(Boxer.prototype), json, {
            record: Record.fromJSON(json.record),
            birthdate: new Date(json.birthdate),
            bouts: (<any[]>json.bouts).map(boutJson => Bout.fromJSON(boutJson))
        });
    }
}