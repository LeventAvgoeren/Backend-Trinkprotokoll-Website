// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import { PflegerResource, ProtokollResource } from "../../src/Resources";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { dateToString } from "../../src/services/ServiceHelper";

let pomfrey: PflegerResource
let fredsProtokoll: ProtokollResource

beforeEach(async () => {
    pomfrey = await createPfleger({
        name: "Poppy Pomfrey", password: "12345bcdABCD..;,.", admin: false
    });
    fredsProtokoll = await createProtokoll({
        patient: "Fred Weasly", datum: "01.10.2023",
        public: true, closed: false,
        ersteller: pomfrey.id!
    })
})

test("/api/protokoll GET, ungültige ID", async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/protokoll/1234`)

    expect(response).toHaveValidationErrorsExactly({ status: "400", params: "id" })
})
test("/api/protokoll PUT, verschiedene ID (params und body)", async () => {
    const testee = supertest(app);
    // Hint: Gültige ID, aber für ein Protokoll ungültig!
    const invalidProtokollID = pomfrey.id;
    // Hint: Gebe hier Typ an, um im Objektliteral Fehler zu vermeiden!
    const update: ProtokollResource = { 
        ...fredsProtokoll, // Hint: Kopie von fredsProtokoll
        id: invalidProtokollID, // wir "überschreiben" die ID
        patient: "George Weasly" // und den Patienten
    }
    const response = await testee.put(`/api/protokoll/${fredsProtokoll.id}`).send(update);

    expect(response).toHaveValidationErrorsExactly({ status: "400", params: "id", body: "id" })
});

test("protokoll patient kein string PUT validation ",async () => {
    let protokollUpdatet={
        id:fredsProtokoll.id,
        patient: 12443, 
        datum: "01.10.2023",
        public: true,
        closed: false,
        ersteller: pomfrey.id!
    }
    let result=await supertest(app).put(`/api/protokoll/${protokollUpdatet.id}`).send(protokollUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"patient" })
})
test("protokoll public kein boolean PUT validation ",async () => {
    let protokollUpdatet={
        id:fredsProtokoll.id,
        patient: "levo", 
        datum: "01.10.2023",
        public: 1234,
        closed: false,
        ersteller: pomfrey.id!
    }
    let result=await supertest(app).put(`/api/protokoll/${protokollUpdatet.id}`).send(protokollUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"public" })
})
test("protokoll ersteller keine mongoId PUT validation ",async () => {
    let protokollUpdatet={
        id:fredsProtokoll.id,
        patient: "levo", 
        datum: "01.10.2023",
        public: true,
        closed: false,
        ersteller: 123445
    }
    let result=await supertest(app).put(`/api/protokoll/${protokollUpdatet.id}`).send(protokollUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"ersteller" })
})

test("protokoll URL keine mongoId DELETE validation ",async () => {
let noMongo="12133"
    let result=await supertest(app).delete(`/api/protokoll/${noMongo}`)
    expect(result).toHaveValidationErrorsExactly({ status: "400",params:"id" })
})

test("protokoll URL keine mongoId GET validation ",async () => {
let noMongo="12133"
    let result=await supertest(app).get(`/api/protokoll/${noMongo}/eintraege`)
    expect(result).toHaveValidationErrorsExactly({ status: "400",params:"id" })
})
test("protokoll patient kein string POST validation ",async () => {
    let johnProtokoll={
        patient:1234,
        datum: dateToString(new Date()),
        public:false,
        closed:false,
        ersteller:pomfrey.id,
        erstellerName:"john",
        updatedAt:dateToString(new Date()),
        gesamtMenge:0}

        let result=await supertest(app).post(`/api/protokoll/`).send(johnProtokoll)
        expect(result).toHaveValidationErrorsExactly({ status: "400",body:"patient" })
})
test("protokoll public kein boolean POST validation ",async () => {
        let johnProtokoll={
            patient:"jojo",
            datum: dateToString(new Date()),
            public:13234,
            closed:false,
            ersteller:pomfrey.id,
            erstellerName:"john",
            updatedAt:dateToString(new Date()),
            gesamtMenge:0}
    
            let result=await supertest(app).post(`/api/protokoll/`).send(johnProtokoll)
            expect(result).toHaveValidationErrorsExactly({ status: "400",body:"public" })
})
test("protokoll closed kein boolean POST validation ",async () => {
    let johnProtokoll={
        patient:"jojo",
        datum: dateToString(new Date()),
        public:false,
        closed:"1234rd",
        ersteller:pomfrey.id,
        erstellerName:"john",
        updatedAt:dateToString(new Date()),
        gesamtMenge:0}

        let result=await supertest(app).post(`/api/protokoll/`).send(johnProtokoll)
        expect(result).toHaveValidationErrorsExactly({ status: "400",body:"closed" })
})
test("protokoll kein mongoId POST validation ",async () => {
    let johnProtokoll={
        patient:"jojo",
        datum: dateToString(new Date()),
        public:false,
        closed:true,
        ersteller:122443,
        erstellerName:"john",
        updatedAt:dateToString(new Date()),
        gesamtMenge:0}

        let result=await supertest(app).post(`/api/protokoll/`).send(johnProtokoll)
        expect(result).toHaveValidationErrorsExactly({ status: "400",body:"ersteller" })
})

test("protokoll patient kein string PUT validation ",async () => {
    let noMongo=12334
    let result=await supertest(app).delete(`/api/eintrag/${noMongo}`)
    expect(result).toHaveValidationErrorsExactly({ status: "400",params:"id" })
   })
