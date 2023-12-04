// @ts-nocxheck

import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { createEintrag } from "../../src/services/EintragService";

let idBehrens: string
let idProtokoll: string

beforeEach(async () => {
    // create a pfleger
    const behrens = await createPfleger({ name: "Hofrat Behrens", password: "geheim", admin: false })
    idBehrens = behrens.id!;
    const protokoll = await createProtokoll({ patient: "H. Castorp", datum: `01.11.1912`, ersteller: idBehrens, public: true });
    idProtokoll = protokoll.id!;
})

test("/api/protokoll/:id/eintrage get, 5 Einträge", async () => {
    
    for (let i = 1; i <= 5; i++) {
        await createEintrag({ getraenk: "BHTee", menge: i * 10, protokoll: idProtokoll, ersteller: idBehrens })
    }
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(5);
});

test("/api/protokoll/:id/eintrage get, keine Einträge", async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
});

test("/api/protokoll/:id/eintrage get, falsche Protokoll-ID", async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/${idBehrens}/eintraege`);
    expect(response.statusCode).toBe(404);
});
