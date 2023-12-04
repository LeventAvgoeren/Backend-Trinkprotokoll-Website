import { Types } from "mongoose";
import { PflegerResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";


/**
 * Die Passwörter dürfen nicht zurückgegeben werden.
 */
export async function getAllePfleger(): Promise<PflegerResource[]> {
    const pfleger = await Pfleger.find().exec();
    return pfleger.map(pflegers => {
        return {
            //id ist ein Object sonst fehler
            id: pflegers.id.toString(),
            name: pflegers.name,
            //fehler wenn man nicht default wert angibt 
            //! wegen ausrufezeichen 
            admin: pflegers.admin!
        };
    });
}

/**
 * Erzeugt einen Pfleger. Das Password darf nicht zurückgegeben werden.
 */
export async function createPfleger(pflegerResource: PflegerResource): Promise<PflegerResource> {
    const pfleger = await Pfleger.create({
        id: pflegerResource.id,
        name: pflegerResource.name,
        admin: pflegerResource.admin,
        password: pflegerResource.password
    })
    return {
        id: pfleger.id,
        name: pfleger.name,
        admin: pfleger.admin!
    }
}


/**
 * Updated einen Pfleger.
 * Beim Update wird der Pfleger über die ID identifiziert.
 * Der Admin kann einfach so ein neues Passwort setzen, ohne das alte zu kennen.
 */
//Siehe aufgabe 
export async function updatePfleger(pflegerResource: PflegerResource): Promise<PflegerResource> {
    //Pfleger nach id suchen 
    const pfleger = await Pfleger.findById(pflegerResource.id).exec()
    if (!pfleger) {
        throw Error("pfleger id nicht gefunden")
    }
            pfleger.id=pflegerResource.id
            pfleger.name=pflegerResource.name
            pfleger.admin=pflegerResource.admin
            if(pflegerResource.password){
            pfleger.password = pflegerResource.password!;
            }
            
            await pfleger.save()
    return {
        id: pflegerResource.id,
        name: pflegerResource.name,
        admin: pflegerResource.admin,
    }
}

/**
 * Beim Löschen wird der Pfleger über die ID identifiziert.
 * Falls Pfleger nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der Pfleger gelöscht wird, müssen auch alle zugehörigen Protokolls und Eintrags gelöscht werden.
 */
export async function deletePfleger(id: string): Promise<void> {
    if (!id) {
        throw Error("pfleger id eingeben")
    }
    //Pflger daten raussuchen
    let pfleger=await Pfleger.findById(id).exec()
    if(!pfleger){
        throw Error("pfleger id nicht gefunden")
    }
    //gegebenen pfleger löschen 
    await Pfleger.deleteOne({_id:new Types.ObjectId(id) }).exec()
    
    //Alle protokolle mit der pfleger id löschen 
    await Protokoll.deleteMany({ersteller:pfleger.id}).exec()
    
    //Alle eintraege löschen mit der pfleger id 
    await Eintrag.deleteMany({ersteller:pfleger.id}).exec()

}