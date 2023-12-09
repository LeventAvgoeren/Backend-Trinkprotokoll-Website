import express from "express";
import { getAlleEintraege } from "../services/EintragService";
import { createPfleger, deletePfleger, getAllePfleger, updatePfleger } from "../services/PflegerService";
import { PflegerResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { getAlleProtokolle } from "../services/ProtokollService";
import { optionalAuthentication, requiresAuthentication } from "./authentication";


export const pflegerRouter = express.Router();

pflegerRouter.get("/alle", optionalAuthentication,async (req, res, next) => {
    try {
        let pfleger = await getAllePfleger();
        res.status(200).send(pfleger); // 200->OK
    }
    catch (err) {
        res.status(400)
    }
})

//TODO:VALIDIEREN
pflegerRouter.post("/",requiresAuthentication,
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("admin").optional().isBoolean(),
    body("password").isString().isStrongPassword().isLength({ min: 1, max: 100 }),
    async (req, res, next) => {
        //packen alle fehler in error und gucken dann ob es fehler gab 
        let error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        }

        try {
            //Wenn es keine fehler gab werden alle validierten felder in ein objekt gepackt 
            let pfleger = matchedData(req) as PflegerResource
            let erstellterPfleger = await createPfleger(pfleger)
            res.status(201).send(erstellterPfleger) //201 Created
        }
        catch (err) {
            res.status(400) //Anfrage ist fehlerhaft
            next(err)
        }
    })
    
//TODO:VALIDIEREN
pflegerRouter.put("/:id",requiresAuthentication,
    body("id").isMongoId(),
    param("id").isMongoId(),
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("admin").isBoolean(),
    body("password").optional().isString().isStrongPassword().isLength({ min: 1, max: 100 }),
    async (req, res, next) => {
        let error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        }
        const id = req.params!.id;
        let body = req.body.id as PflegerResource
        const errors = [
            {
                msg: "params id ungleich zu body id",
                path: "id",
                location: "params",
                value: id
            },
            {
                msg: "body id ungleich zu params id",
                path: "id",
                location: "body",
                value: body
            }
        ];
        if (id !== req.pflegerId) {
            return res.status(400).json({ errors });
        }
    
        try {
            let pflegerResource = matchedData(req) as PflegerResource
            let updatet = await updatePfleger(pflegerResource)
            res.status(200).send(updatet)

        }
        catch (err) {
            res.status(400)
            next(err)
        }
    })

pflegerRouter.delete("/:id",requiresAuthentication,param("id").isMongoId(), async (req, res, next) => {
    let id = req.params!.id
    let error= validationResult(req)
    if (!error.isEmpty()) {
        res.status(400).json({ errors: error.array() })
    }
    try {
        let status = await deletePfleger(id)
        res.status(204).send(status)
    }
    catch (err) {
        res.status(400)
        next(err)
    }
})