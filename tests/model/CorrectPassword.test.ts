import { Pfleger } from "../../src/model/PflegerModel"

test("hashed", async () => {
    let pfleger = new Pfleger({ name: "Levent", password: "levent123" })
    await pfleger.save()
    expect(pfleger.password).not.toEqual("levent123")
})

test("richtiges pw", async () => {
    let pfleger = new Pfleger({ name: "Levent", password: "levent123" })
    await pfleger.save()
    expect(await pfleger.isCorrectPassword("levent123")).toBeTruthy()
})
test("Leeres pw", async () => {
    let pfleger = new Pfleger({ name: "Levent", password: "levent123" });
    await pfleger.save();
    expect(await pfleger.isCorrectPassword("")).toBeFalsy();
});
test("Fehler bei nicht gehashtem pw", async () => {
    let pfleger = new Pfleger({ name: "Levent", password: "levent123" });
    await expect(async () => await pfleger.isCorrectPassword("levent123")).rejects.toThrow("passwort wurde noch nicht gehashed");
});
test("falsches pw", async () => {
    let pfleger = new Pfleger({ name: "Levent", password: "levent123" });
    await pfleger.save();
    expect(await pfleger.isCorrectPassword("levent1234")).toBeFalsy();
});
test("zwei pfleger passwort von einem beim anderen benutzen", async () => {
    let pfleger = new Pfleger({ name: "Levent", password: "levent123" })
    let pfleger2 = new Pfleger({ name: "Kevin", password: "Hallo123" })
    await pfleger.save()
    await pfleger2.save()
    expect(await pfleger.isCorrectPassword("Hallo123")).toBeFalsy()
})

test("updatePw", async () => {
    let pfleger = new Pfleger({ name: "Levent", password: "levent123" })
    await pfleger.save()
    pfleger.updateOne({name:"Kevin",password:"hallo123"})
    expect(await pfleger.isCorrectPassword("hallo123"))
})

test("Hashen/Updaten ", async () => {
    let pfleger = new Pfleger({ name: "Levent", password: "HalloWelt123" });
    await pfleger.save();
    await Pfleger.updateOne({ name: "Levent" }, { password:"Hallo123" });
    const updatedPfleger = await Pfleger.findOne({ name: "Levent" });
    expect(updatedPfleger?.password).not.toEqual("Hallo123");
})
