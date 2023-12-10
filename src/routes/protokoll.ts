import express from "express";
import { getAlleEintraege } from "../services/EintragService";
import { createProtokoll, deleteProtokoll, getAlleProtokolle, getProtokoll, updateProtokoll } from "../services/ProtokollService";
import { ProtokollResource } from "../Resources";
import { Types } from "mongoose";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";
import { Protokoll } from "../model/ProtokollModel";


export const protokollRouter = express.Router();

protokollRouter.get("/:id/eintraege", optionalAuthentication,param("id").isMongoId(), async (req, res, next) => {
    let error = validationResult(req)
    if (!error.isEmpty()) {
        res.status(400).json({ errors: error.array() })
    }
    const id = req.params!.id;
    try {
        const eintraege = await getAlleEintraege(id);
        res.send(eintraege); // 200 by default
    } catch (err) {
        res.status(404); // not found
        next(err);
    }
})

protokollRouter.get("/alle",optionalAuthentication, async (req, res, next) => {
    try {
        let protkoll = await getAlleProtokolle();
        res.status(200).send(protkoll);
    }
    catch (err) {
        res.status(400)
    }
})


protokollRouter.get("/:id",optionalAuthentication, param("id").isMongoId(), async (req, res, next) => {
    let id = req.params!.id
    let error = validationResult(req)
    if (!error.isEmpty()) {
        res.status(400).json({ errors: error.array() })
    }

    try {
        let protokoll = await getProtokoll(id);
        if(protokoll.public===false && protokoll.ersteller!==req.pflegerId){
            res.sendStatus(401).send("dieses protokoll ist nicht öffentlich")
        }
        res.status(200).send(protokoll); // 200->OK
    } catch (err) {
        res.status(400); //Resource gibt es nicht
        next(err);
    }
})

protokollRouter.post("/",requiresAuthentication,
    body("patient").isString().isLength({ min: 1, max: 100 }),
    body("public").optional().isBoolean(),
    body("closed").optional().isBoolean(),
    body("ersteller").isMongoId(),
    body("datum").isString().isLength({ min: 1, max: 100 }),
    body("erstellerName").optional().isString().isLength({min:1,max:100}),
    body("updatedAt").optional().isString().isLength({ min: 1, max: 100 }),
    body("gesamtMenge").optional().isNumeric()
    , async (req, res, next) => {
        let error = validationResult(req)
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        }
        try {
            let protokoll = matchedData(req) as ProtokollResource
            let erstelltesProtokoll = await createProtokoll(protokoll)
            res.status(201).send(erstelltesProtokoll)
        }
        catch (err) {
            res.status(400)
            next(err)
        }

    })

protokollRouter.put("/:id",requiresAuthentication,
    body("id").isMongoId(),
    param("id").isMongoId(),
    body("patient").isString().isLength({ min: 1, max: 100 }),
    body("public").optional().isBoolean(),
    body("closed").optional().isBoolean(),
    body("ersteller").isMongoId(),
    body("datum").isString().isLength({ min: 1, max: 100 }), //Wegen stringToDate in service kein isDate?
    body("erstellerName").optional().isString().isLength({min:1,max:100}),
    body("updatedAt").optional().isString().isLength({ min: 1, max: 100 }),
    body("gesamtMenge").optional().isNumeric()
    , async (req, res, next) => {
        let error = validationResult(req)
        
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        }

        let id = req.params!.id;
        let body = req.body.id 
        let erstellerID=req.body.ersteller
        const errors = [
            {
                msg: "params id und body id ungleich",
                path: "id",
                location: "params",
                value: id
            },
            {
                msg: "params id und body id ungleich",
                path: "id",
                location: "body",
                value: body
            }
        ];
        if(id!==body){
            res.sendStatus(400).json({errors})
        }
        //Aufgabe:Ein Protokoll darf nur vom Ersteller geupdatet werden
        if (erstellerID!== req.pflegerId) {
            return res.status(403).send("du darfst dich nur selber updaten");
        }

        try {
            let protokollRes = matchedData(req) as ProtokollResource
            let updatet = await updateProtokoll(protokollRes)
            res.status(200).send(updatet)
        }
        catch (err) {
            res.status(400)
            next(err)
        }
    })



protokollRouter.delete("/:id",requiresAuthentication, param("id").isMongoId(), async (req, res, next) => {
    let id = req.params!.id
    let error = validationResult(req)
    if (!error.isEmpty()) {
        res.status(400).json({ errors: error.array() })
    }
    //Aufgabe:Ein Protokoll darf nur vom Ersteller gelöscht werden
    try {
        //protokoll suchen und ersteller raus holen um ihn zu vergelichen weil er sich nur selber löschend darf
        let protokoll=await getProtokoll(id)
        if(protokoll.ersteller!==req.pflegerId){
            return res.sendStatus(403).send("Du darfst nur eigene protokolle löschen")
        }
        let status = await deleteProtokoll(id)
        res.status(204).send(status) //Keine rückmeldung
    }
    catch (err) {
        res.status(400)
        next(err)
    }
})
