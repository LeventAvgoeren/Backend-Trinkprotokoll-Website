import express from "express";
import { createEintrag, deleteEintrag, getAlleEintraege, getEintrag, updateEintrag } from "../services/EintragService";
import { EintragResource, LoginResource } from "../Resources";
import { body, cookie, matchedData, param, validationResult } from "express-validator";
import { login } from "../services/AuthenticationService";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../services/JWTService";

export const loginRouter = express.Router();

loginRouter.post("/",
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("password").isString().isLength({ min: 1, max: 100 }).isStrongPassword()
    , async (req, res, next) => {
        const time = process.env.JWT_TTL //300 sekunden

        let error = validationResult(req)
        if (!error.isEmpty) {
            res.status(400).json({ errors: error.array() })
        }
        try {
            let log = matchedData(req) 
            let createJWT = await verifyPasswordAndCreateJWT(log.name,log.password)
            //Vom professor hilfe bekommen wegen exp
            res.cookie("access_token", createJWT, {httpOnly: true,secure:true,sameSite:"none",expires:log.exp+300})
            res.sendStatus(201).send(createJWT)
        }
        catch (err) {
            res.sendStatus(400)
            next(err)
        }
    })

loginRouter.get("/", async (req, res, next) => {
    try {
        const jwtString = req.cookies.access.token(req)

        if(!jwtString){
            res.sendStatus(400).send(false)
        }
        let verifyt=verifyJWT(jwtString)
        res.sendStatus(200).send(verifyt)
    }
    catch (err) {
        //nochmal nach gucken 
        res.clearCookie('access_token')
        res.sendStatus(400).send(false)
        next(err)
    }
})

loginRouter.delete("/", async (req, res,) => {
     res.clearCookie("access_token")
     res.sendStatus(204)
})