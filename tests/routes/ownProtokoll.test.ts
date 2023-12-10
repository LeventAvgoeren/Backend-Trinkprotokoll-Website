import { HydratedDocument, Types } from "mongoose"
import { PflegerResource, ProtokollResource } from "../../src/Resources"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import supertest from "supertest"
import app from "../../src/app";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { dateToString } from "../../src/services/ServiceHelper";
import { createEintrag } from "../../src/services/EintragService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let pflegerLevent: HydratedDocument<IPfleger>
let pflegerAhmad: HydratedDocument<IPfleger>
let protkollLevent: HydratedDocument<IProtokoll>
let protkollAhmad: HydratedDocument<IProtokoll>
let pflegerNoOffi: HydratedDocument<IPfleger>
let protokollNoOffi: HydratedDocument<IProtokoll>
beforeEach(async () => {
    pflegerLevent= await Pfleger.create({name:"Levent",password:"HalloWelt123!",admin:true})
    pflegerAhmad= await Pfleger.create({name:"Ahmad",password:"Welt123!31s",admin:true})
    pflegerNoOffi= await Pfleger.create({name:"offi",password:"Welt123!",admin:true})

    protkollLevent = await Protokoll.create({
        patient: "levo",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: pflegerLevent.id,
        erstellerName: pflegerLevent.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })
    protkollAhmad = await Protokoll.create({
        patient: "Ahmad",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: pflegerAhmad.id,
        erstellerName: pflegerAhmad.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })
    protokollNoOffi = await Protokoll.create({
        patient: "peter",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: pflegerNoOffi.id,
        erstellerName: pflegerNoOffi.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })
})
test("protokoll DELETE",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let result=await supertestWithAuth(app).delete(`/api/protokoll/${protkollLevent.id}`)
    expect(result.statusCode).toBe(204)
    expect(await Protokoll.findOne({id:protkollLevent.id})).toBeNull()
})
test("protokoll DELETE OHNE autor",async () => {
    await performAuthentication("Levent", "HalloWelt123");
    let result=await supertest(app).delete(`/api/protokoll/${protkollLevent.id}`)
    expect(result.statusCode).toBe(401)
})
test("get mit id GET",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");
    let result=await supertestWithAuth(app).get(`/api/protokoll/${protkollLevent.id}`);
    expect(result.statusCode).toBe(200)
    expect(result.body.patient).toBe("levo")
    expect(result.body.public).toBeFalsy()
    expect(result.body.closed).toBeFalsy()
    expect(result.body.ersteller).toBe(pflegerLevent.id)

})
test("get mit id GET nicht autorisiert",async ()=>{
    await performAuthentication("Levent", "HalloWelt123");
    let result=await supertest(app).get(`/api/protokoll/${protkollAhmad.id}`);
    expect(result.statusCode).toBe(401)
})

test("getAlle GET",async ()=>{
await performAuthentication("Levent", "HalloWelt123!");
let result=await supertestWithAuth(app).get(`/api/protokoll/alle`);
expect(result.statusCode).toBe(200)
})
test("Protokoll erstellen POST",async()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let johnProtokoll:ProtokollResource={patient:"john",datum: dateToString(new Date()),public:false,closed:false,ersteller:pflegerLevent.id,erstellerName:"john",updatedAt:dateToString(new Date()),gesamtMenge:0}
    let result=await supertestWithAuth(app).post(`/api/protokoll`).send(johnProtokoll)
    let johnModel= await Pfleger.findOne({patient:"john"})
    expect(johnModel).toBeDefined()
    expect(result.statusCode).toBe(201)
    expect(result.body.patient).toBe("john")
    expect(result.body.public).toBeFalsy()
    expect(result.body.closed).toBeFalsy()
    expect(result.body.ersteller).toBe(pflegerLevent.id)
})
test("Protokoll erstellen POST OHNE autor",async()=>{

    let johnProtokoll:ProtokollResource={patient:"john",datum: dateToString(new Date()),public:false,closed:false,ersteller:pflegerLevent.id,erstellerName:"john",updatedAt:dateToString(new Date()),gesamtMenge:0}
    let result=await supertest(app).post(`/api/protokoll`).send(johnProtokoll)
    expect(result.statusCode).toBe(401)
})

test("Protokoll updaten PUT",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let johnProtokoll:ProtokollResource={id:protkollLevent.id,patient:"john",datum: dateToString(new Date()),public:false,closed:false,ersteller:pflegerLevent.id,erstellerName:"ligma",updatedAt:dateToString(new Date()),gesamtMenge:0}
    let result= await supertestWithAuth(app).put(`/api/protokoll/${johnProtokoll.id}`).send(johnProtokoll)
    expect(result.statusCode).toBe(200)
    expect(result.body.patient).toBe("john")
    expect(result.body.public).toBeFalsy()
    expect(result.body.closed).toBeFalsy()
})
test("Protokoll updaten PUT",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let johnProtokoll:ProtokollResource={id:protkollLevent.id,patient:"john",datum: dateToString(new Date()),public:false,closed:false,ersteller:pflegerAhmad.id,erstellerName:"ligma",updatedAt:dateToString(new Date()),gesamtMenge:0}
    let result= await supertestWithAuth(app).put(`/api/protokoll/${johnProtokoll.id}`).send(johnProtokoll)
    expect(result.statusCode).toBe(403)
})
test("Protokoll updaten PUT OHNE autor",async ()=>{
    let johnProtokoll:ProtokollResource={id:protkollLevent.id,patient:"john",datum: dateToString(new Date()),public:false,closed:false,ersteller:pflegerAhmad.id,erstellerName:"ligma",updatedAt:dateToString(new Date()),gesamtMenge:0}
    let result= await supertest(app).put(`/api/protokoll/${johnProtokoll.id}`).send(johnProtokoll)
    expect(result.statusCode).toBe(401)

})
test("Protokoll get mit fakeId GET",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");
  let fakeid=new Types.ObjectId().toString()
  let result=await supertestWithAuth(app).get(`/api/protokoll/${fakeid}`);
  expect(result.statusCode).toBe(400)
})
test("Protokoll updaten mit fakeId PUT",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let fakeid=new Types.ObjectId().toString()
    let johnProtokoll:ProtokollResource={id:fakeid,patient:"john",datum: dateToString(new Date()),public:false,closed:false,ersteller:pflegerLevent.id,erstellerName:"ligma",updatedAt:dateToString(new Date()),gesamtMenge:0}
    let result= await supertestWithAuth(app).put(`/api/protokoll/${johnProtokoll.id}`).send(johnProtokoll)
    expect(result.statusCode).toBe(400)
})
test("Protokoll löschen mit fakeId DELTE",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let fakeid=new Types.ObjectId().toString()
    let result=await supertestWithAuth(app).delete(`/api/protokoll/${fakeid}`)
    expect(result.statusCode).toBe(400)
})
test("Protokoll löschen mit fakeId DELTE",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let fakeid=new Types.ObjectId().toString()
    let result=await supertestWithAuth(app).delete(`/api/protokoll/${protkollAhmad.id}`)
    expect(result.statusCode).toBe(403)
})
test("Protokoll löschen mit fakeId DELTE OHNE autor",async ()=>{
    await performAuthentication("Levent", "HalloWelt123");

    let fakeid=new Types.ObjectId().toString()
    let result=await supertest(app).delete(`/api/protokoll/${fakeid}`)
    expect(result.statusCode).toBe(401)
})
test("Protokoll erstellen Error POST",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let johnProtokoll:ProtokollResource={patient:"john",datum: dateToString(new Date()),public:false,closed:false,ersteller:pflegerLevent.id,erstellerName:"john",updatedAt:dateToString(new Date()),gesamtMenge:0}
    let result=await supertestWithAuth(app).post(`/api/protokoll`).send(johnProtokoll)
    expect(result.statusCode).toBe(201)
})
test("Protokoll get Error test GET",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");
    let fakeid=new Types.ObjectId().toString()
    let result=await supertestWithAuth(app).get(`/api/protokoll/${fakeid}`);
    expect(result.statusCode).toBe(400)
})

test("Protokoll mit unterschiedlichen id PUT",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let johnProtokoll:ProtokollResource={
        id:protkollLevent.id,
        patient:"john",
        datum: dateToString(new Date()),
        public:false,
        closed:false,
        ersteller:pflegerAhmad.id,
        erstellerName:"ligma",
        updatedAt:dateToString(new Date()),
        gesamtMenge:0}
    let result= await supertestWithAuth(app).put(`/api/protokoll/${johnProtokoll.id}`).send(protkollAhmad)
    expect(result.statusCode).toBe(400)
})

test("Protokoll erstellen Error POST",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let fakeid=new Types.ObjectId().toString()
    let johnProtokoll={
        patient:"john",
        datum: dateToString(new Date()),
        public:false,
        closed:false,
        ersteller:fakeid,
        erstellerName:"john",
        updatedAt:dateToString(new Date()),
        gesamtMenge:0}
    let result=await supertestWithAuth(app).post(`/api/protokoll`).send(johnProtokoll)
    expect(result.statusCode).toBe(400)
})

test("get mit id GET",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");
    let result=await supertestWithAuth(app).get(`/api/protokoll/${protokollNoOffi.id}`);
    expect(result.statusCode).toBe(401)
})