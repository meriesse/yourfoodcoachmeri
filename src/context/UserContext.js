import {doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where} from "firebase/firestore";
import {auth, db} from "../config/firebase-config";

/*
 Funzione che si occupa di memorizzare i dati di un profilo utente su Firestore Database
 */
 export async function signUpUser(email, password, nome, cognome, sesso, telefono, cf, data_nasc, luogo_nasc, prov_nasc, luogo_resid, prov_resid, via_resid, ruolo) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        const userDocRef = doc(db, 'users', uid);
        const anagraficaDocRef = doc(db, 'users', uid, 'anagrafica', uid);

        await setDoc(userDocRef, {
            email: email,
            nome: nome,
            ruolo: ruolo
        });

        localStorage.setItem('user', nome);
        localStorage.setItem('role', ruolo);

        await setDoc(anagraficaDocRef, {
            cognome: cognome,
            nome: nome,
            sesso: sesso,
            data_nasc: data_nasc,
            luogo_nasc: luogo_nasc,
            prov_nasc: prov_nasc,
            cf: cf,
            luogo_resid: luogo_resid,
            prov_resid: prov_resid,
            via_resid: via_resid,
            telefono: telefono,
            email: email,
            ruolo: ruolo,
        });

        return { success: true, message: "Registrazione completata con successo" };
    } catch (error) {
        console.error('Errore durante la registrazione dell\'utente:', error.message);
        return { success: false, message: error.message };
    }
}

export async function fetchUser(uid) {
    try {
        const anagraficaDocRef = doc(db, 'users', uid, 'anagrafica', uid);
        const docSnap = await getDoc(anagraficaDocRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("Nessun documento trovato con l'UID inserito nella collezione 'anagrafica'!");
            return null;
        }
    } catch (error) {
        console.error("Errore durante la lettura dei dati:", error);
        return null;
    }
}


export async function updateUser(uid, nome, cognome, sesso, data_nasc, luogo_nasc, prov_nasc, cf, luogo_resid, prov_resid, via_resid, telefono, email) {
    const anagraficaDocRef = doc(db, 'users', uid, 'anagrafica', uid);

    try {
        const docSnap = await getDoc(anagraficaDocRef);

        if (docSnap.exists()) {
            await updateDoc(anagraficaDocRef, {
                cognome: cognome,
                nome: nome,
                sesso: sesso,
                data_nasc: data_nasc,
                luogo_nasc: luogo_nasc,
                prov_nasc: prov_nasc,
                cf: cf,
                luogo_resid: luogo_resid,
                prov_resid: prov_resid,
                via_resid: via_resid,
                telefono: telefono,
                email: email
            });

            return { success: true, message: "Aggiornamento completato con successo" };
        } else {
            return { success: false, message: "Il documento dell'anagrafica non esiste" };
        }
    } catch (error) {
        console.error("Errore durante l'aggiornamento dei dati:", error);
        return { success: false, message: error.message };
    }
}
