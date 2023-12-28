import {collection, deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc, query, where, getDocs} from "firebase/firestore";
import {db} from "../config/firebase-config";


/*
 Funzione che si occupa di memorizzare i dati di una dieta su Firestore Database
 */
export async function addDiet(formData, nutrizionista) {
    formData.data_inserimento = serverTimestamp();
    formData.email_nutrizionista = nutrizionista.email;
    formData.numero_telefono_nutrizionista = nutrizionista.telefono;
    formData.tipologia_dieta = nutrizionista.ruolo;
    await setDoc(doc(collection(db, "diets")), formData);
}

/*
 Funzione che si occupa di aggiornare i dati di una dieta memorizzata su Firestore Database
 */
export async function updateDiet(formData, id) {
    formData.data_inserimento = serverTimestamp();
    await updateDoc(doc(db, "diets", id), formData);
}

/*
 Funzione che si occupa di aggiornare il numero di telefono del nutrizionista su Firestore Database
 */
export async function updateTelephone(formData, id) {
    await updateDoc(doc(db, "diets", id), formData);
}

/*
 Funzione che si occupa di eliminare una dieta memorizzata su Firestore Database
 */
export async function deleteDiet(id) {
    await deleteDoc(doc(db, "diets", id));
}

/*
 Funzione che si occupa di ottenere i dati di una dieta memorizzata su Firestore Database
 */
export async function getDiet(id) {
    const docRef = doc(db, "diets", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log("Documento letto correttamente ");
        console.log(docSnap.data());
        return docSnap.data();
    } else {
        console.log(("Nessun documento trovato con il codice fiscale inserito!"));
    }
}
/* export const fetchUsersWithDiets = async (nutrizionistaUid) => {
    try {
      const userDocRef = doc(db, "users", nutrizionistaUid);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        const nutrizionista = userDocSnapshot.data();
        const userPazienti = nutrizionista.pazienti || [];
  
        const patientsData = [];
  
        for (const userId of userPazienti) {
            const dietsQuery = doc(
                collection(db, "diets"),
                where("uid", "==", userId),
                where("data_fine_dieta", "<=", new Date())
              );

            const dietsQuerySnapshot = await getDoc(dietsQuery);
  
            if (!dietsQuerySnapshot.empty) {
                const patientDocRef = doc(db, "users", userId, "anagrafica", userId);
                const patientDocSnapshot = await getDoc(patientDocRef);
      
                if (patientDocSnapshot.exists()) {
                    const patientData = patientDocSnapshot.data();
                    patientsData.push(patientData);
                  }
                }
              }
        
          return patientsData;
        } else {
          console.log("Nessun nutrizionista trovato con l'UID fornito");
          return null;
        }
      } catch (error) {
        console.error("Errore durante la query degli utenti:", error.message);
        return null;
      }
    }; */
/*
 Funzione che si occupa di codificare l'url della richiesta ricevuto il pasto in input
 */
export const urlEncoded = arr => {
    const regex = /,/gi;
    if (Array.isArray(arr)) {
        return arr.join(",").replace(regex, " and ");
    } else {
        return arr.split(" ").join("%20");
    }
};
