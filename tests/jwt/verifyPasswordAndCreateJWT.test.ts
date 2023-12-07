import dotenv from "dotenv"
dotenv.config()
import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/services/JWTService"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import { HydratedDocument } from "mongoose"
import {JsonWebTokenError, verify }from "jsonwebtoken";

let leventLogin:HydratedDocument<IPfleger>
let secret=process.env.JWT_SECRET;
beforeEach(async () => {
    leventLogin=await Pfleger.create({name:"Levent",password:"LEVENThallo123!",admin:true})
    await leventLogin.save()

})

test(" verifyJWT secret nicht gesetzt ",async()=>{
    let jwtString= await verifyPasswordAndCreateJWT("Levent","LEVENThallo123!")
    process.env.JWT_SECRET = "";
    try{
        verifyJWT(jwtString)
    }
    catch(err){
        expect(err).toStrictEqual(new Error("variablen nicht gesetzt"))
    }

})

test(" verifyJWT kein string",()=>{
    process.env.JWT_SECRET = "LEVENTSgeheimnis21!";

    expect(()=>verifyJWT("")).toThrow("jwt ist kein string")
        //expect(String(err)).toBe("Error: jwt ist kein string")
       // expect(err).toStrictEqual(new Error("jwt ist kein string"))

    

})

test(" verifyJWT erfolgreich",async()=>{
    let jwtString= await verifyPasswordAndCreateJWT("Levent","LEVENThallo123!")
        let result=verifyJWT(jwtString)
        expect(result).toBeDefined()
        expect(result).toHaveProperty("id")
        expect(result).toHaveProperty("role")
        expect(result).toHaveProperty("exp")
})

test(" verifyJWT catch",()=>{
    let jwtString="noObject"
    jwtString="keinRichtigerJWtString"
    try{
        verifyJWT(jwtString)
    }
    catch(err){
    expect(err).toStrictEqual(new JsonWebTokenError("jwt malformed"))
    }
})

