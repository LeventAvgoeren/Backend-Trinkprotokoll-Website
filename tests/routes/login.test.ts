import dotenv from "dotenv"
dotenv.config()
import supertest from "supertest";
import app from "../../src/app";
import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { login } from "../../src/services/AuthenticationService";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/services/JWTService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";


let pflegerLevent: HydratedDocument<IPfleger>
let loginLevent:string|undefined
beforeEach(async () => {
    pflegerLevent = await Pfleger.create({ name: "Levent", password: "Hallo123!3dadgf", admin: true })
    await pflegerLevent.save()
    
    
        loginLevent=await verifyPasswordAndCreateJWT("Levent","Hallo123!3dadgf")   //jwtString
  
    
})
//https://stackoverflow.com/questions/71314834/i-am-trying-to-set-a-cookie-in-supertest-but-it-does-not-work
test("get mit id GET",async ()=>{
    let result=await supertest(app).get(`/api/login/`).set('Cookie', [`access_token=${loginLevent}`]);;
    //let result=await supertest(app).get(`/api/login/${loginLevent}`);
    expect(result.statusCode).toBe(200)
})
test("GET catch ",async ()=>{
    let result=await supertest(app).get(`/api/login/`).set('Cookie', [`access_token=1234`]);
    expect(result.statusCode).toBe(400)
})


test("GET kein string",async ()=>{
    let result=await supertest(app).get(`/api/login/`);
    expect(result.statusCode).toBe(400)
})


test("DELETE",async ()=>{
    let result=await supertest(app).delete(`/api/login/`).set('Cookie', [`access_token=${loginLevent}`]);
    expect(result.statusCode).toBe(204)
})
test("POST",async ()=>{
    await performAuthentication("Levent", "Hallo123!3dadgf")
    let loginRes={ 
        name:"Levo",
        password:"Hallo1241!"
    }
    let result=await supertestWithAuth(app).post(`/api/login`).send(loginRes)
    expect(result.statusCode).toBe(204)
})
