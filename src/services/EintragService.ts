import { Types } from "mongoose";
import { EintragResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString, stringToDate } from "./ServiceHelper";

/**
 * Gibt alle Eintraege in einem Protokoll zurück.
 * Wenn das Protokoll nicht gefunden wurde, wird ein Fehler geworfen.
 */
export async function getAlleEintraege(protokollId: string): Promise<EintragResource[]> {
    const eintragArray: EintragResource[] = [];

    if(!protokollId){
        throw Error("Keine protokolId eingegeben")
    }
    let eintrag=await Eintrag.find({protokoll:protokollId}).exec()

    let protkolle=await Protokoll.findById(protokollId).exec()
    if(!protkolle){
        throw Error("protokoll nicht gefunden")
    }
    let pfleger=await Pfleger.findById(protkolle.ersteller).exec()
    if(!pfleger){
        throw Error("pfleger nicht gefunden")
    }
    for (let index = 0; index < eintrag.length; index++) {
        const element = eintrag[index];
        const eintragResource: EintragResource = {
            id: element.id,
            getraenk: element.getraenk,
            menge: element.menge,
            kommentar: element.kommentar,
            ersteller: element.ersteller.toString(),
            erstellerName: pfleger!.name,
            createdAt: dateToString(element.createdAt),
            protokoll: element.protokoll.id.toString()
        };
        eintragArray.push(eintragResource);
}
return eintragArray 
}
/**
 * Liefert die EintragResource mit angegebener ID.
 * Falls kein Eintrag gefunden wurde, wird ein Fehler geworfen.
 */
export async function getEintrag(id: string): Promise<EintragResource> {
    if(!id){
        throw Error("keine id eingegeben")
    }
   let result= await Eintrag.findById(id)
   if(!result){
        throw Error("kein eintrag mit dieser id gefunden")
   }
   let pfleger= await Pfleger.findById(result.ersteller)
   if(!pfleger){
    throw Error("pfleger nicht gefunden")
   }
   let protkolle= await Protokoll.findById(result.protokoll)
    if(!protkolle){
        throw Error("prtokoll nicht gefunden")
    }

   const eintrag:EintragResource={
    id: result.id,
    getraenk: result.getraenk,
    menge: result.menge,
    kommentar: result.kommentar,
    ersteller: result.ersteller.toString(),
    erstellerName: pfleger.name,
    createdAt: dateToString(result.createdAt),
    protokoll: protkolle.id
   }
   return eintrag
}

/**
 * test
 * Erzeugt eine Eintrag.
 * Daten, die berechnet werden aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (done) ist, wird ein Fehler wird geworfen.
 */
export async function createEintrag(eintragResource: EintragResource): Promise<EintragResource> {
    const pfleger = await Pfleger.findById(eintragResource.ersteller).exec();
    if (!pfleger) {
      throw new Error(`No pfleger found with id ${eintragResource.ersteller}`);
    }
    const protokoll = await Protokoll.findById(eintragResource.protokoll).exec();
    if (!protokoll) {
      throw new Error(`No protokoll found with id ${eintragResource.protokoll}`);
    }
    if (protokoll.closed) {
      throw new Error(`Protokoll ${protokoll.id} is already closed`);
    }
  
    const eintrag = await Eintrag.create({
      getraenk: eintragResource.getraenk,
      menge: eintragResource.menge,
      kommentar: eintragResource.kommentar,
      ersteller: eintragResource.ersteller,
      protokoll: eintragResource.protokoll,
    });
    return {
      id: eintrag.id,
      getraenk: eintrag.getraenk,
      menge: eintrag.menge,
      kommentar: eintrag.kommentar,
      ersteller: pfleger.id,
      erstellerName: pfleger.name,
      createdAt: dateToString(eintrag.createdAt!),
      protokoll: protokoll.id,
    };
  }

/**
 * Updated eine Eintrag. Es können nur Name, Quantity und Remarks geändert werden.
 * Aktuell können Eintrags nicht von einem Protokoll in einen anderen verschoben werden.
 * Auch kann der Creator nicht geändert werden.
 * Falls die Protokoll oder Creator geändert wurde, wird dies ignoriert.
 */
export async function updateEintrag(eintragResource: EintragResource): Promise<EintragResource> {
    if(!eintragResource){
        throw Error("keine eingabe")
    }
    let eintrag= await Eintrag.findById(eintragResource.id).exec()
    if(!eintrag){
        throw Error("eintrag mit dieser id nicht gefunden")
    }
    let protokolle=await Protokoll.findById(eintrag.protokoll).exec()//GEÄNDERT
    if(!protokolle){
        throw Error("protkoll nicht gefunden ")
    }
    let pfleger=await Pfleger.findById(eintrag.ersteller).exec()//GEÄNDERT
    if(!pfleger){
        throw Error("pfleger nicht gefunden ")
    }
    
    eintrag.getraenk=eintragResource.getraenk
    eintrag.menge=eintragResource.menge
    eintrag.kommentar=eintragResource.kommentar
    await eintrag.save()

    return{
        id: eintrag.id,
        getraenk: eintrag.getraenk,
        menge: eintrag.menge,
        kommentar: eintrag.kommentar,
        ersteller: eintrag.ersteller.toString(),
        erstellerName:pfleger.name,
        createdAt:dateToString(eintrag.createdAt),
        protokoll:eintrag.protokoll.toString()     //eintrag.protokoll.id
    }

}


/**
 * Beim Löschen wird das Eintrag über die ID identifiziert. 
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteEintrag(id: string): Promise<void> {
    if(!id){
        throw Error("id nicht eingegeben")
    }
    let result= await Eintrag.deleteOne({ _id: new Types.ObjectId(id) }).exec()
    if(result.deletedCount!==1){
        throw Error("keine gültige id gefunden konnte nicht gelöscht werden")
    }
}

