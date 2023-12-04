import { HydratedDocument, Types } from "mongoose"
import { PflegerResource } from "../../src/Resources"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import supertest from "supertest"
import app from "../../src/app";

let pflegerLevent: HydratedDocument<IPfleger>
let pflegerAhmad: HydratedDocument<IPfleger>
let pflegerKenno: HydratedDocument<IPfleger>
let pflegerRein: HydratedDocument<IPfleger>

beforeEach(async () => {
    pflegerLevent= await Pfleger.create({name:"Levent",password:"HalloWelt123",admin:true})
    pflegerAhmad= await Pfleger.create({name:"Ahmad",password:"Welt123",admin:true})
    pflegerKenno= await Pfleger.create({name:"Kenno",password:"Hallo123",admin:false})
    pflegerRein= await Pfleger.create({name:"Rein",password:"ReinBeiDir123",admin:false})

})
test("pfleger DELETE",async () => {
    let result=await supertest(app).delete(`/api/pfleger/${pflegerLevent.id}`)
    expect(result.statusCode).toBe(204)
    expect(await Pfleger.findOne({id:pflegerLevent.id})).toBeNull()
})

test("getAllePfleger GET",async ()=>{
let result=await supertest(app).get(`/api/pfleger/alle`);
expect(result.statusCode).toBe(200)
})


test("pfleger erstellen POST ",async()=>{
    //Wenn passwort zu leicht ist schlägt der test fehl 
    let john:PflegerResource={name:"John",password:"Hund123$1234kwjkw",admin:true}
    let result=await supertest(app).post(`/api/pfleger`).send(john)
    expect(result.body.name).toBe("John")
    expect(result.body.admin).toBeTruthy()
    expect(result).not.toHaveProperty("Hund123$1234kwjkw")
    expect(result.statusCode).toBe(201)
})

test("pfleger updaten PUT",async()=>{
    //Wenn passwort zu leicht ist schlägt der test fehl 
let pflegerUpdatet:PflegerResource={
    id:pflegerLevent.id,
    name:"Ahmo",
    password:"Hallo123$§dmdk13d",
    admin:false,
}
let result= await supertest(app).put(`/api/pfleger/${pflegerUpdatet.id}`).send(pflegerUpdatet)
expect(result.statusCode).toBe(200)
expect(result.body.name).toBe("Ahmo")
expect(result.body.admin).toBeFalsy()
expect(result).not.toHaveProperty("password")

})
test("pfleger löschen mit fakeId DELETE",async ()=>{
    let fakeId= new Types.ObjectId()
    let result=await supertest(app).delete(`/api/pfleger/${fakeId}`)
    expect(result.statusCode).toBe(404)
})
test("pfleger erstellen mit fehlenden angaben DELETE",async ()=>{
    let fakeId= new Types.ObjectId().toString()
    let pflegerUpdatet:PflegerResource={
        id:fakeId,
        name:"Ahmo",
        password:"Hallo123",
        admin:false,
    }
    let result=await supertest(app).delete(`/api/pfleger/${pflegerUpdatet.id}`)
    expect(result.statusCode).toBe(404)
})
test("pfleger updaten mit fehlenden pw POST",async ()=>{
    
    let john:PflegerResource={name:"kek",admin:true}
    let result=await supertest(app).post(`/api/pfleger`).send(john)
    expect(result.statusCode).toBe(400)
})


test("pfleger updaten mit fake id PUT ",async ()=>{
    let fakeId= new Types.ObjectId().toString()

    let john:PflegerResource={
        id:fakeId,
        name:"kek",
        password:"12344",
        admin:true}

    let result=await supertest(app).put(`/api/pfleger/${john.id}`).send(john)
    expect(result.statusCode).toBe(400)//pfleger id nicht gefunden 404
})

test("pfleger updaten mit unterschiedliche ids PUT ",async ()=>{

    let john:PflegerResource={
        id:pflegerLevent.id,
        name:"kek",
        password:"12344",
        admin:true}

    let result=await supertest(app).put(`/api/pfleger/${john.id}`).send(pflegerKenno)
    expect(result.statusCode).toBe(400)//pfleger id nicht gefunden 404
})


