import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, OneToOne } from "typeorm";

@Entity()
export class Record {

    @PrimaryColumn("int", { generated: true })
    id: number;

    @Column("number")
    w: number;

    @Column("number")
    l: number;

    @Column("number")
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