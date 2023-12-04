import { Pfleger } from "../../src/model/PflegerModel"



test("Passwort wurde gehashed", async () => {
    const pfleger = new Pfleger({ name: "Levent", password: "Hallo123" });
    let result = await pfleger.save();
    expect(result).toBeDefined();
    expect(result.name).toBe("Levent");
    //expect(result.password).toBe("Hallo123")
})

test("default werte richtig", () => {
    const result = new Pfleger({ name: "Levent", password: "123" })
    expect(result.admin).toBeFalsy()
})

test("required", async () => {
try{
    const pfleger = new Pfleger({ admin: true })
    await pfleger.save();
}
catch(error){
    expect(error).toBeTruthy()
}

})

test("unique", async () => {
    const pfleger = new Pfleger({ name: "Levent", password: "Hallo" })
    await pfleger.save();
    const pfleger2 = new Pfleger({ name: "Levent", password: "1234" })
    try {
        await pfleger2.save()
    }
    catch (error) {
        expect(error).toBeTruthy()
    }
})

