import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, OneToOne } from "typeorm";
import { Record } from './record';
import { Bout } from './bout';

@Entity()
export class Boxer {
    
    @PrimaryColumn("int", { generated: false })
    id: number;

    @Column("text")
    name: string;

    @Column("text")
    nickname: string;

    @Column("date")
    birthdate: Date;

    @OneToOne(type => Record, {
        cascadeInsert: true
    })
    record: Record;

    @ManyToMany(type => Bout, {
        cascadeInsert: true
    })
    @JoinTable()
    bouts: Bout[];


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