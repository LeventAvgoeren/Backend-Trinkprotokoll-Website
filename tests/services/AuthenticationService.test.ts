import { HydratedDocument, Types } from "mongoose"
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import { login } from "../../src/services/AuthenticationService"
import { PflegerResource } from "../../src/Resources"
import { createPfleger } from "../../src/services/PflegerService"

let pflegerLevent: HydratedDocument<IPfleger>
let pflegerHanz: HydratedDocument<IPfleger>
let pflegerKevin: HydratedDocument<IPfleger>

beforeEach(async () => {
    
    pflegerLevent = new Pfleger({ name: "Levent", password: "Hallo123", admin: true })
    await createPfleger(pflegerLevent as PflegerResource);
   
    pflegerHanz = new Pfleger({ name: "Hanz", password: "Welt123", admin: true })
    await createPfleger(pflegerHanz as PflegerResource);

    pflegerKevin = new Pfleger({ name: "Kevin", password: "2231mss", admin: false })
    await createPfleger(pflegerKevin as PflegerResource);
})

test("AuthenticationService",async ()=>{
    let result= await login("Levent","Hallo123")
    expect(result).toEqual({ id: pflegerLevent.id, role: "a" });
})

test("AuthenticationService",async ()=>{
    let result= await login(pflegerKevin.name,pflegerKevin.password)
    expect(result).toEqual({ id: pflegerKevin.id, role: "u" });
})

test("AuthenticationService",async ()=>{
    let result= await login(pflegerHanz.name,pflegerLevent.password)
    expect(result).toEqual(false)
})

test("AuthenticationService name fehlt",async ()=>{
    expect(await login("",pflegerLevent.password)).toBe(false);
})

test("AuthenticationService password fehlt",async ()=>{
    expect(await login(pflegerLevent.name,"")).toBe(false);
})

test("AuthenticationService pfleger nicht gefunden",async ()=>{
      expect(await login("john",pflegerLevent.password)).toBe(false);
})
