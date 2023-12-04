import { Pfleger } from "../model/PflegerModel";

/**
 * Prüft Name und Passwort, bei Erfolg ist `success` true 
 * und es wird die `id` und `role` ("u" oder "a") des Pflegers zurückgegeben
 * 
 * Falls kein Pfleger mit gegebener Name existiert oder das Passwort falsch ist, wird nur 
 * `false` zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(name: string, password: string): Promise<{ id: string, role: "a" | "u" } | false> {
    //Fehlender name 
    if (!name) {
        return false
    }
    //Fehlendes Password
    if (!password) {
        return false
    }
    //Pflger mit dem namen finden 
    let pfleger = await Pfleger.findOne({ name }).exec()
    //Wenn pfleger gefunden wurde 
    if (!pfleger) {
        return false
    }
    
    //nach gucken ob name oder password falsch sind 
    if (!pfleger.name || !await pfleger.isCorrectPassword(password)) {
        return false
    }
    else {
        //Wenn er admin ist dann gib id und role zurück("a=admin")
        if (pfleger.admin === true) {
            return {
                id: pfleger.id,
                role: "a"
            };
        }
        //Wenn nicht dann gib id und role zurück("u=user") 
        else {
            return {
                id: pfleger.id,
                role: "u"
            }
        }
    }


}