
import { HydratedDocument } from "mongoose";
import { Protokoll } from "../../src/model/ProtokollModel"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";

let pfleger1:HydratedDocument<IPfleger>
beforeEach(async()=>{
    pfleger1=await Pfleger.create({name:"Levent",password:"Hallo123"})
    await pfleger1.save()
})

test("Protokoll in DB speichern und datentyp", async ()=>{
    const protokoll=new Protokoll({
        patient:"Levent",
        datum:"2023-10-13T16:00:00Z",
        ersteller:pfleger1.id
    })
    let result=await protokoll.save();
    expect(result.patient).toBe("Levent");
})

test("default",async()=>{
    const protokoll=new Protokoll({
        patient:"Levent", 
        datum:"2023-10-13T16:00:00Z",
        ersteller:pfleger1.id
    })
    let result= await protokoll.save()
    expect(result.public).toBeFalsy()
    expect(result.closed).toBeFalsy();
})

test("required",async ()=>{
    try{
        const protokoll=new Protokoll({
            public:true,
            closed:true
        })
        await protokoll.save();
        
    }
    catch(error){
        expect(error).toBeTruthy()
    }
    
})
