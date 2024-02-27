import express from "express";
import { createEintrag, deleteEintrag, getAlleEintraege, getEintrag, updateEintrag } from "../services/EintragService";
import { EintragResource, LoginResource } from "../Resources";
import { body, cookie, matchedData, param, validationResult } from "express-validator";
import { login } from "../services/AuthenticationService";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../services/JWTService";
import { optionalAuthentication, requiresAuthentication } from "./authentication";

export const loginRouter = express.Router();

loginRouter.post("/",
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("password").isString().isLength({ min: 1, max: 100 }).isStrongPassword()
    , async (req, res, next) => {
        const time = process.env.JWT_TTL //300 sekunden

        let error = validationResult(req)
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        }
        try {
            let log = matchedData(req) 
            let createJWT = await verifyPasswordAndCreateJWT(log.name,log.password)
            let verif=verifyJWT(createJWT)
            //Vom professor hilfe bekommen wegen exp
            //Hier *1000
            res.cookie("access_token", createJWT, {httpOnly: true,secure:true,sameSite:"none",expires:new Date(Date.now()+3600000
            )})
            res.status(201).send(verif)
        }
        catch (err) {
            res.sendStatus(401) 
        }
    })

loginRouter.get("/", async (req, res, next) => {
    try {
        const jwtString = req.cookies.access_token;

        if(!jwtString){
            res.status(200).send(false);
            return;
        }
        let verifyt=verifyJWT(jwtString)
        res.status(200).send(verifyt)
    }
    catch (err) {
        //nochmal nach gucken 
        res.clearCookie("access_token",{
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
            expires: new Date(0)
        });
        res.status(200).send(false)
    }
})

loginRouter.delete("/", async (req, res,next) => {
        //const jwtString = req.cookies.access_token;
        res.clearCookie("access_token",{
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
            expires: new Date(0)
        });        
        res.sendStatus(204)
})
// loginRouter.delete("/", async (req, res,next) => {
//     //const jwtString = req.cookies.access_token;
//     res.clearCookie('access_token')
//     res.sendStatus(204)
// })