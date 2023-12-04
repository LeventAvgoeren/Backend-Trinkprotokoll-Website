import { HydratedDocument, Types } from "mongoose";
import { createEintrag, deleteEintrag, getAlleEintraege, getEintrag, updateEintrag } from "../../src/services/EintragService"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel"
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { EintragResource } from "../../src/Resources";
import { dateToString } from "../../src/services/ServiceHelper";

let pfleger1:HydratedDocument<IPfleger>
let pfleger2:HydratedDocument<IPfleger>
let protokoll1:HydratedDocument<IProtokoll>
let protokoll2:HydratedDocument<IProtokoll>
let protokoll3:HydratedDocument<IProtokoll>
let eintrag :HydratedDocument<IEintrag>
let eintrag2 :HydratedDocument<IEintrag>
beforeEach(async()=>{
    pfleger1=await Pfleger.create({name:"Levent",password:"Hallo123"})
    await pfleger1.save()
    pfleger2=await Pfleger.create({name:"Hanz",password:"Welt123"})
    await pfleger2.save()
    protokoll1=await Protokoll.create({patient:"Levent",datum:new Date,ersteller:pfleger1.id,erstellerName:pfleger1.name})
    await protokoll1.save();
    protokoll2=await Protokoll.create({patient:"Peter",datum:new Date,ersteller:pfleger2.id,erstellerName:pfleger2.name})
    await protokoll1.save();
    protokoll3=await Protokoll.create({patient:"Anna",datum:new Date,ersteller:pfleger2.id,erstellerName:pfleger2.name,closed:true})
    await protokoll3.save()
     eintrag = await Eintrag.create({
        getraenk:"Cola",
        menge:200,
        kommentar:"Zu wenig wasser",
        ersteller:protokoll1.ersteller,
        erstellerName:pfleger1.name,
        protokoll:protokoll1.id
    })
    await eintrag.save()
    eintrag2 = await Eintrag.create({
        getraenk:"Cola",
        menge:200,
        kommentar:"Zu wenig wasser",
        ersteller:protokoll2.ersteller,
        erstellerName:pfleger2.name,
        protokoll:protokoll1.id
    })
    await eintrag2.save()
})
test("get Eintrag ohne id",async ()=>{
    await expect(getEintrag("")).rejects.toThrow("keine id eingegeben");

})
test("get Eintrag id nicht gefunden",async ()=>{
    let falscheId = new Types.ObjectId().toString()
    await expect(getEintrag(falscheId)).rejects.toThrow("kein eintrag mit dieser id gefunden");
})
test("get eintrag",async ()=>{
    let result= await getEintrag(eintrag.id)
    expect(result.getraenk).toBe("Cola")
    expect(result.protokoll).toBe(protokoll1.id)
    expect(result.menge).toBe(200)
    expect(result.kommentar).toBe(eintrag.kommentar)
    expect(result.ersteller).toBe(protokoll1.ersteller.toString())
    expect(result.erstellerName).toBe(pfleger1.name)
    expect(result.protokoll).toBe(protokoll1.id)
})
test("getEintrag pflger nicht gefunden",async ()=>{

})
test("getEintrag protkoll nixht gefunden",async ()=>{

})

test("deleteEintrag id nicht eingegeben", async ()=>{
    await expect(deleteEintrag("")).rejects.toThrow("id nicht eingegeben");
})

test("deleteEintrag id nicht eingegeben", async ()=>{
    let falscheId = new Types.ObjectId().toString()
    await expect(deleteEintrag(falscheId)).rejects.toThrow("keine gültige id gefunden konnte nicht gelöscht werden");
})

test("deleteEintrag id nicht eingegeben", async ()=>{
    let result=await deleteEintrag(eintrag.id)
    expect(result).not.toBeDefined()
})
test("getAlleEintraege", async ()=>{
let result=await getAlleEintraege(protokoll1.id)
expect(result.length).toBe(2)
})


test("getAlleEintraege Protokoll nicht gefunden",async ()=>{
    await expect(getAlleEintraege("")).rejects.toThrow("Keine protokolId eingegeben")
})
test("getAlleEintraege protokolle nicht gefunden",async ()=>{
    let falscheid= new Types.ObjectId().toString()
    await expect(getAlleEintraege(falscheid)).rejects.toThrow("protokoll nicht gefunden")
})
test("deleteEintrag id nicht angegeben",async ()=>{
    await expect(deleteEintrag("")).rejects.toThrow("id nicht eingegeben")
})
test("createEintrag mit getEintrag konsitent prüfen ",async ()=>{
    let ein
let eintrag=await createEintrag({
    getraenk:"Cola",
    menge:200,
    kommentar:"Zu wenig wasser",
    ersteller:pfleger1.id,
    erstellerName:pfleger1.name,
    protokoll:protokoll1.id
})
expect(eintrag.getraenk).toBe("Cola")
expect(eintrag.menge).toBe(200)
expect(eintrag.kommentar).toBe("Zu wenig wasser")
expect(eintrag.ersteller).toBe(pfleger1.id)
expect(eintrag.erstellerName).toBe(pfleger1.name)
expect(eintrag.protokoll).toBe(protokoll1.id)

ein=await getEintrag(eintrag.id!)
expect(ein.getraenk).toBe("Cola")
expect(ein.menge).toBe(200)
expect(ein.kommentar).toBe("Zu wenig wasser")
expect(ein.ersteller).toBe(pfleger1.id)
})

test("updateEintrag mit getEintrag konsitent prüfen ",async ()=>{
    let eintrag=await createEintrag({
        id:eintrag2.id,
        getraenk:"Fanta",
        menge:400,
        kommentar:"Genug getrunken",
        ersteller:pfleger2.id,
        erstellerName:pfleger2.name,
        protokoll:protokoll2.id
    })
    let eintragUpdate=await updateEintrag(eintrag)
    expect(eintragUpdate.getraenk).toBe("Fanta")
    expect(eintragUpdate.menge).toBe(400)
    expect(eintragUpdate.kommentar).toBe("Genug getrunken")
    expect(eintragUpdate.ersteller).toBe(pfleger2.id)
    expect(eintragUpdate.erstellerName).toBe(pfleger2.name)
    expect(eintragUpdate.protokoll).toBe(protokoll2.id)
})

test("deleteEintrag falche id ",async ()=>{
    let falscheid= new Types.ObjectId().toString()
    await expect(deleteEintrag(falscheid)).rejects.toThrow("keine gültige id gefunden konnte nicht gelöscht werden")
})
// test("update",async ()=>{
//     let falscheId=new Types.ObjectId().toString()
//     let eintrag:EintragResource=({
//         id:eintrag2.id,
//         getraenk:"Fanta",
//         menge:400,
//         kommentar:"Genug getrunken",
//         ersteller:falscheId,
//         erstellerName:pfleger1.name,
//         protokoll:protokoll1.id
//     })
    
//     await expect(updateEintrag(eintrag)).rejects.toThrow("pfleger nicht gefunden ")

// })

test("update",async ()=>{
    let falscheId=new Types.ObjectId().toString()
    let eintrag:EintragResource=({
        id:falscheId,
        getraenk:"Fanta",
        menge:400,
        kommentar:"Genug getrunken",
        ersteller:pfleger1.id,
        erstellerName:pfleger1.name,
        protokoll:protokoll1.id
    })
    
    await expect(updateEintrag(eintrag)).rejects.toThrow("eintrag mit dieser id nicht gefunden")

})
// test("update",async ()=>{
//     let falscheId=new Types.ObjectId().toString()
//     let eintrag:EintragResource=({
//         id:eintrag2.id,
//         getraenk:"Fanta",
//         menge:400,
//         kommentar:"Genug getrunken",
//         ersteller:pfleger1.id,
//         erstellerName:pfleger1.name,
//         protokoll:falscheId
//     })
    
//     await expect(updateEintrag(eintrag)).rejects.toThrow("protkoll nicht gefunden ")

// })
test("createEintrag",async ()=>{
    let falscheId=new Types.ObjectId().toString()
    let aktuellesDatum = new Date();
    let datum = dateToString(aktuellesDatum);
    let created:EintragResource=({
        getraenk: "Lidl",
        menge: 21,
        kommentar: "Hol mich hier raus",
        ersteller:pfleger1.id,
        erstellerName: pfleger1.name,
        createdAt: datum,
        protokoll:protokoll1.id 
    })
let eintrag= await createEintrag(created)
expect(eintrag.getraenk).toBe("Lidl")
expect(eintrag.menge).toBe(21)
expect(eintrag.kommentar).toBe("Hol mich hier raus")
expect(eintrag.ersteller).toBe(pfleger1.id)
expect(eintrag.erstellerName).toBe(pfleger1.name)
expect(eintrag.protokoll).toBe(protokoll1.id)
})
test("createEintrag Protokoll nicht gefunden",async ()=>{
    let falscheId=new Types.ObjectId().toString()
    let aktuellesDatum = new Date();
    let datum = dateToString(aktuellesDatum);
    let created:EintragResource=({
        getraenk: "Lidl",
        menge: 21,
        kommentar: "Hol mich hier raus",
        ersteller:pfleger1.id,
        erstellerName: pfleger1.name,
        createdAt: datum,
        protokoll:falscheId
    })
    await expect(createEintrag(created)).rejects.toThrow(`No protokoll found with id ${created.protokoll}`)

})
test("createEintrag Eintrag nicht gefunden ",async ()=>{
    let falscheId=new Types.ObjectId().toString()
    let aktuellesDatum = new Date();
    let datum = dateToString(aktuellesDatum);
    let created:EintragResource=({
        getraenk: "Lidl",
        menge: 21,
        kommentar: "Hol mich hier raus",
        ersteller:falscheId,
        erstellerName: pfleger1.name,
        createdAt: datum,
        protokoll:falscheId
    })
    await expect(createEintrag(created)).rejects.toThrow(`No pfleger found with id ${created.ersteller}`)

})
test("createEintrag pfleger nicht gefunden ",async ()=>{
    let aktuellesDatum = new Date();
    let datum = dateToString(aktuellesDatum);
    let created:EintragResource=({
        getraenk: "Lidl",
        menge: 21,
        kommentar: "Hol mich hier raus",
        ersteller:pfleger1.id,
        erstellerName: pfleger1.name,
        createdAt: datum,
        protokoll:protokoll3.id
    })
    await expect(createEintrag(created)).rejects.toThrow(`Protokoll ${created.protokoll} is already closed`)
})
test("updateEintrag",async ()=>{
    let eintrag=await updateEintrag({
        id:eintrag2.id,
        getraenk:"Fanta",
        menge:400,
        kommentar:"Genug getrunken",
        ersteller:pfleger1.id,
        erstellerName:"Kenno",
        protokoll:protokoll2.id
    })
    expect(eintrag.erstellerName).toBe(pfleger2.name)
    expect(eintrag.erstellerName).not.toBe("Kenno")
    expect(eintrag.ersteller).toBe(pfleger2.id)
})
/*
test("updatetEintrag ohne ressource ",async ()=>{
    await expect(updateEintrag(null!)).rejects.toThrow("keine eingabe");
})
*/
