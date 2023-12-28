
import {deleteDoc, doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {db, auth} from "../config/firebase-config";

const crypto = require('crypto');
export function generateRandomPassword() {
    return crypto.randomBytes(8).toString('hex');
  }

export async function createPatient(uidCurr, formData) {
      try {
           // Genera una password casuale
      const randomPassword = generateRandomPassword();
      const currentUID = localStorage.getItem('user');
      const patientUserCredential = await auth.createUserWithEmailAndPassword(formData.email_paziente, randomPassword);
      const uidPatient = patientUserCredential.user.uid;
      const userDocRef = doc(db, 'users', uidPatient);
      const anagraficaDocRef = doc(db, 'users', uidPatient, 'anagrafica', uidPatient);
      const anamnesiDocRef = doc(db, 'users', uidPatient, 'anamnesi', uidPatient);
      const esamiDocRef = doc(db, 'users', uidPatient, 'esami', uidPatient);
      const misureAntroDocRef = doc(db, 'users', uidPatient, 'misureantropometriche', uidPatient);
      const misureDocRef = doc(db, 'users', uidPatient, 'misure', uidPatient);
      const allergieDocRef = doc(db, 'users', uidPatient, 'allergie', uidPatient);
      const intolleranzeDocRef = doc(db, 'users', uidPatient, 'intolleranze', uidPatient);
      const patologieDocRef = doc(db, 'users', uidPatient, 'patologie', uidPatient);
      // Invia un'email al paziente con il link per la modifica della password
      await auth.sendPasswordResetEmail(formData.email_paziente);
     
      // Salva il ruolo dell'utente come "paziente" nel database Firestore
      await setDoc(userDocRef, {
        email: formData.email_paziente,
        nome: formData.nome_paziente,
        role: 'Utente',
        nutrizionistaId: uidCurr,
        // Altri dati del paziente
      });

      await setDoc(anagraficaDocRef,{
      cognome: formData.cognome_paziente,
      nome: formData.nome_paziente,
      sesso: formData.sesso_paziente,
      data_nasc: formData.data_nascita_paziente,
      luogo_nasc: formData.luogo_nascita_paziente,
      prov_nasc: formData.provincia_nasc_paziente,
      cf: formData.codice_fiscale_paziente,
      luogo_resid: formData.citta_resid_paziente,
      prov_resid: formData.provincia_resid_paziente,
      via_resid: formData.via_residenza_paziente,
      telefono: formData.numero_telefono_paziente,
      email: formData.email_paziente,
      ruolo: "Utente",
      email_nutrizionista: currentUID, /*devo modificare currentUID con l'email*/
      
      });

      await setDoc(anamnesiDocRef,{
        note_anamnesi: formData.note_anamnesi,
      });

      await setDoc(esamiDocRef, {
        esami_effettuati: formData.esami_effettuati,
        esami_prescritti: formData.esami_prescritti,
      });

      await setDoc(misureAntroDocRef, {
        peso_paziente: formData.peso_paziente,
        altezza_paziente: formData.altezza_paziente,
        circ_fianchi: formData.circ_fianchi,
        circ_braccia: formData.circ_braccia,
        circ_cosce: formData.circ_cosce,
        circ_vita: formData.circ_vita,  
        circ_spalle: formData.circ_spalle,
        circ_torace: formData.circ_torace,
        circ_testa: formData.circ_testa,
        circ_collo: formData.circ_collo,
        obiettivo_peso: formData.obiettivo_peso,
        obiett_fianchi: formData.obiett_fianchi,
        obiett_braccia: formData.obiett_vita,
        obiett_cosce: formData.obiett_cosce,
        obiett_vita: formData.obiett_vita,  
        obiett_spalle: formData.obiett_spalle,
        obiett_torace: formData.obiett_torace,
        obiett_testa: formData.obiett_testa,
        obiett_collo: formData.obiett_collo,
      });

      await setDoc(misureDocRef, {
        carenze_vitam: formData.carenze_vitam,
        acqua_intrace:formData.acqua_intrace,
        acqua_extrace: formData.acqua_extrace,
        massa_met_att: formData.massa_met_att,
        met_basale: formData.met_basale,
        massa_magra: formData.massa_magra,
        massa_grassa: formData.massa_grassa,
        angolo_bia: formData.angolo_bia,
        obiett_acqua_intrace: formData.obiett_acqua_intrace,
        obiett_acqua_extrace: formData.obiett_acqua_extrace,
        obiett_massa_met_att: formData.obiett_massa_met_att,
        obiett_met_basale: formData.obiett_met_basale,
        obiett_massa_magra: formData.obiett_massa_magra,
        obiett_massa_grassa: formData.obiett_massa_grassa,
        obiett_angolo_bia: formData.obiett_angolo_bia,
      });

      await setDoc(intolleranzeDocRef, {
        intolleranze: formData.intolleranze.map(item => ({
            id: item.id,
            selected: item.selected,
        })),
    });
  
    await setDoc(allergieDocRef, {
        allergie: formData.allergie.map(item => ({
            id: item.id,
            nome: item.nome,
            selected: item.selected,
        })),
    });

    await setDoc(patologieDocRef, {
        patologi: formData.patologie.map(item => ({
            id: item.id,
            nome: item.nome,
            selected: item.selected,
        })),
    });
      return { success: true, message:'Paziente registrato con successo. Email inviata per la modifica della password.', uidPatient};
    } catch (error) {
      console.error('Errore durante la registrazione del paziente:', error.message);
      return {success: false, message: error.message, uidPatient: null};
      //throw error;
  } 
}


/*
 Funzione che si occupa di aggiornare i dati di un paziente memorizzata su Firestore Database
 */
/*vedere se email_paziente è giusto
 export async function updatePatient(formData, email_paziente) {
    formData.data_inserimento = serverTimestamp();
    await updateDoc(doc(db, "users", email_paziente), formData);
} */

/*
 Funzione che si occupa di aggiornare il numero di telefono del nutrizionista su Firestore Database
 */
export async function updateTelephone(formData, email_paziente) {
    await updateDoc(doc(db, "users", email_paziente), formData);
}

/*
 Funzione che si occupa di eliminare una dieta memorizzata su Firestore Database
 */
export async function deleteDiet(email_paziente) {
    await deleteDoc(doc(db, "users", email_paziente));
}

/*
 Funzione che si occupa di ottenere i dati di una dieta memorizzata su Firestore Database
 */
 export async function getPatient(email_paziente) {
    const docRef = doc(db, "users", email_paziente);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log("Documento letto correttamente ");
        console.log(docSnap.data());
        return docSnap.data();
    } else {
        console.log(("Nessun documento trovato con il codice fiscale inserito!"));
    }
}