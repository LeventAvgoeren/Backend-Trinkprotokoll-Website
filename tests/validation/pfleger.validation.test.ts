// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import { PflegerResource, ProtokollResource } from "../../src/Resources";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";


let pflegerLevent: HydratedDocument<IPfleger>
let pflegerAhmad: HydratedDocument<IPfleger>
let pflegerKenno: HydratedDocument<IPfleger>
let pflegerRein: HydratedDocument<IPfleger>

beforeEach(async () => {
    pflegerLevent= await Pfleger.create({name:"Levent",password:"HalloWelt123!",admin:true})
    pflegerAhmad= await Pfleger.create({name:"Ahmad",password:"Welt123",admin:true})
    pflegerKenno= await Pfleger.create({name:"Kenno",password:"Hallo123",admin:false})
    pflegerRein= await Pfleger.create({name:"Rein",password:"ReinBeiDir123",admin:false})

})
test("pfleger DELETE validation ",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let noMongoId="12344"
    let result=await supertestWithAuth(app).delete(`/api/pfleger/${noMongoId}`)
    expect(result).toHaveValidationErrorsExactly({ status: "400", params: "id" })
})
test("pfleger noMongoId URL & Body PUT validation ",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let noMongoId="12344"
    let pflegerUpdatet:PflegerResource={
        id:noMongoId,
        name:"Ahmo",
        password:"Hallo123$§dmdk13d",
        admin:false,
    }
    let result=await supertestWithAuth(app).put(`/api/pfleger/${pflegerUpdatet.id}`).send(pflegerUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400", body: "id",params:"id" })
})
test("pfleger noMongoId URL PUT validation ",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let noMongoId="12344"
    let pflegerUpdatet:PflegerResource={
        id:pflegerKenno.id,
        name:"Ahmo",
        password:"Hallo123$§dmdk13d",
        admin:false,
    }
    let result=await supertestWithAuth(app).put(`/api/pfleger/${noMongoId}`).send(pflegerUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400",params:"id" })
})
test("pfleger name length<0 PUT validation ",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let noMongoId="12344"
    let pflegerUpdatet:PflegerResource={
        id:pflegerKenno.id,
        name:"",
        password:"Hallo123$§dmdk13d",
        admin:false,
    }
    let result=await supertestWithAuth(app).put(`/api/pfleger/${pflegerUpdatet.id}`).send(pflegerUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"name" })
})
test("pfleger name kein stirng PUT validation ",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let pflegerUpdatet={
        id:pflegerKenno.id,
        name:1234,
        password:"Hallo123$§dmdk13d",
        admin:false,
    }
    let result=await supertestWithAuth(app).put(`/api/pfleger/${pflegerUpdatet.id}`).send(pflegerUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"name" })
})

test("pfleger password nicht stark genug PUT validation ",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let pflegerUpdatet={
        id:pflegerKenno.id,
        name:"levo",
        password:"Hallo1",
        admin:false,
    }
    let result=await supertestWithAuth(app).put(`/api/pfleger/${pflegerUpdatet.id}`).send(pflegerUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"password" })
})
test("pfleger password length<0 PUT validation ",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let pflegerUpdatet={
        id:pflegerKenno.id,
        name:"levo",
        password:"",
        admin:false,
    }
    let result=await supertestWithAuth(app).put(`/api/pfleger/${pflegerUpdatet.id}`).send(pflegerUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"password" })
})
test("pfleger admin kein boolean PUT validation ",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let pflegerUpdatet={
        id:pflegerKenno.id,
        name:"levo",
        password:"Hallo123%23JHd13",
        admin:12,
    }
    let result=await supertestWithAuth(app).put(`/api/pfleger/${pflegerUpdatet.id}`).send(pflegerUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"admin" })
})
test("pfleger name kein string POST validation",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let newPfleger={
        name:123,
        password:"Hallo123%23JHd13",
        admin:false,
    }
    let result=await supertestWithAuth(app).post(`/api/pfleger/`).send(newPfleger)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"name" })
})
test("pfleger name kein string POST validation",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let newPfleger={
        name:123,
        password:"Hallo123%23JHd13",
        admin:false,
    }
    let result=await supertestWithAuth(app).post(`/api/pfleger/`).send(newPfleger)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"name",})
})
test("pfleger name length<0 POST validation",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let newPfleger={
        name:"",
        password:"Hallo123%23JHd13",
        admin:false,
    }
    let result=await supertestWithAuth(app).post(`/api/pfleger/`).send(newPfleger)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"name",})
})
test("pfleger admin kein boolean POST validation",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let newPfleger={
        name:"levo",
        password:"Hallo123%23JHd13",
        admin:123,
    }
    let result=await supertestWithAuth(app).post(`/api/pfleger/`).send(newPfleger)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"admin",})
})
test("pfleger kein starkes passwort POST validation",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let newPfleger={
        name:"levo",
        password:"Hallo",
        admin:false,
    }
    let result=await supertestWithAuth(app).post(`/api/pfleger/`).send(newPfleger)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"password",})
})
test("pfleger password gegeben POST validation",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let newPfleger={
        name:"levo",
        password:123,
        admin:false,
    }
    let result=await supertestWithAuth(app).post(`/api/pfleger/`).send(newPfleger)
    expect(result).toHaveValidationErrorsExactly({ status: "400",body:"password",})
})
test("pfleger URL & Body unterschiedlich PUT",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let pflegerUpdatet:PflegerResource={
        id:pflegerLevent.id,
        name:"Ahmo",
        password:"Hallo123$§dmdk13d",
        admin:false,
    }
    let result=await supertestWithAuth(app).put(`/api/pfleger/${pflegerKenno.id}`).send(pflegerUpdatet)
    expect(result).toHaveValidationErrorsExactly({ status: "400", body: "id",params:"id" })
})


//fragen
// test("pfleger password nicht gegeben POST validation",async () => {
//     let newPfleger={
//         name:"levo",
//         admin:false,
//     }
//     let result=await supertest(app).post(`/api/pfleger/`).send(newPfleger)
//     expect(result).toHaveValidationErrorsExactly({ status: "400",body:"password",})
// })
