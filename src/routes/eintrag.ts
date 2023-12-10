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
        //Wenn protokoll public dann darf man es sehen 
        //Wenn es private ist dann kann es nur der erzeuger sehen 
        let eintrag = await getEintrag(id) 
        let proto= eintrag.protokoll
        let protkoll= await getProtokoll(proto)
        if((!protkoll.public && (eintrag.ersteller===req.pflegerId||protkoll.ersteller===req.pflegerId))||(protkoll.public===true)){
            res.status(200).send(eintrag);
        }
        else{
            res.sendStatus(403)
            next()
        }
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
            //if req.pflegerId ersteller des Eintrags ist oder das protokol public ist 
            let protokoll=await getProtokoll(req.body.protokoll)
            if(req.pflegerId===protokoll.ersteller||protokoll.public===true){
                let eintrag = matchedData(req) as EintragResource
                let erstellterEintrag = await createEintrag(eintrag)
                res.status(201).send(erstellterEintrag) //201 Created
            }
            else{
                res.sendStatus(403)
                next()
            }
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
            return res.status(400).json({ errors: error.array() })
        }
        const id = req.params!.id;
        let body = req.body.id 
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
           return res.sendStatus(400).json({errors})
        }
        try {
            let eintrage=await getEintrag(id)
            let protokoll=await getProtokoll(eintrage.protokoll)
            //if(req.pflegerId===(eintrage.ersteller||protokoll.ersteller))
            if (req.pflegerId === eintrage.ersteller || req.pflegerId === protokoll.ersteller){
                let eintrag = matchedData(req) as EintragResource
                let updatet = await updateEintrag(eintrag)
                res.status(200).send(updatet)
            }
            else{
                res.sendStatus(403)
                next()
            }

        }
        catch (err) {
            res.status(400)
            next(err)
        }
    })
    
eintragRouter.delete("/:id",requiresAuthentication,param("id").isMongoId(), async (req, res, next) => {
    let id = req.params!.id
     let error=validationResult(req)
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })//testen
        }
    try {
        let eintrag=await getEintrag(id)
        //if(eintrag.ersteller === protokoll.ersteller(pflegerId)||eintrag.ersteller===eintrag.ersteller)
        let protokoll=await getProtokoll(eintrag.protokoll)
        //Rollenspiel siehe screenshot
        if (req.pflegerId === eintrag.ersteller || req.pflegerId === protokoll.ersteller) {
            let deleted = await deleteEintrag(id)
            res.status(204).send(deleted) //Keine rückmeldung
        }
        else{
            res.sendStatus(403)
            next()
        }
    }
    catch (err) {
        res.status(400).send(err)
        next(err)
    }
})
