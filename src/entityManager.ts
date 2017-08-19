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

    //Plutot une promise ?
    SaveBoxer(boxer: Boxer): void {
        this.connection.then(c => {
            const boxerRepository = c.getRepository(Boxer);
            boxerRepository.persist(boxer);
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

    async runSample() {
    }
}