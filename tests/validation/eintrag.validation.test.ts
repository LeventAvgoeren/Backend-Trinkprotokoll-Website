// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import { EintragResource } from "../../src/Resources";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { HydratedDocument } from "mongoose";
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
test("protokoll patient kein string PUT validation ",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let noMongo=12334
    let result=await supertestWithAuth(app).delete(`/api/eintrag/${noMongo}`)
    expect(result).toHaveValidationErrorsExactly({ status: "400",params:"id" })
})

test("protokoll patient kein string POST validation ",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let johnEintrag={  
        getraenk:true,
        menge:200,
        kommentar:"mehr",
        ersteller:pflegerLevent.id,
        erstellerName:pflegerLevent.name,
        protokoll:protkollLevent.id}
    let result=await supertestWithAuth(app).post(`/api/eintrag/`).send(johnEintrag)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"getraenk" })
})
test("getEintrag GET",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");
    let noMongo="12344"
    let result=await supertestWithAuth(app).get(`/api/eintrag/${noMongo}`);
    expect(result).toHaveValidationErrorsExactly({ status: "400",params:"id" })

})

