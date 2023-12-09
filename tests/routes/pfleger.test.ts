import { HydratedDocument, Types } from "mongoose"
import { PflegerResource } from "../../src/Resources"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import supertest from "supertest"
import app from "../../src/app";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let pflegerLevent: HydratedDocument<IPfleger>
let pflegerAhmad: HydratedDocument<IPfleger>
let pflegerKenno: HydratedDocument<IPfleger>
let pflegerHanz: HydratedDocument<IPfleger>

beforeEach(async () => {
    pflegerLevent= await Pfleger.create({name:"Levent",password:"HalloWelt123!",admin:true})
    pflegerAhmad= await Pfleger.create({name:"Ahmad",password:"Welt123",admin:true})
    pflegerKenno= await Pfleger.create({name:"Kenno",password:"Hallo123",admin:true})
    pflegerHanz= await Pfleger.create({name:"Hanz",password:"LevoKeko124!",admin:false})
})
test("pfleger DELETE",async () => {
    await performAuthentication("Levent", "HalloWelt123!");
    let result=await supertestWithAuth(app).delete(`/api/pfleger/${pflegerLevent.id}`)
    expect(result.statusCode).toBe(204)
    expect(await Pfleger.findOne({id:pflegerLevent.id})).toBeNull()
})
test("pfleger DELETE OHNE autori",async () => {
    await performAuthentication("Levent", "HalloWelt123");
    let result=await supertest(app).delete(`/api/pfleger/${pflegerLevent.id}`)
    expect(result.statusCode).toBe(401)
})

test("getAllePfleger GET",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");
let result=await supertestWithAuth(app).get(`/api/pfleger/alle`);
expect(result.statusCode).toBe(200)
})
test("getAllePfleger GET OHNE autori",async ()=>{
    await performAuthentication("Levent", "HalloWelt123");
let result=await supertest(app).get(`/api/pfleger/alle`);
expect(result.statusCode).toBe(401)
})


test("pfleger erstellen POST ",async()=>{
    //Wenn passwort zu leicht ist schlägt der test fehl 
    //Nochmal nach gucken vlt test ausgetrickst
    await performAuthentication("Levent", "HalloWelt123!");
    let john:PflegerResource={name:"John",password:"Hund123$1234kwjkw",admin:true}
    let result=await supertestWithAuth(app).post(`/api/pfleger`).send(john)
    expect(result.statusCode).toBe(201)
    expect(result.body.name).toBe("John")
    expect(result.body.admin).toBeTruthy()
    expect(result).not.toHaveProperty("Hund123$1234kwjkw")
    
})
test("pfleger erstellen POST OHNE autor ",async()=>{
    await performAuthentication("Levent", "HalloWelt123");
    let john:PflegerResource={name:"John",password:"Hund123$1234kwjkw",admin:true}
    let result=await supertest(app).post(`/api/pfleger`).send(john)
    expect(result.statusCode).toBe(401)
})

test("pfleger updaten PUT",async()=>{
    //Wenn passwort zu leicht ist schlägt der test fehl 
    await performAuthentication("Levent", "HalloWelt123!");

let pflegerUpdatet:PflegerResource={
    id:pflegerLevent.id,
    name:"Ahmo",
    password:"Hallo123$§dmdk13d",
    admin:false,
}
let result= await supertestWithAuth(app).put(`/api/pfleger/${pflegerUpdatet.id}`).send(pflegerUpdatet)
expect(result.statusCode).toBe(200)
expect(result.body.name).toBe("Ahmo")
expect(result.body.admin).toBeFalsy()
expect(result).not.toHaveProperty("password")

})
test("pfleger updaten PUT OHNE autor",async()=>{
    //Wenn passwort zu leicht ist schlägt der test fehl 
    await performAuthentication("Levent", "HalloWelt123");

let pflegerUpdatet:PflegerResource={
    id:pflegerLevent.id,
    name:"Ahmo",
    password:"Hallo123$§dmdk13d",
    admin:false,
}
let result= await supertest(app).put(`/api/pfleger/${pflegerUpdatet.id}`).send(pflegerUpdatet)
expect(result.statusCode).toBe(401)


})
test("pfleger löschen mit fakeId DELETE",async ()=>{
    let fakeId= new Types.ObjectId()
    await performAuthentication("Levent", "HalloWelt123!");
    let result=await supertestWithAuth(app).delete(`/api/pfleger/${fakeId}`)
    expect(result.statusCode).toBe(400)
})
test("pfleger löschen mit fakeId DELETE OHNE autor",async ()=>{
    let fakeId= new Types.ObjectId()
    await performAuthentication("Levent", "HalloWelt123");
    let result=await supertest(app).delete(`/api/pfleger/${fakeId}`)
    expect(result.statusCode).toBe(401)
})
test("pfleger erstellen mit fehlenden angaben DELETE",async ()=>{
    let fakeId= new Types.ObjectId().toString()
    let pflegerUpdatet:PflegerResource={
        id:fakeId,
        name:"Ahmo",
        password:"Hallo123",
        admin:false,
    }
    await performAuthentication("Levent", "HalloWelt123!");
    let result=await supertestWithAuth(app).delete(`/api/pfleger/${pflegerUpdatet.id}`)
    expect(result.statusCode).toBe(400)
})
test("pfleger erstellen mit fehlenden angaben DELETE",async ()=>{
    let fakeId= new Types.ObjectId().toString()
    let pflegerUpdatet:PflegerResource={
        id:fakeId,
        name:"Ahmo",
        password:"Hallo123",
        admin:false,
    }
    await performAuthentication("Levent", "HalloWelt123");
    let result=await supertest(app).delete(`/api/pfleger/${pflegerUpdatet.id}`)
    expect(result.statusCode).toBe(401)
})
test("pfleger updaten mit fehlenden pw POST",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");

    let john:PflegerResource={name:"kek",admin:true}
    let result=await supertestWithAuth(app).post(`/api/pfleger`).send(john)
    expect(result.statusCode).toBe(400)
})
test("pfleger updaten mit fehlenden pw POST OHNE autor",async ()=>{
    await performAuthentication("Levent", "HalloWelt123");

    let john:PflegerResource={name:"kek",admin:true}
    let result=await supertest(app).post(`/api/pfleger`).send(john)
    expect(result.statusCode).toBe(401)
})



test("pfleger updaten mit fake id PUT ",async ()=>{
    let fakeId= new Types.ObjectId().toString()
    await performAuthentication("Levent", "HalloWelt123!");


    let john:PflegerResource={
        id:fakeId,
        name:"kek",
        password:"12344",
        admin:true}

    let result=await supertestWithAuth(app).put(`/api/pfleger/${john.id}`).send(john)
    expect(result.statusCode).toBe(400)//pfleger id nicht gefunden 404
})

test("pfleger updaten mit fake id PUT ",async ()=>{
    let fakeId= new Types.ObjectId().toString()
    await performAuthentication("Levent", "HalloWelt123");


    let john:PflegerResource={
        id:fakeId,
        name:"kek",
        password:"12344",
        admin:true}

    let result=await supertest(app).put(`/api/pfleger/${john.id}`).send(john)
    expect(result.statusCode).toBe(401)//pfleger id nicht gefunden 404
})

test("pfleger updaten mit unterschiedliche ids PUT",async ()=>{
    await performAuthentication("Levent", "HalloWelt123!");
    let john:PflegerResource={
        id:pflegerLevent.id,
        name:"kek",
        password:"12344",
        admin:true}

    let result=await supertestWithAuth(app).put(`/api/pfleger/${john.id}`).send(pflegerKenno)
    expect(result.statusCode).toBe(400)
})
test("pfleger updaten mit unterschiedliche ids PUT OHNE autor",async ()=>{
    await performAuthentication("Levent", "HalloWelt123");
    let john:PflegerResource={
        id:pflegerLevent.id,
        name:"kek",
        password:"12344",
        admin:true}

    let result=await supertest(app).put(`/api/pfleger/${john.id}`).send(pflegerKenno)
    expect(result.statusCode).toBe(401)
})
test("pfleger DELETE als USER",async () => {
    await performAuthentication("Hanz","LevoKeko124!");
    let result=await supertestWithAuth(app).delete(`/api/pfleger/${pflegerHanz.id}`)
    expect(result.statusCode).toBe(401)
})
test("pfleger erstellen POST als USER",async()=>{
    await performAuthentication("Hanz","LevoKeko124!");
    let john:PflegerResource={name:"John",password:"Hund123$1234kwjkw",admin:true}
    let result=await supertestWithAuth(app).post(`/api/pfleger`).send(john)
    expect(result.statusCode).toBe(401)
})

test("pfleger updaten PUT als USER",async()=>{
    //Wenn passwort zu leicht ist schlägt der test fehl 
    await performAuthentication("Hanz","LevoKeko124!");
let pflegerUpdatet:PflegerResource={
    id:pflegerLevent.id,
    name:"Ahmo",
    password:"Hallo123$§dmdk13d",
    admin:false,
}
let result= await supertestWithAuth(app).put(`/api/pfleger/${pflegerUpdatet.id}`).send(pflegerUpdatet)
expect(result.statusCode).toBe(401)
})
test("getAllePfleger GET als USER",async ()=>{
await performAuthentication("Hanz","LevoKeko124!");
let result=await supertest(app).get(`/api/pfleger/alle`);
expect(result.statusCode).toBe(401)
})




