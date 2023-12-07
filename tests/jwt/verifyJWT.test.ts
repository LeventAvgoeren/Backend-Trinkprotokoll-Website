import dotenv from "dotenv"
dotenv.config()
import { verifyPasswordAndCreateJWT } from "../../src/services/JWTService"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import { HydratedDocument } from "mongoose"
import {verify }from "jsonwebtoken";

let leventLogin:HydratedDocument<IPfleger>
let secret=process.env.JWT_SECRET;
beforeEach(async () => {
    leventLogin=await Pfleger.create({name:"Levent",password:"LEVENThallo123!",admin:true})
    await leventLogin.save()

})
test("verifyPasswordAndCreateJWT erfolgreich",async()=>{
let jwtString =await verifyPasswordAndCreateJWT("Levent","LEVENThallo123!")
    expect(jwtString).toBeDefined()
    if(jwtString&&secret){
        let decoder=verify(jwtString,secret)
        expect(decoder).toHaveProperty("sub")
        expect(decoder).toHaveProperty("role")
    }
})
test("verifyPasswordAndCreateJWT loign fehlgeschlagen",async ()=>{
    await expect(verifyPasswordAndCreateJWT("Kenno","nshshhSHsdba123!")).rejects.toThrow("login fehlgeschlagen")
})
test("verifyPasswordAndCreateJWT variablen nicht gesetzt ",async ()=>{
    process.env.JWT_SECRET = "";
await expect(verifyPasswordAndCreateJWT("Levent","LEVENThallo123!")).rejects.toThrow("variablen nicht gesetzt")
})




