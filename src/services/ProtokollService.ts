import mongoose, { Types } from "mongoose";
import { ProtokollResource } from "../Resources";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString, stringToDate } from "./ServiceHelper";
import { Eintrag } from "../model/EintragModel";

/**
 * Gibt alle Protokolls zurück, die für einen Pfleger sichtbar sind. Dies sind:
 * - alle öffentlichen (public) Protokolls
 * - alle eigenen Protokolls, dies ist natürlich nur möglich, wenn die pflegerId angegeben ist.
 */
export async function getAlleProtokolle(pflegerId?: string): Promise<ProtokollResource[]> {
    // public Protokolls
    let protokolls = await Protokoll.find({ public: true }).exec();

    if (pflegerId) {
        // private Protokolls
        const privateProtokolls = await Protokoll.find({ ersteller: pflegerId, public: false }).exec();

        // Combine public & private Protokolls, so there R no duplicates
        protokolls = [...protokolls, ...privateProtokolls.filter(privateProtokoll =>
            !protokolls.some(publicProtokoll => publicProtokoll._id.equals(privateProtokoll._id))
        )];
    }

    // die gesamtMenge für jedes Protokoll berechnen und es zu ProtokollResource konvertieren
    const protokollResource = await Promise.all(protokolls.map(async (protokoll) => {

        const eintraege = await Eintrag.find({ protokoll: protokoll._id }).exec();

        const gesamtmenge = eintraege.reduce((sum, eintrag) => sum + eintrag.menge, 0);

        const pflegerbeispiel = await Pfleger.findById(protokoll.ersteller).exec();

        return {
            id: protokoll._id.toString(),
            patient: protokoll.patient,
            datum: dateToString(protokoll.datum),
            public: protokoll.public,
            closed: protokoll.closed,
            ersteller: protokoll.ersteller.toString(),
            erstellerName: pflegerbeispiel?.name,
            gesamtMenge: gesamtmenge,
            updatedAt: dateToString(protokoll.updatedAt)
        };
    }));

    return protokollResource;
}


/**
 * Liefer die Protokoll mit angegebener ID.
* Falls keine Protokoll gefunden wurde, wird ein Fehler geworfen.
*/
export async function getProtokoll(id: string): Promise<ProtokollResource> {
    //gesamteMenge = alle mengen addiert  
    if (!id) {
        throw Error("Bitte eine id eingeben")
    }
    //Hole mir die Protokolle mit dieser id 

    let result = await Protokoll.findById(id).exec()

    if (!result) {
        throw Error("Protokoll nicht gefunden");
    }
    //Alle Protokolle.ersteller
    let pfleger = await Pfleger.findById(result.ersteller).exec()
    if (!pfleger) {
        throw Error("Pfleger nicht gefunden");
    }

    let eintrag = await Eintrag.find({ protokoll:id}).exec()
    if (!eintrag) {
        throw Error("fehler eintrag")
    }
    //let menge=eintrag.reduce((sum,eintrag)=>sum+eintrag.menge,0)
    let menge = 0;
    for (let index = 0; index < eintrag.length; index++) {
        const element = eintrag[index];
        menge += element.menge
    }

    let protkoll = {
        id: result.id,
        patient: result.patient,
        datum: dateToString(result.datum),
        public: result.public,
        closed: result.closed,
        ersteller: result.ersteller.toString(),
        erstellerName: pfleger.name,
        updatedAt: dateToString(result.updatedAt),
        gesamtMenge: menge
    }
    return protkoll
}

/**
 * Erzeugt das Protokoll.
 * fehler hier 
 */
export async function createProtokoll(protokollResource: ProtokollResource): Promise<ProtokollResource> {
    //auflösen
        let pfleger=await Pfleger.findById(protokollResource.ersteller)
        if(!pfleger){
            throw Error("pflger nicht gefunden ")
        }
    let protkoll = await Protokoll.create({
        id: protokollResource.id,
        patient: protokollResource.patient,
        datum: stringToDate(protokollResource.datum),
        public: protokollResource.public,
        closed: protokollResource.closed,
        ersteller: pfleger.id,
    })
    

    return {
        id: protkoll.id,
        patient: protkoll.patient,
        datum: dateToString(protkoll.datum),
        public: protkoll.public,
        closed: protkoll.closed,
        ersteller: pfleger.id,
        erstellerName:pfleger.name,
        updatedAt:dateToString(protkoll.updatedAt)
    }
}

/**
 * Ändert die Daten einer Protokoll.
 */
export async function updateProtokoll(protokollResource: ProtokollResource): Promise<ProtokollResource> {
    let protkoll = await Protokoll.findById(protokollResource.id).exec()
    if (!protkoll) {
        throw Error("protokoll nicht gefunden")
    }

    await Pfleger.findById(protkoll.ersteller).exec()


     await Eintrag.find({ ersteller: protkoll.ersteller }).exec()

    protkoll.patient = protokollResource.patient
    protkoll.datum = stringToDate(protokollResource.datum)
    protkoll.public = protokollResource.public
    protkoll.closed = protokollResource.closed
    protkoll.ersteller = new Types.ObjectId(protokollResource.ersteller)
    if(protokollResource.updatedAt){
    protkoll.updatedAt = stringToDate(protokollResource.updatedAt)
    }

    await protkoll.save()
    return {
        id: protkoll.id,
        patient: protkoll.patient,
        datum: dateToString(protkoll.datum),
        public: protkoll.public,
        closed: protkoll.closed,
        ersteller: protkoll.ersteller.toString(),
        erstellerName:protokollResource.erstellerName,
        gesamtMenge:protokollResource.gesamtMenge,
        updatedAt:dateToString(protkoll.updatedAt)
    }
}

/**
 * Beim Löschen wird die Protokoll über die ID identifiziert.
 * Falls keine Protokoll nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn die Protokoll gelöscht wird, müssen auch alle zugehörigen Eintrags gelöscht werden.
 */
export async function deleteProtokoll(id: string): Promise<void> {
    //Keine id eingegeben
    if (!id) {
        throw Error("id nicht eingegeben")
    }
    //Protokoll mti dieser id finden 
    let protokoll = await Protokoll.findById(id).exec()
    //Wenn protokoll nicht gefunden wurde fehler werfen
    if (!protokoll) {
        throw Error("protokoll nicht gefunden")
    }
    //Ein protokoll mit dieser id löschen
    await Protokoll.deleteOne({ _id: new Types.ObjectId(id) }).exec()

    //Alle einträge wo die protokoll id diese ist löschen 
    await Eintrag.deleteMany({ protokoll: protokoll.id }).exec()

}    
