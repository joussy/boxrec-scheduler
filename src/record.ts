export class Record {
    w: number;
    l: number;
    d: number;
    toString() {
        return `W:${this.w}, L:${this.l}, D:${this.d}`;
    }
    static fromJSON(json: any): Record {
        if (json == null)
            return null;
        return Object.assign(Object.create(Record.prototype), json);
    }
}