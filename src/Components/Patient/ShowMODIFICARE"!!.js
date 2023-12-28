import React, {useEffect, useState} from "react";
import {Alert, Badge, Button, Card, Form, Modal, Nav} from "react-bootstrap";
import {useNavigate, useParams} from "react-router-dom";
import Container from "react-bootstrap/Container";
import NewDietImg from "../../img/newDietImage.svg";
import {deleteDiet, updateDiet} from "../../context/DietContext";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../../config/firebase-config";
import {SyncLoader} from "react-spinners";

import {
    faAngleLeft,
    faCheck,
    faFilePdf,
    faFilePen,
    faFloppyDisk,
    faPlus,
    faTrash,
    faXmark
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import DeleteConfirmation from "./DeleteConfirmation";
import PatientSections from "./Patient/PatientSections"
import Spinner from "../Utilities/Spinner";
import {makePdf} from "../Utilities/PdfMaker";
import MealAnalysisModal from "../Meals/MealAnalysisModal";
import {scrollToTop} from "../helpers/scroll";
import {LinkContainer} from "react-router-bootstrap";
//import {Validator} from "@marketto/codice-fiscale-utils";
import {addMeal} from "../../context/MealContext";
import NewMealImg from "../../img/showMealImg.svg";
import MealSections from "../Meals/MealSections";
import {useAuth} from "../../context/AuthContext";

export default function ShowPatient(){
    const {currentUser} = useAuth();
    //Ottengo l'id dall'url
    const {id} = useParams();
    const [warning, setWarning] = useState("");
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState(0);
    const [section, setSection] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMealAnalysis, setLoadingMealAnalysis] = useState(true);
    const [disabled, setDisabled] = useState(true);
    const [progress, setProgress] = useState(true);
    const [displayConfirmationModal, setDisplayConfirmationModal] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState(null);
    const [userInput, setUserInput] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [exists] = useState(false);
    const [showModalNewMeal, setShowModalNewMeal] = useState(false);
    const [reloadOptions, setReloadOptions] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email_nutrizionista: "",
        numero_telefono_nutrizionista: "",
        telegram_bot_passcode: "",
        telegram_user_id: "",
        telegram_chat_id: "",
        telegram_alerts: true,
        telegram_alerts_acqua: true,
        tipologia_dieta: "",
        data_inserimento: "",
        nome_paziente: "",
        cognome_paziente: "",
        email_paziente: "",
        numero_telefono_paziente: "",
        data_nascita_paziente:"",
        luogo_nascita_paziente:"",
        provincia_nasc_paziente:"",
        citta_resid_paziente:"",
        provincia_resid_paziente:"",
        via_residenza_paziente:"",
        sesso_paziente: "",
        codice_fiscale_paziente: "",
    
        esami_prescritti:"",
        esami_effettuati:"",
    
        data_inizio_dieta: "",
        data_fine_dieta: "",
        note_anamnesi: "",
    
        peso_paziente: "",
        altezza_paziente: "",
        circ_fianchi:"",
        circ_braccia:"",
        circ_cosce:"",
        circ_vita:"",  
        circ_spalle:"",
        circ_torace:"",
        circ_testa:"",
        circ_collo:"",
    
        obiettivo_peso: "",
        obiett_fianchi:"",
        obiett_braccia:"",
        obiett_cosce:"",
        obiett_vita:"",  
        obiett_spalle:"",
        obiett_torace:"",
        obiett_testa:"",
        obiett_collo:"",
        kcal_giornaliere: "",
    
        carenze_vitam:"",
        acqua_intrace:"",
        acqua_extrace:"",
        massa_met_att:"",
        met_basale:"",
        massa_magra:"",
        massa_grassa:"",
        angolo_bia:"",
    
        obiett_acqua_intrace:"",
        obiett_acqua_extrace:"",
        obiett_massa_met_att:"",
        obiett_met_basale:"",
        obiett_massa_magra:"",
        obiett_massa_grassa:"",
        obiett_angolo_bia:"",
    
        celiachia:"",
        glutine:"",
        uova:"",
        frutta_secca:"",
        frutta_fresca:"",
        soia:"",
        grano:"",
        lattosio:"",
        crostacei:"",
        nichel:"",
        intolleranze:"",
        allergie:"",
        altroAllergie:"",
        altroIntolleranze:"",
    
        diabete:"",
        obesita:"",
        anoressia:"2",
        cardio:"",
        tumore:"",
        ipotiroidismo:"",
        ipertiroidismo:"",
        ipercolesterolemia:"",
        depressione:"",
        ansia:"",
        altroPatologie:"",
        
    });

    useEffect(() => {
        //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();
     const getPatient = async () => {
            setLoading(true);
            setProgress(true);
            const docRef = doc(db, "users", id);
            await getDoc(docRef)
                .then((doc) => {
                    if (doc.exists()) {
                        setFormData(doc.data());
                        setProgress(false);
                        setLoading(false);
                    } else {
                        //Il paziente richiesta non esiste
                        //L'utente viene indirizzato alla pagina che visualizza tutti i pazienti
                        navigate("/cerca-paziente", {replace: true});
                    }
                });
        };
        getPatient();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //controllo che il codice fiscale del paziente sia valido
    useEffect(() => {
        const checkExists = async () => {
            if (formData.codice_fiscale_paziente.length === 16) {
                setError("");
               /* if (!Validator.codiceFiscale(formData.codice_fiscale_paziente).valid) {
                    setError("Il codice fiscale inserito non è corretto");
                }*/
            }
        };
        checkExists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.codice_fiscale_paziente]);

    //Controllo che le sezioni siano state completate
    useEffect(() => {
        if (formData.nome_paziente !== "" && 
            formData.cognome_paziente !== "" && 
            formData.email_paziente !== "" && 
            formData.numero_telefono_paziente.length == 10 && 
            formData.sesso_paziente !== "" && 
            formData.data_nascita_paziente !== "" &&
            formData.luogo_nascita_paziente !== "" &&
            formData.provincia_nasc_paziente !== "" &&
            formData.citta_resid_paziente !== "" &&
            formData.provincia_resid_paziente !== "" &&
            formData.via_residenza_paziente !== "" 
            /*Validator.codiceFiscale(formData.codice_fiscale_paziente).valid*/) {
            if (!exists) {
                setCheckAnagrafica(true);
            } else {
                setCheckAnagrafica(false);
            }
        } else {
            setCheckAnagrafica(false);
        }
    }, [formData.nome_paziente, formData.cognome_paziente, formData.email_paziente, formData.numero_telefono_paziente, formData.sesso_paziente, formData.data_nascita_paziente, formData.luogo_nascita_paziente, formData.provincia_nasc_paziente, formData.citta_resid_paziente, formData.provincia_resid_paziente, formData.via_residenza_paziente, formData.codice_fiscale_paziente, exists]);
    
    //imposto l'anamnesi
useEffect(() => {
    if (formData.data_inizio_dieta !== "" && formData.data_fine_dieta !== "" ) {
        setCheckAnamnesi(true);
    } else {
        setCheckAnamnesi(false);
    }
}, [formData.data_inizio_dieta, formData.data_fine_dieta]);


//imposto gli esami
useEffect(() => {
    if (formData.esami_effettuati !== "" && formData.esami_prescritti !== "" ) {
        setCheckEsami(true);
    } else {
        setCheckEsami(false);
    }
}, [formData.esami_effettuati, formData.esami_prescritti]); 

//imposto le misure antropometriche e gli obiettivi
useEffect(() => {
    if (formData.altezza_paziente !== "" && 
        formData.peso_paziente !== "" && 
        formData.circ_fianchi !== "" && 
        formData.circ_vita !== "" &&
        formData.circ_torace !== "" &&
        formData.circ_spalle !== "" &&
        formData.circ_testa !== "" &&
        formData.circ_cosce !== "" &&
        formData.circ_collo !== "" &&
        formData.circ_braccia !== "" &&
        formData.obiettivo_peso !== "" && 
        formData.obiett_fianchi !== "" && 
        formData.obiett_vita !== "" &&
        formData.obiett_torace !== "" &&
        formData.obiett_spalle !== "" &&
        formData.obiett_testa !== "" &&
        formData.obiett_cosce !== "" &&
        formData.obiett_collo !== "" &&
        formData.obiett_braccia !== "" &&
        formData.kcal_giornaliere !== "" ) {
        setCheckMisureAntro(true);
    } else {
        setCheckMisureAntro(false);
    }
}, [formData.altezza_paziente,formData.peso_paziente, formData.circ_fianchi,formData.circ_vita,formData.circ_torace,formData.circ_spalle,formData.circ_testa,formData.circ_cosce,formData.circ_collo,formData.circ_braccia,formData.kcal_giornaliere,
    formData.obiettivo_peso, formData.obiett_fianchi,formData.obiett_vita,formData.obiett_torace,formData.obiett_spalle,formData.obiett_testa,formData.obiett_cosce,formData.obiett_collo,formData.obiett_braccia ]);

//scheda altri parametri
useEffect(() => {
    if (formData.carenze_vitam !== "" && 
        formData.acqua_intrace !== "" && 
        formData.acqua_extrace !== "" && 
        formData.massa_met_att !== "" &&
        formData.met_basale !== "" &&
        formData.massa_grassa !== "" &&
        formData.massa_magra !== "" &&
        formData.angolo_bia !== "" &&
        formData.obiett_acqua_intrace !== "" &&
        formData.obiett_acqua_extrace !== "" &&
        formData.obiett_massa_met_att !== "" && 
        formData.obiett_met_basale !== "" && 
        formData.obiett_massa_grassa !== "" &&
        formData.obiett_massa_magra !== "" &&
        formData.obiett_angolo_bia !== "") {
        setCheckMisure(true);
    } else {
        setCheckMisure(false);
    }
}, [formData.carenze_vitam,formData.acqua_intrace, formData.acqua_extrace,formData.massa_met_att,formData.met_basale,formData.massa_grassa,formData.massa_magra,formData.angolo_bia,formData.obiett_acqua_intrace,formData.obiett_acqua_extrace,formData.obiett_met_basale,formData.obiett_met_basale,formData.obiett_massa_grassa,formData.obiett_massa_magra,formData.obiett_angolo_bia  ]);


//intolleranze e allergie
useEffect(() => {
    if (formData.celiachia !== "" && 
        formData.glutine !== "" && 
        formData.uova !== "" && 
        formData.frutta_secca !== "" &&
        formData.frutta_fresca !== "" &&
        formData.soia !== "" &&
        formData.grano !== "" &&
        formData.lattosio !== "" &&
        formData.crostacei !== "" &&
        formData.nichel !== ""
       ) {
        setCheckAllergie(true);
    } else {
        setCheckAllergie(false);
    }
}, [formData.celiachia, formData.glutine, formData.uova,formData.frutta_secca,formData.frutta_fresca,formData.soia,formData.grano,formData.lattosio,formData.crostacei,formData.nichel ]);

//patologie

useEffect(() => {
    if (formData.diabete !== "" && 
        formData.obesita !== "" && 
        formData.anoressia !== "" && 
        formData.cardio !== "" &&
        formData.tumore !== "" &&
        formData.ipotiroidismo !== "" &&
        formData.ipertiroidismo !== "" &&
        formData.ipercolesterolemia !== "" &&
        formData.depressione !== "" &&
        formData.ansia !== ""
       ) {
        setCheckMalattie(true);
    } else {
        setCheckMalattie(false);
    }
}, [formData.diabete, formData.obesita, formData.anoressia,formData.cardio,formData.tumore,formData.ipotiroidismo,formData.ipertiroidismo,formData.ipercolesterolemia,formData.depressione,formData.ansia]);

function handleSubmit(e) {
    setProgress(true);
    e.preventDefault();

 //Controllo che il numero di telefono inserito sia valido
 if (formData.numero_telefono_paziente.length < 10) {
    setProgress(false);
    setLoading(false);
    scrollToTop();
    return setError("Il numero di telefono inserito non è valido");
}

 //Controllo che non vi sia già una dieta esistente con lo stessa email paziente
 if (exists) {
    setProgress(false);
    setLoading(false);
    scrollToTop();
    return setError("L'email immessa è già associata ad un paziente esistente");
}

updatePatient(formData, email_paziente)
.catch(error => console.error(error))
.finally(() => setProgress(false));
}

  //Il modal per la conferma dell'eliminazione viene reso visibile
  function showDeleteModal() {
    setDeleteMessage("Sei sicuro di voler eliminare definitivamente la dieta?");
    setDisplayConfirmationModal(true);
}
  //Il modal per la conferma dell'eliminazione viene reso non più visibile
  function hideConfirmationModal() {
    setDisplayConfirmationModal(false);
}

 //Dopo la conferma il paziente viene effettivamente eliminato dal database
 function submitDelete() {
    setProgress(true);
    deletePatient(email_paziente)
        //L'utente viene indirizzato alla pagina che visualizza tutte le diete create
        .then(r => navigate("/cerca-paziente", {state: "success-delete", replace: true}))
        .catch((error) => {
            console.error(error);
        }).finally(() => setProgress(false));
    setDisplayConfirmationModal(false);
}

    //Viene visualizzato lo spinner durante il caricamento
    if (loading === true) {
        return <Spinner/>;
    }

     //Ottengo la data corrente es. 2022-08-12
     const current = new Date();
     //Converto stringa in oggetto date
     const date = new Date(formData.data_fine_dieta);
 
      
}