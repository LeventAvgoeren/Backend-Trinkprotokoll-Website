// @ts-nocxheck

import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { createEintrag } from "../../src/services/EintragService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let idBehrens: string
let idProtokoll: string

beforeEach(async () => {
    // create a pfleger
    const behrens = await createPfleger({ name: "Hofrat Behrens", password: "Geheim123..!", admin: false })
    idBehrens = behrens.id!;
    const protokoll = await createProtokoll({ patient: "H. Castorp", datum: `01.11.1912`, ersteller: idBehrens, public: true });
    idProtokoll = protokoll.id!;
})

test("/api/protokoll/:id/eintrage get, 5 Einträge", async () => {
    await performAuthentication("Hofrat Behrens", "Geheim123..!");

    for (let i = 1; i <= 5; i++) {
        await createEintrag({ getraenk: "BHTee", menge: i * 10, protokoll: idProtokoll, ersteller: idBehrens })
    }
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(5);
});

test("/api/protokoll/:id/eintrage get, keine Einträge", async () => {
    await performAuthentication("Hofrat Behrens", "Geheim123..!");
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
});

test("/api/protokoll/:id/eintrage get, falsche Protokoll-ID", async () => {
    await performAuthentication("Hofrat Behrens", "Geheim123..!");
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/protokoll/${idBehrens}/eintraege`);
    expect(response.statusCode).toBe(404);
});
