import { NextFunction, Request, Response } from "express";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../services/JWTService";

declare global {
    namespace Express {
        export interface Request {
            /**
             * Mongo-ID of currently logged in pfleger; or undefined, if pfleger is a guest.
             */
            pflegerId?: string;
            /**
             * Role of currently logged in pfleger; or undefined, if pfleger is a guest.
             */
            role?: "u" | "a";
        }
    }
}

export function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    req.body.id=undefined
    try{
        let jwtString=req.cookies.access_token
        let pflegerId=verifyJWT(jwtString)
        if(pflegerId){
            req.body.id  =pflegerId.id
            req.body.role=pflegerId.role
        }
        next();
    }
    catch(err){
        res.sendStatus(401)
        next(err)

    }
}

export function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
    req.body.id=undefined
    try{
        let jwtString=req.cookies.access_token
        let pflegerId=verifyJWT(jwtString)
        if(pflegerId){
            if(pflegerId.exp===0){
                res.sendStatus(401)
            }
            req.body.id=pflegerId.id
        }
        next();
    }
    catch(err){
        res.sendStatus(401)
        next(err)

    }
}
