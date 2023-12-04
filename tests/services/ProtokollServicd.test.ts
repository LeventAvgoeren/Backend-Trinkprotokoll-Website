import { HydratedDocument, Types } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import { createPfleger, deletePfleger, getAllePfleger, updatePfleger } from "../../src/services/PflegerService";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { createProtokoll, deleteProtokoll, getAlleProtokolle, getProtokoll, updateProtokoll } from "../../src/services/ProtokollService";
import { ProtokollResource } from "../../src/Resources";
import { dateToString, stringToDate } from "../../src/services/ServiceHelper";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
let pflegerLevent: HydratedDocument<IPfleger>
let pflegerHanz: HydratedDocument<IPfleger>
let pflegerPeter: HydratedDocument<IPfleger>
let pflegerayr: HydratedDocument<IPfleger>
let protkollLevent: HydratedDocument<IProtokoll>
let protkollHanz: HydratedDocument<IProtokoll>
let protkollayr: HydratedDocument<IProtokoll>
let protkollLeventUnde: HydratedDocument<IProtokoll>
let protkollLeventUnde2: HydratedDocument<IProtokoll>
let eintrag :HydratedDocument<IEintrag>
let protkollMenge:HydratedDocument<IProtokoll>
let eintrag2:HydratedDocument<IEintrag>
let eintragaAyr:HydratedDocument<IEintrag>
let eintrag4:HydratedDocument<IEintrag>
let protkollMenge2:HydratedDocument<IProtokoll>
let protkollMenge3:HydratedDocument<IProtokoll>
let protkollMenge4:HydratedDocument<IProtokoll>
beforeEach(async () => {
    pflegerLevent = await Pfleger.create({ name: "Levent", password: "Hallo123", admin: true })
    await pflegerLevent.save()
    pflegerHanz = await Pfleger.create({ name: "Hanz", password: "Welt123" })
    await pflegerHanz.save()
    pflegerPeter = await Pfleger.create({ name: "Peter", password: "qwe123" })
    // kevin =await createPfleger({name:"Kevin",admin:false,password:"asdf123"})
    pflegerayr=await Pfleger.create({ name: "ayr", password: "123" })
    protkollLevent = await Protokoll.create({
        id: pflegerLevent.id,
        patient: "levent",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: pflegerLevent.id,
        erstellerName: pflegerLevent.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })

    protkollayr = await Protokoll.create({
        patient: "levent",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: pflegerayr.id,
        erstellerName: pflegerayr.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })
    await protkollLevent.save()

    let falscheId = new Types.ObjectId();

    protkollLeventUnde = await Protokoll.create({
        patient: "levent",
        datum: new Date(),
        public: true,
        closed: false,
        ersteller: falscheId,
        erstellerName: pflegerLevent.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })

    await protkollLeventUnde.save()

    protkollHanz = await Protokoll.create({
        patient: "peter",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: pflegerPeter.id,
        erstellerName: pflegerHanz.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })



    await protkollHanz.save()

    protkollLeventUnde2 = await Protokoll.create({
        patient: "peter",
        datum: new Date(),
        public: false,
        closed: false,
        ersteller: pflegerLevent.id,
        erstellerName: pflegerHanz.name,
        updatedAt: new Date(),
        gesamtMenge: 0
    })
   
    eintrag = await Eintrag.create({
        getraenk:"Cola",
        menge:200,
        kommentar:"Zu wenig wasser",
        ersteller:protkollHanz.ersteller,
        erstellerName:pflegerLevent.name,
        protokoll:protkollLevent.id
    })
    eintrag2 = await Eintrag.create({
        getraenk:"Cola",
        menge:200,
        kommentar:"Zu wenig wasser",
        ersteller:protkollHanz.ersteller,
        erstellerName:pflegerLevent.name,
        protokoll:protkollLevent.id
    })

})
test("getAlleProtokolle mit id gesamtMenge",async ()=>{
    let result=await getAlleProtokolle(pflegerPeter.id)
    expect(result[0].gesamtMenge).toBe(400)
})
test("getAlleProtokolle", async () => {
    let result = await getAlleProtokolle(pflegerLevent.id)
    expect(result.length).toBe(3)
})

test("keine pfleger id", async () => {
    let falscheId = new Types.ObjectId();
    await expect(getAlleProtokolle(falscheId.toString())).rejects.toThrow("Pfleger id nicht gefunden");
})

test("getProtokoll", async () => {
    let result = await getProtokoll(protkollLevent.id)
    expect(result.patient).toBe("levent")
    expect(result.public).toBeFalsy()
    expect(result.closed).toBeFalsy()
})

test("getProtkoll ohne id", async () => {
    await expect(getProtokoll("")).rejects.toThrow("Bitte eine id eingeben")
})

test("getProtkoll pflger nicht gefunden ", async () => {
    await expect(getProtokoll(protkollLeventUnde.id)).rejects.toThrow("Pfleger nicht gefunden")
})


test("createProtokoll", async () => {
    let protkoll: ProtokollResource = {
        patient: "peter",
        datum: dateToString(new Date()),
        public: true,
        closed: false,
        ersteller: pflegerHanz.id,
        erstellerName: pflegerHanz.name,
        updatedAt:dateToString(new Date())
    }
    let result = await createProtokoll(protkoll)
    expect(result.patient).toBe("peter")
    expect(result.public).toBeTruthy()
    expect(result.closed).toBeFalsy()
    expect(result.ersteller).toBe(pflegerHanz.id)
})

test("updateProtokoll", async () => {
    let aktuellesDatum = new Date();
    let datum = dateToString(aktuellesDatum);

    let protkollLeventUpdatet = {
        id: protkollLevent.id,
        patient: "Kevin",
        datum: datum,
        public: false,
        closed: true,
        ersteller: pflegerLevent.id,
        erstellerName: pflegerLevent.name,
        updatedAt: datum,
    };

    let result = await updateProtokoll(protkollLeventUpdatet);
    expect(result.patient).toBe(protkollLeventUpdatet.patient);
    expect(result.datum).toBe(datum);
    expect(result.public).toBeFalsy();
    expect(result.closed).toBeTruthy();
    expect(result.ersteller).toBe(protkollLeventUpdatet.ersteller);
});
test("updateProtokoll mit get", async () => {
    let aktuellesDatum = new Date();
    let datum = dateToString(aktuellesDatum);

    let protkollLeventUpdatet = {
        id: protkollLevent.id,
        patient: "Kevin",
        datum: datum,
        public: false,
        closed: true,
        ersteller: pflegerLevent.id,
        erstellerName: pflegerLevent.name,
        updatedAt: datum,
    };

    await updateProtokoll(protkollLeventUpdatet);
    let result=await getProtokoll(protkollLevent.id)
    expect(result.patient).toBe("Kevin")
    
});



test("updateProtokoll protokoll nicht gefunden", async () => {
    let falscheId = new Types.ObjectId().toString()
    let protkollLeventUpdatet = {
        id: falscheId,
        patient: "Kevin",
        datum: "2023-11-13T16:00:00.000Z",
        public: false,
        closed: true,
        ersteller: pflegerLevent.id,
        erstellerName: pflegerLevent.name,
        updatedAt: "2023-11-13T16:00:00.000Z",
    }
    await expect(updateProtokoll(protkollLeventUpdatet)).rejects.toThrow("protokoll nicht gefunden")
})

test("Pfleger id nicht gefunden", async () => {
    let falscheId = new Types.ObjectId().toString();
    await expect(getAlleProtokolle(falscheId)).rejects.toThrow("Pfleger id nicht gefunden");
})
//createPRotokoll updatet at stringtodateangucken 

// test("createProtokoll mit get",async ()=>{
//     let aktuellesDatum = new Date();
//     let datum = dateToString(aktuellesDatum);
//     let protokoll:ProtokollResource={
//         datum:datum,
//         patient:"levent",
//         public:false,
//         closed:true,
//         ersteller: protkollLevent.ersteller.toString(),
//         erstellerName:"Kenno",
//         gesamtMenge:undefined
//     }
// let result=await createProtokoll(protokoll)
// let getter= await getProtokoll(result.id!.toString())
// expect(getter.patient).toBe("levent")
// expect(getter.public).toBeFalsy()

// })

test("getAlle ",async ()=>{
    let result = await getAlleProtokolle()
    expect(result.length).toBe(1)
})
test("deleteProtokoll ",async ()=>{
    expect(await deleteProtokoll(pflegerLevent.id)).not.toBeDefined()
    expect(await Protokoll.findOne({id:pflegerLevent.id})).toBeNull()
    expect(await Eintrag.findOne({ersteller:pflegerLevent.id})).toBeNull()
})
test("deleteProtokoll ohne id",async ()=>{
    await expect(deleteProtokoll("")).rejects.toThrow("id nicht eingegeben");
})
test("deleteProtokoll ohne id",async ()=>{
    let falscheId=new Types.ObjectId().toString()
    await expect(deleteProtokoll(falscheId)).rejects.toThrow("protokoll nicht gefunden");
})

//gesamt Menge nochmal angucken werden alle addiert nicht bestimmte 
test("getProtkoll gesamte menge getProtokoll",async ()=>{
    let aktuellesDatum = new Date();
    let datum = dateToString(aktuellesDatum);
  let protokoll=await Protokoll.create({

    patient:"levent",
    datum:"2023-11-13T16:00:00.000Z",
    public:false,
    closed:false,
    ersteller:pflegerLevent.id,
    erstellerName:pflegerLevent.name,
    updateAt:"2023-11-13T16:00:00.000Z",
    gesamtMenge:0
  })
  let protokoll2=await Protokoll.create({

    patient:"levent",
    datum:"2023-11-13T16:00:00.000Z",
    public:false,
    closed:false,
    ersteller:pflegerHanz.id,
    erstellerName:pflegerHanz.name,
    updateAt:"2023-11-13T16:00:00.000Z",
    gesamtMenge:0
  })
  await protokoll.save()

  let eintrag= await Eintrag.create({
    getraenk:"Cola",
    menge:200,
    kommentar:"PIPI",
    ersteller:protokoll.ersteller,
    erstellerName:pflegerLevent.name,
    protokoll:protokoll.id
  })
  let eintra3= await Eintrag.create({
    getraenk:"Cola",
    menge:800,
    kommentar:"PIPI",
    ersteller:protokoll.ersteller,
    erstellerName:pflegerLevent.name,
    protokoll:protokoll.id
  })
  let falscheId = new Types.ObjectId();

  let eintrag2= await Eintrag.create({
    getraenk:"Cola",
    menge:200,
    kommentar:"PIPI",
    ersteller:protokoll2.ersteller,
    erstellerName:pflegerLevent.name,
    protokoll:protokoll.id
  })
  await eintrag.save()
  let result =await getProtokoll(protokoll.id)
  expect(result.gesamtMenge).toBe(1200)
  
  

})
test("crateProtokoll fehler werfen",async ()=>{
    let falscheId = new Types.ObjectId().toString()

    let aktuellesDatum = new Date();
    let datum = dateToString(aktuellesDatum);
    let protokoll:ProtokollResource={
        datum:datum,
        patient:"levent",
        public:false,
        closed:true,
        ersteller: falscheId,
        erstellerName:"Kenno",
        gesamtMenge:undefined
    }
    await expect( createProtokoll(protokoll)).rejects.toThrow("pflger nicht gefunden ");
    
})

