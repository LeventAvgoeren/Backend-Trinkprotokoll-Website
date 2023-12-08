import { HydratedDocument } from "mongoose"
import { IPfleger, Pfleger } from "../../src/model/PflegerModel"
import { optionalAuthentication, requiresAuthentication } from "../../src/routes/authentication"
import supertest from "supertest"
import app from "../../src/app"

let pflegerLevent: HydratedDocument<IPfleger>

beforeEach(async () => {
    pflegerLevent= await Pfleger.create({name:"Levent",password:"HalloWelt123!da",admin:true})
})
test("requiresAuthntication",()=>{
    requiresAuthentication()

})
