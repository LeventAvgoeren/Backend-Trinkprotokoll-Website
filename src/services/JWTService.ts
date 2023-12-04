import { LoginResource } from "../Resources";
import { Pfleger } from "../model/PflegerModel";
import { login } from "./AuthenticationService";
import { JwtPayload, sign, verify }
    from "jsonwebtoken";
export async function verifyPasswordAndCreateJWT(name: string, password: string): Promise<string | undefined> {
    //geheimnis aus .env holen und nach gucken ob es gesetzt wurde 
    const secret = process.env.JWT_SECRET;
    const time = process.env.JWT_TTL //300 sekunden
    if (!secret) {
        throw Error("secret nicht gesetzt")
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
        {
            expiresIn: time,
            algorithm: `HS256`
        });

    return jwtString
}


export function verifyJWT(jwtString: string | undefined): LoginResource {
    throw new Error("Function verifyJWT not implemented yet")
}
