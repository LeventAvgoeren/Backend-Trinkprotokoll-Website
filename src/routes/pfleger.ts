import express from "express";
import { getAlleEintraege } from "../services/EintragService";
import { createPfleger, deletePfleger, getAllePfleger, updatePfleger } from "../services/PflegerService";
import { PflegerResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { getAlleProtokolle } from "../services/ProtokollService";
import { optionalAuthentication, requiresAuthentication } from "./authentication";


export const pflegerRouter = express.Router();

pflegerRouter.get("/alle", optionalAuthentication,async (req, res, next) => {
    let pflegerRolle=req.role
    if(pflegerRolle===`u`){
        res.send(401)
    }
    try {
        let pfleger = await getAllePfleger();
        res.status(200).send(pfleger); // 200->OK
    }
    catch (err) {
        res.status(400)
    }
})

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
        let pflegerRolle=req.role
        if(pflegerRolle===`u`){
            res.send(401)
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
        let pflegerRolle=req.role
        if(pflegerRolle===`u`){
            res.send(401)
        }
        const id = req.params!.id;
        let body = req.body.id 
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
        //Body und params nicht die selbe
        if(id!==body){
            res.status(400).json({errors})
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
    //Selber löschen darf nicht passieren wenn admin
    let id = req.params!.id
    let error= validationResult(req)
    if (!error.isEmpty()) {
        res.status(400).json({ errors: error.array() })
    }
    let pflegerRolle=req.role
    if(pflegerRolle===`u`){
        res.send(401)
    }
    try {
        if(id===req.pflegerId){
            res.sendStatus(403).send("du darfst dich nicht selber löschen")
        }
        let status = await deletePfleger(id)
        res.status(204).send(status)
    }
    catch (err) {
        res.status(400)
        next(err)
    }
})