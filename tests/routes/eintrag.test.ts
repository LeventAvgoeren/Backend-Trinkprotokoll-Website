import { HydratedDocument, Types } from "mongoose"
import { EintragResource, PflegerResource, ProtokollResource } from "../../src/Resources"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import supertest from "supertest"
import app from "../../src/app";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { dateToString } from "../../src/services/ServiceHelper";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let pflegerLevent: HydratedDocument<IPfleger>
let pflegerAhmad: HydratedDocument<IPfleger>
let protkollLevent: HydratedDocument<IProtokoll>
let protkollAhmad: HydratedDocument<IProtokoll>
let eintragLevent :HydratedDocument<IEintrag>
let eintragAhmad:HydratedDocument<IEintrag>
beforeEach(async () => {
    pflegerLevent= await Pfleger.create({name:"Levent",password:"HalloWelt123!",admin:true})
    pflegerAhmad= await Pfleger.create({name:"Ahmad",password:"Welt123",admin:true})
    await pflegerLevent.save()
    await pflegerAhmad.save()
    protkollLevent = await Protokoll.create({
        id: pflegerLevent.id,
        patient: "levent",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: pflegerLevent.id,
        erstellerName: pflegerLevent.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })
    await protkollLevent.save()
    protkollAhmad = await Protokoll.create({
        id: pflegerAhmad.id,
        patient: "Ahmad",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: pflegerAhmad.id,
        erstellerName: pflegerAhmad.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })
    await protkollAhmad.save()
    eintragLevent = await Eintrag.create({
        getraenk:"Cola",
        menge:200,
        kommentar:"Zu wenig wasser",
        ersteller:protkollLevent.ersteller,
        erstellerName:pflegerLevent.name,
        protokoll:protkollLevent.id
    })
    await eintragLevent.save()
    eintragAhmad = await Eintrag.create({
        getraenk:"Cola",
        menge:200,
        kommentar:"Zu wenig wasser",
        ersteller:protkollLevent.ersteller,
        erstellerName:pflegerLevent.name,
        protokoll:protkollAhmad.id
    })
    await eintragAhmad.save()
})

test(" Eintrag DELETE",async () => {
await performAuthentication("Levent", "HalloWelt123!");

let result= await supertestWithAuth(app).delete(`/api/eintrag/${eintragLevent.id}`)
expect(result.statusCode).toBe(204)
expect(await Eintrag.findOne({id:eintragLevent.id})).toBeNull()
})
test(" Eintrag DELETE OHNE autorisierung",async () => {
    await performAuthentication("Levent", "HalloWelt123");
    
    let result= await supertest(app).delete(`/api/eintrag/${eintragLevent.id}`)
    expect(result.statusCode).toBe(401)
    })
test("getEintrag GET",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let result=await supertestWithAuth(app).get(`/api/eintrag/${eintragLevent.id}`);
    expect(result.statusCode).toBe(200)
    expect(result.body.erstellerName).toBe(pflegerLevent.name)
    expect(result.body.protokoll).toBe(protkollLevent.id)
})
test("getEintrag GET OHNE autorisierung",async ()=>{
    await performAuthentication("Levent", "HalloWelt123");

    let result=await supertest(app).get(`/api/eintrag/${eintragLevent.id}`);
    expect(result.statusCode).toBe(401)
})


test("Eintrag erstellen POST ",async()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let johnEintrag:EintragResource={  
    getraenk:"Wein",
    menge:200,
    kommentar:"mehr",
    ersteller:pflegerLevent.id,
    erstellerName:pflegerLevent.name,
    protokoll:protkollLevent.id}
    let result=await supertestWithAuth(app).post(`/api/eintrag`).send(johnEintrag)
    let johnModel= await Eintrag.findOne({getraenk:"Wein"})
    expect(johnModel).toBeDefined()
    expect(result.statusCode).toBe(201)
    expect(result.body.getraenk).toBe("Wein")
    expect(result.body.menge).toBe(200)
    expect(result.body.kommentar).toBe("mehr")
    expect(result.body.erstellerName).toBe(pflegerLevent.name)
})
test("Eintrag erstellen POST OHNE autorisierung ",async()=>{
    await performAuthentication("Levent", "HalloWelt123");

    let johnEintrag:EintragResource={  
    getraenk:"Wein",
    menge:200,
    kommentar:"mehr",
    ersteller:pflegerLevent.id,
    erstellerName:pflegerLevent.name,
    protokoll:protkollLevent.id}
    let result=await supertest(app).post(`/api/eintrag`).send(johnEintrag)
    let johnModel= await Eintrag.findOne({getraenk:"Wein"})
    expect(johnModel).toBeDefined()
    expect(result.statusCode).toBe(401)
})
test("getEintrag mit fakeid GET",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let fakeid=new Types.ObjectId().toString()
    let result=await supertestWithAuth(app).get(`/api/eintrag/${fakeid}`);
    expect(result.statusCode).toBe(400)
})
test("updateEintrag mit fakeid PUT",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let fakeid=new Types.ObjectId().toString()
    let updatetEintrag:EintragResource={  
          id:fakeid,
          getraenk:"Fanta",
          menge:300,
          kommentar:"Mehr trinken",
          ersteller:pflegerLevent.id,
          erstellerName:pflegerLevent.name,
          protokoll:protkollLevent.id}
          let result= await supertestWithAuth(app).put(`/api/eintrag/${updatetEintrag.id}`).send(updatetEintrag)
        expect(result.statusCode).toBe(400)
})
test("eintrag löschen mit fakeid DELETE",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let fakeid=new Types.ObjectId().toString()
    let result=await supertestWithAuth(app).delete(`/api/eintrag/${fakeid}`);
    expect(result.statusCode).toBe(400)
})
test("Eintrag updaten PUT", async () => {
    await performAuthentication("Levent", "HalloWelt123!");

    let updatetEintrag: EintragResource = {  
        id: eintragLevent.id,
        getraenk: "Fanta",
        menge: 300,
        kommentar: "Mehr trinken",
        ersteller: pflegerLevent.id,
        erstellerName: pflegerLevent.name,
        protokoll: protkollLevent.id
    };
    let result = await supertestWithAuth(app).put(`/api/eintrag/${eintragLevent.id}`).send(updatetEintrag); 
    expect(result.statusCode).toBe(200)
    expect(result.body.getraenk).toBe("Fanta");
    expect(result.body.menge).toBe(300);
    expect(result.body.kommentar).toBe("Mehr trinken");
});
test("Eintrag updaten fehler PUT", async () => {
    await performAuthentication("Levent", "HalloWelt123!");

    let fakeid=new Types.ObjectId().toString()

    let updatetEintrag: EintragResource = {  
        id: fakeid,
        getraenk: "Fanta",
        menge: 300,
        kommentar: "Mehr trinken",
        ersteller: pflegerLevent.id,
        erstellerName: pflegerLevent.name,
        protokoll: protkollLevent.id
    };
    let result = await supertestWithAuth(app).put(`/api/eintrag/${updatetEintrag.id}`).send(updatetEintrag); 
    expect(result.statusCode).toBe(400)
});

test("Eintrag erstellen POST ",async()=>{
    await performAuthentication("Levent", "HalloWelt123!");
    let fakeid=new Types.ObjectId().toString()
    let johnEintrag:EintragResource={  
    getraenk:"Wein",
    menge:200,
    ersteller:fakeid,
    protokoll:protkollLevent.id}
    let result=await supertestWithAuth(app).post(`/api/eintrag`).send(johnEintrag)
    expect(result.statusCode).toBe(400)
})
test("updateEintrag mit unterschiedlich  PUT",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");
//nochmal gucken 400 aus catch wird geworfen nicht aus der if bed
    let fakeid=new Types.ObjectId().toString()
    let updatetEintrag:EintragResource={  
          id:pflegerLevent.id,
          getraenk:"Fanta",
          menge:300,
          kommentar:"Mehr trinken",
          ersteller:pflegerLevent.id,
          erstellerName:pflegerLevent.name,
          protokoll:protkollLevent.id}

        let result= await supertestWithAuth(app).put(`/api/eintrag/${updatetEintrag.id}`).send(eintragAhmad)
        expect(result.statusCode).toBe(400)
})

