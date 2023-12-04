import { HydratedDocument, Types } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import { createPfleger, deletePfleger, getAllePfleger, updatePfleger } from "../../src/services/PflegerService";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
let pflegerLevent: HydratedDocument<IPfleger>
let pflegerHanz: HydratedDocument<IPfleger>
let pflegerPeter: HydratedDocument<IPfleger>
let protkollLevent: HydratedDocument<IProtokoll>
let eintrag :HydratedDocument<IEintrag>
let protkollFake:HydratedDocument<IProtokoll>

beforeEach(async () => {
    pflegerLevent = await Pfleger.create({ name: "Levent", password: "Hallo123", admin: true })
    await pflegerLevent.save()
    pflegerHanz = await Pfleger.create({ name: "Hanz", password: "Welt123" })
    await pflegerHanz.save()
    // kevin =await createPfleger({name:"Kevin",admin:false,password:"asdf123"})
    pflegerPeter = await Pfleger.create({ name: "Peter", password: "qwe123" })

    protkollLevent = await Protokoll.create({
        patient: "levent",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: pflegerLevent.id,
        erstellerName: pflegerLevent.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })
    await protkollLevent.save()

    eintrag = await Eintrag.create({
        getraenk:"Cola",
        menge:200,
        kommentar:"Zu wenig wasser",
        ersteller:pflegerLevent.id,
        erstellerName:pflegerLevent.name,
        protokoll:protkollLevent.id
    })
    await eintrag.save()

    let falscheid=new Types.ObjectId()
    protkollFake = await Protokoll.create({
        id:pflegerLevent.id,
        patient: "levent",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: falscheid,
        erstellerName: pflegerLevent.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })
    await protkollFake.save()

})

test("kein passwort enthalten", async () => {
    let pfleger = await getAllePfleger()
    expect(pfleger).not.toHaveProperty("password")
    expect(pfleger.length).toBeGreaterThan(2)
});

test("Pfleger erstellen", async () => {
    let pfleger = {
        id:pflegerLevent.id,
        name: "levent",
        admin: true,
        password: "esel123"
    }
    let result = createPfleger(pfleger);
    expect(result).not.toHaveProperty("password")
});

test("Keine rückgabe es passworts", async () => {
    let updatetPfleger = {
        id: pflegerLevent.id,
        name: "pipi",
        admin: true,
        password: "esel123"
    }
    let result = await updatePfleger(updatetPfleger)
    expect(result).not.toHaveProperty("password")
    expect(result.name).toBe("pipi")
    expect(result.admin).toBeTruthy()
});


test("ID wird nicht gefunden", async () => {
    let updatetPfleger = {
        id: undefined,
        name: "Levent",
        admin: true,
        password:"HalloWelt"
    }
     await expect(updatePfleger(updatetPfleger)).rejects.toThrow("pfleger id nicht gefunden");
});

test("pfleger löschen",async ()=>{
    await deletePfleger(pflegerLevent.id)
    expect(await Protokoll.findOne({ersteller:pflegerLevent.id})).toBeNull()
    expect(await Eintrag.findOne({ersteller:pflegerLevent.id})).toBeNull()
    expect(await Pfleger.findOne({id:pflegerLevent.id})).toBeNull()
})
test("deletePfleger id nicht gefunden ",async ()=>{
    let falscheId=new Types.ObjectId()
    await expect(deletePfleger(falscheId.toString())).rejects.toThrow("pfleger id nicht gefunden");

})
test("deletePfleger id nicht eingegeben",async ()=>{
    await expect(deletePfleger("")).rejects.toThrow("pfleger id eingeben");
})

