import { LoginResource } from "../Resources";
import { Pfleger } from "../model/PflegerModel";
import { login } from "./AuthenticationService";
import { JsonWebTokenError, JwtPayload, sign, verify }
    from "jsonwebtoken";

export async function verifyPasswordAndCreateJWT(name: string, password: string): Promise<string | undefined> {
    //geheimnis aus .env holen und nach gucken ob es gesetzt wurde 
    const secret = process.env.JWT_SECRET;
    let time = process.env.JWT_TTL 
    let newTime
   if(time!==undefined){
    newTime=parseInt(time)*1000
   }
    
    if (!secret || !time) {
        throw Error("variablen nicht gesetzt")
    }
    //Gucken ob login klappt 
    let loginfo = await login(name, password)
    if (!loginfo) {
        throw Error("login fehlgeschlagen")
    }

    //payload der standart felder definiert 
    const payload: JwtPayload = {
        sub: loginfo.id,
        role: loginfo.role,
    }
    //erzeugung des JWT mit unterschrift 
    const jwtString = sign(
        payload,
        secret,
        {//*1000
            expiresIn: newTime,
            algorithm: `HS256`
        });

    return jwtString
}


export function verifyJWT(jwtString: string | undefined): LoginResource {
    const secret = process.env.JWT_SECRET;
    const time = process.env.JWT_TTL //300 sekunden
    let holder
    if (!secret || !time) {
        throw  Error("variablen nicht gesetzt")
    }
    if (!jwtString) {
        throw Error("jwt ist kein string")
    }
    try {
        //decodieren des strings 
        let payload = verify(jwtString, secret)
        //Prof bei geholfen payload muss ein objekt sein weil man auf ein string keine attribute aufrufen kann 
        if (payload instanceof Object) {
            let loginRes: LoginResource = {
                id: payload.sub!,
                role: payload.role,
                exp: payload.exp!
            }
            holder=loginRes
        } 
        return holder!
    }
    catch (err) {
        throw err
    }
}
//alte variante else bed konnte man nicht testen
// if (payload instanceof Object) {
//     let loginRes: LoginResource = {
//         id: payload.sub!,
//         role: payload.role,
//         exp: payload.exp!
//     }
//     return loginRes
// } else {
//     throw Error("jwt ist kein objekt")
// }


