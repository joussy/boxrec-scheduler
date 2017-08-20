import { Entity, PrimaryColumn, Column, ManyToOne, JoinTable, OneToOne, JoinColumn } from "typeorm";
import { Record } from './record';
import { Bout } from './bout';

@Entity()
export class Boxer {
    
    @PrimaryColumn("int", { generated: false })
    id: number;

    @Column("text")
    name: string;

    @Column("text", { nullable: true })
    nickname: string;

    @Column("datetime", { nullable: true })
    birthdate: Date;

    @OneToOne(type => Record, {
        cascadeInsert: true, lazy: false
    })
    @JoinColumn()
    record: Record;

    recordId: number;

    @ManyToOne(type => Bout, {
        cascadeInsert: false
    })
    @JoinTable()
    bouts: Bout[];

    toString(): string {
        return JSON.stringify(this, null, 4);
    }

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