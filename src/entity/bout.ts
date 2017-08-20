import { Entity, PrimaryColumn, Column, JoinTable, JoinColumn, OneToOne } from "typeorm";
import { Boxer } from './boxer';

@Entity()
export class Bout {
    @PrimaryColumn("int", { generated: false })
    id: number;

    @OneToOne(type => Boxer, {
        cascadeInsert: false
    })
    @JoinColumn()
    boxer1: Boxer;

    @OneToOne(type => Boxer, {
        cascadeInsert: false
    })
    @JoinColumn()
    boxer2: Boxer;

    //Kept for backward compatibility
    opponent: Boxer;

    @Column("simple_array")
    titles: string[];

    @Column("text", { nullable: true })
    location: string;

    @Column("datetime")
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