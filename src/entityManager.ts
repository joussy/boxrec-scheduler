import "reflect-metadata";
import { Connection } from "typeorm/connection/Connection";
import { createConnection } from "typeorm";
import { Boxer } from './entity/boxer';
import { Record } from './entity/record';
import { Bout } from './entity/bout';
const path = require('path');

export class EntityManager {
    connection: Promise<Connection> = null;
    constructor() {
        this.connection = createConnection({
            "driver": {
                "type": "sqlite",
                "storage": "myDb"
            },
            "autoSchemaSync": true,
            "entities": [
                __dirname + "/entity/*.js"
            ],
            "subscribers": [
                __dirname + "/subscriber/*.js,"
            ],
            "migrations": [
                __dirname + "/migration/*.js"
            ],
            "cli": {
                "entitiesDir": __dirname + "/entity",
                "migrationsDir": __dirname + + "/migration",
                "subscribersDir": __dirname + "/subscriber"
            }
        });
    }

    getConnection(): Promise<Connection> {
        return this.connection;
    }

    SaveBouts(bouts: Bout[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            //We store related boxers if there are missing from the DB
            var boxers: Boxer[] = [];
            bouts.forEach(bout => {
                if (!boxers.find(boxer => boxer.id == bout.boxer1.id)) {
                    boxers.push(bout.boxer1);
                }
                if (!boxers.find(boxer => boxer.id == bout.boxer2.id)) {
                    boxers.push(bout.boxer2);
                }
            });
            const boxerRepository = this.connection.then(c => {
                var boxerRepository = c.getRepository(Boxer);
                var boxerIds = boxers.map(boxer => boxer.id);
                var boxer = boxerRepository.findByIds(boxerIds).then(result => {
                    //We remove boxers that have been already stored
                    boxers = boxers.filter(boxer => !result.find(r => r.id == boxer.id));
                    boxerRepository.persist(boxers).then(x => {
                        //Missing boxers are now stored, we store the bouts
                        var boutRepository = c.getRepository(Bout);
                        boutRepository.persist(bouts)
                            .then(r => resolve())
                            .catch(e => reject(e));
                    }).catch(e => reject(e));
                }).catch(e => reject(e));
            });
        });
    }

    SaveBoxer(boxer: Boxer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.connection.then(c => {
                const boxerRepository = c.getRepository(Boxer);
                boxerRepository.persist(boxer)
                    .then(entity => {
                        if (boxer.bouts != null) {
                            this.SaveBouts(boxer.bouts)
                                .then(r => resolve())
                                .catch(e => reject(e));
                        }
                        else {
                            resolve();
                        }
                    });
            }).catch(e => reject(e));
        });
    }

    LoadBoxer(boxerId: number, retreiveBouts: boolean): Promise<Boxer> {
        return new Promise<Boxer>((resolve, reject) => {
            this.connection.then(c => {
                const boxerRepository = c.getRepository(Boxer);
                var boxer = boxerRepository.createQueryBuilder("boxer").innerJoinAndSelect("boxer.record", "record").getOne();
                resolve(boxer);
            }).catch(e => reject(e));
        });
    }

    runSample() {
        var boxer = new Boxer();
        boxer.birthdate = new Date(Date.now());
        boxer.id = 12;
        boxer.name = "Jean-Robert";
        boxer.nickname = "José";
        boxer.record = new Record();
        boxer.record.d = 1;
        boxer.record.w = 2;
        boxer.record.l = 4;

        this.SaveBoxer(boxer).then(x => {
            this.connection.then(c => {
                var boxerRepository = c.getRepository(Boxer);
                var result = boxerRepository.createQueryBuilder("boxer").innerJoinAndSelect("boxer.record", "record").getOne();
                result
                    .then(entity => {
                        console.log(entity.toString());
                    })
                    .catch(e => console.log(e));
            }).catch(e => console.log(e));
        }).catch(e => console.log(e));

    }
}