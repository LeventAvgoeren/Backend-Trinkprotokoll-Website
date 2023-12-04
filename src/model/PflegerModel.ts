import { Model, Query, Schema, model } from "mongoose";
import * as bcrypt from 'bcryptjs';

//https://mongoosejs.com/docs/api/query.html#Query.prototype.updateOne()
//https://specopssoft.com/de/blog/so-koennen-sie-die-passwort-hash-methode-von-active-directory-andern/#:~:text=bcrypt%3A%20Dieser%20Algorithmus%20berechnet%20den,%2DTable“%2DAngriffen%20schützen.
//https://stackoverflow.com/questions/31173516/mongoose-middleware-pre-update
//https://mongoosejs.com/docs/api/query.html#Query.prototype.getUpdate()

//pre steht für bevor es gespeichert wird in MongoDB
//Extra interface erstellen für Pfleger mit methoden  
export interface IPfleger {
    name: string;
    password: string;
    admin?: boolean;
}
//Folie 78
export interface IPflegerMethods {
    isCorrectPassword(password: string): Promise<boolean>;
}
//folie 78
type Pflegermodel=Model<IPfleger,{},IPflegerMethods>

//folie 78
const pflegerSchema = new Schema<IPfleger,Pflegermodel,IPflegerMethods>({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false }
});

//folie 76
pflegerSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const hashedPw = await bcrypt.hash(this.password, 10);
        this.password = hashedPw;
    }
});
//this. bezieht sich auf die Query 
//getUpdate wird ein objekt zurück gegeben 
//Lösung von der Übung "schönste version"
pflegerSchema.pre("updateOne", async function () {
    let update = this.getUpdate(); 
    if (update && "password" in update) {
        const hashedPassword = await bcrypt.hash(update.password, 10); 
        update.password = hashedPassword;
    }
});
//TODO:"hässliche version "
//if((this as any)._update.password){
//}

//folie 78
pflegerSchema.method("isCorrectPassword",async function (password: string): Promise<boolean> {
    if(this.password.startsWith("$2")===false){
        throw Error("passwort wurde noch nicht gehashed")
    }
        let result = await bcrypt.compare(password, this.password);
        return result
    });

export const Pfleger = model<IPfleger,Pflegermodel>("Pfleger", pflegerSchema);