import {collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc} from "firebase/firestore";
import {db} from "../config/firebase-config";

/*
 Funzione che si occupa di memorizzare i dati di un pasto su Firestore Database
 */
export async function addMeal(formData) {
    formData.data_inserimento = serverTimestamp();
    await setDoc(doc(collection(db, "pasti")), formData);
}

/*
 Funzione che si occupa di aggiornare i dati di un pasto memorizzato su Firestore Database
 */
export async function updateMeal(formData, id) {
    formData.data_inserimento = serverTimestamp();
    await updateDoc(doc(db, "pasti", id), formData);
}

/*
 Funzione che si occupa di eliminare un pasto memorizzato su Firestore Database
 */
export async function deleteMeal(id) {
    await deleteDoc(doc(db, "pasti", id));
}

/*
 Funzione per eliminare tutti gli elementi da un array
 */
export function clearArray(array) {
    while (array.length > 0) {
        array.pop();
    }
}
