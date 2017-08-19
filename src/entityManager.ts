import "reflect-metadata";
import { Connection } from "typeorm/connection/Connection";
import { createConnection } from "typeorm";
import { Boxer } from './entity/boxer';
import { Record } from './entity/record';
import { Bout } from './entity/bout';
const path = require('path');

export class EntityManager {
    connection:Promise<Connection> = null;
    constructor() {
        console.log(__dirname);
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
        //ATTENTION : GARE A L'ASYNC
        //    .then(async connection => {
        //    this.connection = connection;
        //}).catch(error => console.log("Error: ", error));
    }
    getConnection(): Promise<Connection> {
        return this.connection;
    }

    SaveBoxer(boxer: Boxer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.connection.then(c => {
                const boxerRepository = c.getRepository(Boxer);
                boxerRepository.persist(boxer)
                    .then(entity => {
                        resolve();
                    });
            }).catch(e => reject(e));
        });
    }

    LoadBoxer(boxerId: number): Promise<Boxer> {
        return new Promise<Boxer>((resolve, reject) => {
            this.connection.then(c => {
                const boxerRepository = c.getRepository(Boxer);
                var boxer = boxerRepository.findOneById(boxerId);
                if (!boxer) {
                    reject();
                } else {
                    resolve(boxer);
                }
            });
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