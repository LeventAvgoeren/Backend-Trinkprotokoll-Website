import express from "express";
import { createEintrag, deleteEintrag, getAlleEintraege, getEintrag, updateEintrag } from "../services/EintragService";
import { EintragResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";
import { getProtokoll } from "../services/ProtokollService";

export const eintragRouter = express.Router();

eintragRouter.get("/:id",optionalAuthentication,param("id").isMongoId(), async (req, res, next) => {
    let id = req.params!.id
    let error=validationResult(req)
    if (!error.isEmpty()) {
        res.status(400).json({ errors: error.array() })//testen
    }
    try {
        let eintrag = await getEintrag(id);
        res.status(200).send(eintrag); // 200->OK
    } catch (err) {
        res.status(400); //Resource gibt es nicht
        next(err);
    }
})

eintragRouter.post("/",requiresAuthentication,
    body("getraenk").isString().isLength({ min: 1, max: 100 }),
    body("menge").isNumeric(),
    body("kommentar").optional().isString().isLength({ min: 1, max: 1000 }),
    body("ersteller").isMongoId(),
    body("protokoll").isMongoId(),
    body("erstellerName").optional().isString().isLength({min:1,max:100}),
    body("createdAt").optional().isString().isLength({min:1,max:100})
    , async (req, res, next) => {
        let error=validationResult(req)
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        }
        try {
            let eintrag = matchedData(req) as EintragResource
            let erstellterEintrag = await createEintrag(eintrag)
            res.status(201).send(erstellterEintrag) //201 Created
        }
        catch (err) {
            res.status(400) //Anfrage ist fehlerhaft
            next(err)
        }
    })

eintragRouter.put("/:id",requiresAuthentication,
    body("id").isMongoId(),
    param("id").isMongoId(),
    body("getraenk").isString().isLength({ min: 1, max: 100 }),
    body("menge").isNumeric(),
    body("kommentar").optional().isString().isLength({ min: 1, max: 1000 }),
    body("ersteller").isMongoId(),
    body("protokoll").isMongoId(),
    body("erstellerName").optional().isString().isLength({ min: 1, max: 100 }),
    body("createdAt").optional().isString().isLength({ min: 1, max: 100 })
    , async (req, res, next) => {
        let error=validationResult(req)
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        }
        const id = req.params!.id;
        let body = req.body.id 
        let ersteller=req.body.ersteller
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
        if (ersteller!== req.pflegerId) {
            return res.status(400).send("Inkonsitente ids")
        }
        try {
            let eintrag = matchedData(req) as EintragResource
            let updatet = await updateEintrag(eintrag)
            res.status(200).send(updatet)

        }
        catch (err) {
            res.status(400)
            next(err)
        }
    })
    
eintragRouter.delete("/:id",requiresAuthentication,param("id").isMongoId(), async (req, res, next) => {
    // //Ein Eintrag darf nur vom Ersteller des Protokolls (in dem der Eintrag ist) oder 
    // (falls davon abweichend) dem Ersteller des Eintrags selbst verändert oder 
    // gelöscht werden. 
    let id = req.params!.id
     let error=validationResult(req)
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })//testen
        }
    try {
        let eintrag=await getEintrag(id)
        //if(eintrag.ersteller === protokoll.ersteller(pflegerId)||eintrag.ersteller===eintrag.ersteller)
        let protokoll=await getProtokoll(eintrag.protokoll)
        if(eintrag.ersteller!==protokoll.ersteller||eintrag.ersteller!==req.pflegerId){
            res.sendStatus(401)
        }
        let deleted = await deleteEintrag(id)
        res.status(204).send(deleted) //Keine rückmeldung
    }
    catch (err) {
        res.status(400).send(err)
        next(err)
    }
})
