import supertest from "supertest";
import app from "../../src/app";
import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { login } from "../../src/services/AuthenticationService";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/services/JWTService";


let pflegerLevent: HydratedDocument<IPfleger>
let loginLevent
let decode
beforeEach(async () => {
    pflegerLevent = await Pfleger.create({ name: "Levent", password: "Hallo123!3dadgf", admin: true })
    await pflegerLevent.save()
    loginLevent=await verifyPasswordAndCreateJWT("Levent","Hallo123!3dadgf")
    decode=verifyJWT(loginLevent)
})

test("get mit id GET",async ()=>{
    let result=await supertest(app).get(`/api/login/`);
    expect(result.statusCode).toBe(200)
})
test("DELETE",async ()=>{
    let result=await supertest(app).delete(`/api/login/`);
    expect(result.statusCode).toBe(200)
})