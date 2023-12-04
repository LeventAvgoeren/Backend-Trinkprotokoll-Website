import {HydratedDocument } from "mongoose"
import { Eintrag, IEintrag } from "../../src/model/EintragModel"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel"

let pfleger1:HydratedDocument<IPfleger>
let protokoll1:HydratedDocument<IProtokoll>
beforeEach(async()=>{
    pfleger1=await Pfleger.create({name:"Levent",password:"Hallo123"})
    await pfleger1.save()
    protokoll1=await Protokoll.create({patient:"Levent",datum:new Date,ersteller:pfleger1.id})
    await protokoll1.save();
})

test("Eintraege in DB speichern und datentypen überprüfen", async()=>{
    const eintrag2 =new Eintrag({
        getraenk:"Wasser",
        menge:400,
        kommentar:"war zu wenig wasser",
        ersteller:pfleger1.id,
        protokoll:protokoll1.id
        })
        let result=await eintrag2.save();
        expect(result.getraenk).toBe("Wasser")
        expect(result.menge).toBe(400);
        expect(result.kommentar).toBe("war zu wenig wasser")
})
test("required",async ()=>{
    const eintrag =new Eintrag({
        kommentar:"war zu wenig wasser",
        createdAt:"2023-10-13T16:00:00Z"
        })
        try{
            await eintrag.save()
        }
        catch(error){
            expect(error).toBeTruthy()
        }
})
