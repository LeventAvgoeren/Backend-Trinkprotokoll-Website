import express from "express";
import { createEintrag, deleteEintrag, getAlleEintraege, getEintrag, updateEintrag } from "../services/EintragService";
import { EintragResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";

export const eintragRouter = express.Router();

eintragRouter.get("/:id",param("id").isMongoId(), async (req, res, next) => {
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

eintragRouter.post("/",
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

eintragRouter.put("/:id",
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
        let body = req.body.id as EintragResource
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
        if (id !== body) {
            return res.status(400).json({ errors });
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
    
eintragRouter.delete("/:id",param("id").isMongoId(), async (req, res, next) => {
    let id = req.params!.id
     let error=validationResult(req)
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })//testen
        }
    try {
        let deleted = await deleteEintrag(id)
        res.status(204).send(deleted) //Keine rückmeldung
    }
    catch (err) {
        res.status(400).send(err)
        next(err)
    }
})
