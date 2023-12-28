import React, {useEffect, useState} from "react";
import {Alert, Button, Card, Form, Modal, Nav} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import Container from "react-bootstrap/Container";
import {faAngleLeft, faAngleRight, faCheck, faPlus, faXmark} from "@fortawesome/free-solid-svg-icons";
import {createPatient } from "../../context/PatientContext"
import PatientSections from "../Patient/PatientSections";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useAuth} from "../../context/AuthContext";
//import {Validator} from "@marketto/codice-fiscale-utils";
import {scrollToTop} from "../helpers/scroll";
import {collection, doc, arrayUnion, getDocs, query, where, updateDoc } from "firebase/firestore";
import {db} from "../../config/firebase-config";
import {LinkContainer} from "react-router-bootstrap";
import {SyncLoader} from "react-spinners";


export default function NewPatient() {
    const {currentUser} = useAuth();
    const navigate = useNavigate();
    const [showDangerAlert, setShowDangerAlert] = useState(false);
    const [warning, setWarning] = useState("");
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState(0);
    const [section, setSection] = useState(0);
    const [disabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(false);
    const [checkAnagrafica, setCheckAnagrafica] = useState(false);
    const [checkAnanmesi, setCheckAnamnesi] = useState(false);
    const [checkEsami, setCheckEsami] = useState(false);
    const [checkMisureAntro, setCheckMisureAntro] = useState(false);
    const [checkMisure, setCheckMisure] = useState(false);
    const [CheckAllergie, setCheckAllergie] = useState(false);
    const [CheckIntolleranze, setCheckIntolleranze] = useState(false);
    const [CheckPatologie, setCheckPatologie] = useState(false);
    const [exists, setExists] = useState(false);
    const [userInput, setUserInput] = useState([]);
    let uidCurr = currentUser.uid;
 
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
    note_anamnesi: "",
    celiachia:false,
    allergie: [
        { id: '1', nome: 'Glutine', selected: false },
        { id: '2', nome: 'Uova', selected: false },
        { id: '3', nome: 'Frutta Secca', selected: false },
        { id: '4', nome: 'Frutta Fresca', selected: false },
        { id: '5', nome: 'Soia', selected: false },
        { id: '6', nome: 'Grano', selected: false },
        { id: '7', nome: 'Lattosio', selected: false },
        { id: '8', nome: 'Crostacei', selected: false },
        { id: '9', nome: 'Nichel', selected: false },
    ],
    intolleranze: [
        { id: '10', nome: 'Glutine', selected: false },
        { id: '11', nome: 'Uova', selected: false },
        { id: '12', nome: 'Frutta Secca', selected: false },
        { id: '13', nome: 'Frutta Fresca', selected: false },
        { id: '14', nome: 'Soia', selected: false },
        { id: '15', nome: 'Grano', selected: false },
        { id: '16', nome: 'Lattosio', selected: false },
        { id: '17', nome: 'Crostacei', selected: false },
        { id: '18', nome: 'Nichel', selected: false },
    ],
    altroAllergie: "",
    altroIntolleranze: "",

    patologie: [
        { id: '20', nome: 'Celiachia', selected: false },
        { id: '21', nome: 'Diabete', selected: false },
        { id: '22', nome: 'Obesità', selected: false },
        { id: '23', nome: 'Anoressia', selected: false },
        { id: '24', nome: 'Cardiopatia', selected: false },
        { id: '25', nome: 'Tumore', selected: false },
        { id: '26', nome: 'Ipotiroidismo', selected: false },
        { id: '27', nome: 'Ipertiroidismo', selected: false },
        { id: '28', nome: 'Ipercolesterolemia', selected: false },
        { id: '29', nome: 'Depressione', selected: false },
        { id: '30', nome: 'Ansia', selected: false },
    ],
    altroPatologie: "",
 
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
    
});  
//controllo dieta già presente con stessa email paziente
useEffect(() => {
    const checkExists = async () => {
        if (formData.email_paziente !== "" && currentUser) {
            setError("");
            const q = query(collection(db, "users"), where("email", "==", formData.email_paziente));
            await getDocs(q)
                .then((querySnapshot) => {
                    //Esistono diete con la stessa email_paziente
                    if (!querySnapshot.empty) {
                        setExists(true);
                        setError("L'email immessa è già associata ad un utente esistente");
                    } else {
                        setExists(false);
                    }
                }).catch((error) => setError("Si è verificato un errore inaspettato"))
                .finally(() => setProgress(false));
        }
    };
    checkExists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [formData.email_paziente,currentUser]);

 //Controllo che le sezioni siano state completate 
 //scheda anagrafica
 useEffect(() => {
    if (
      formData.nome_paziente !== "" &&
      formData.cognome_paziente !== "" &&
      formData.email_paziente !== "" &&
      formData.numero_telefono_paziente.length >= 10 &&
      formData.sesso_paziente !== "" &&
      formData.data_nascita_paziente !== "" &&
      formData.luogo_nascita_paziente !== "" &&
      formData.provincia_nasc_paziente !== "" &&
      formData.citta_resid_paziente !== "" &&
      formData.provincia_resid_paziente !== "" &&
      formData.via_residenza_paziente !== "" &&
      formData.codice_fiscale_paziente !== ""
      //Validator.codiceFiscale(formData.codice_fiscale_paziente).valid
    ) setCheckAnagrafica(true);
    else {
      setCheckAnagrafica(false);
    }  
  }, [
    formData.nome_paziente,
    formData.cognome_paziente,
    formData.email_paziente,
    formData.numero_telefono_paziente,
    formData.sesso_paziente,
    formData.data_nascita_paziente,
    formData.luogo_nascita_paziente,
    formData.provincia_nasc_paziente,
    formData.citta_resid_paziente,
    formData.provincia_resid_paziente,
    formData.via_residenza_paziente,
    formData.codice_fiscale_paziente,
    exists,
  ]);
  
//imposto l'anamnesi
useEffect(() => {
    if (formData.note_anamnesi !== "" ) {
        setCheckAnamnesi(true);
    } else {
        setCheckAnamnesi(false);
    }
}, [formData.note_anamnesi]);


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
}, [formData.carenze_vitam,formData.acqua_intrace, formData.acqua_extrace,formData.massa_met_att,formData.massa_grassa,formData.massa_magra,formData.angolo_bia,formData.obiett_acqua_intrace,formData.obiett_acqua_extrace,formData.obiett_met_basale,formData.obiett_met_basale,formData.obiett_massa_grassa,formData.obiett_massa_magra,formData.obiett_angolo_bia  ]);

useEffect(() => {
    const isAnyIntolleranzaSelected = formData.intolleranze.some(item => item.selected);
    setCheckIntolleranze(isAnyIntolleranzaSelected);
}, [formData.intolleranze]);

useEffect(() => {
    if (formData.altroAllergie !== "" ) {
        setCheckAllergie(true);
    } 
}, [formData.altroAllergie]); 


useEffect(() => {
    if (formData.altroIntolleranze !== "" ) {
        setCheckIntolleranze(true);
    } 
}, [formData.altroIntolleranze]);

useEffect(() => {
    const isAnyAllergiaSelected =  formData.allergie.some(item => item.selected);
    setCheckAllergie(isAnyAllergiaSelected);
}, [formData.allergie]);

useEffect(() => {
    const isAnyPatologiaSelected =  formData.patologie.some(item => item.selected);
    setCheckPatologie(isAnyPatologiaSelected);
}, [formData.patologie]);


useEffect(() => {
    if (formData.altroPatologie !== "" ) {
        setCheckPatologie(true);
    } 
}, [formData.altroPatologie]);


async function handleCreatePatient(e) {
        setLoading(true);
        e.preventDefault();
        setProgress(true);
        setError("");
        setShowDangerAlert(false);
       // Esegui il controllo che tutte le sezioni siano complete
    if (!checkAnagrafica || !checkEsami || !checkMisureAntro || !checkMisure) {
        setLoading(false);
        setProgress(false);
        scrollToTop();
        return setError("Per poter procedere con la creazione del paziente devi prima completare tutti i campi obbligatori.");
      }  

  //Controllo che il numero di telefono inserito sia valido
    if (formData.numero_telefono_paziente.length !== 10) {
    setProgress(false);
    setLoading(false);
    scrollToTop();
    return setError("Il numero di telefono inserito non è valido");
}

//Controllo che non vi sia già una dieta esistente con la stessa email paziente
if (exists) {
    setProgress(false);
    setLoading(false);
    scrollToTop();
    return setError("L'email immessa è già associata ad un paziente esistente");
}
if (formData.codice_fiscale_paziente.length !== 16 /*&& !Validator.codiceFiscale(formData.codice_fiscale_paziente).valid*/) {
    setLoading(false);
    scrollToTop();
    return setError("Il codice fiscale inserito non è corretto.");
}
createPatient(uidCurr, formData).then(({ success, message, uidPatient }) => {
    if (success) {
        console.log(`Paziente inserito con successo! UID del paziente: ${uidPatient}`);
        
        // Ora puoi eseguire altre operazioni con l'uid del paziente
        // Ad esempio, aggiungere l'ID del paziente all'array "pazienti" nel documento del nutrizionista
        const nutrizionistaDocRef = doc(db, "users", uidCurr);
        // Il documento esiste, aggiungi l'ID del paziente all'array "pazienti"
        const updateData = {
            pazienti: arrayUnion(uidPatient),
        }
            // Aggiorna il documento del nutrizionista con il nuovo campo
        updateDoc(nutrizionistaDocRef, updateData);
            console.log("Campo pazienti aggiunto con successo al documento del nutrizionista!");
            
        
        }
        setProgress(false);
        //L'utente viene indirizzato alla dashboard
     navigate("/dashboard", {replace: true});
    }
).catch((error) => {
    switch (error.code) {
        //L'email inserita risulta già associata ad un account
        case "auth/email-already-in-use":
            setError("L'email inserita è già associata ad un account esistente");
            setShowDangerAlert(true);
            setProgress(false);
            setLoading(false);
            scrollToTop();
            break;
        default :
            setError("La registrazione non è andata a buon fine: " + error);
            setShowDangerAlert(true);
            setProgress(false);
            setLoading(false);
            scrollToTop();
            break;
    }
});
}

return (
    <>
        <Container className={"modal-fullscreen"}
                   style={{
                       background: "linear-gradient(123deg, rgba(247,209,98,1) 30%, rgba(251,149,96,1) 50%, rgba(254,88,94,1) 70%)",
                       backgroundSize: "cover",
                       minHeight: "inherit",
                       padding: 0
                   }}>
            <Container className={"modal-fullscreen text-center"}>
                <Container className={"d-flex flex-column mx-auto my-auto col-12"}
                           style={{minHeight: 450, marginTop: 20}}>
                    <Card className={"col-12 mx-auto"}
                          style={{
                              marginTop: 20,
                              marginBottom: 20,
                              borderRadius: 16,
                              boxShadow: "10px 10px 10px rgba(30,30,30,0.5)",
                              borderLeft: "solid 1px rgba(255,255,255,0.8)",
                              borderTop: "solid 1px rgba(255,255,255,0.8)"
                          }}>
                        <h2 style={{fontFamily: "Arial", marginTop: 10}}>
                            <div className={"d-flex my-auto col-12"}>
                                <div className={"col-12"}>
                                    <div className={"float-start"}
                                         style={{marginTop: 10, marginLeft: 20}}>
                                        <LinkContainer to="/cerca-paziente"
                                                       className={"my-auto"}>
                                            <Button style={{height: 40, width: 100}}
                                                    variant={"warning"}
                                            ><FontAwesomeIcon icon={faAngleLeft}
                                                              color={"black"}/></Button>
                                        </LinkContainer>
                                    </div>
                                </div>
                            </div>
                            <Container
                                    className={"d-flex justify-content-center my-auto align-items-center col-12"}>
                                   <p
                                    className={"my-auto"}
                                    style={{margin: 0}}>Inserimento Paziente</p>
                                </Container>
                            </h2> 
                            {error && <Alert className={"mx-auto col-10 col-md-10 col-lg-6 flex-wrap"}
                                             variant="danger"
                                             dismissible={true}
                                             onClose={() => setError("")}>{error}</Alert>}
                            {warning && <Alert className={"mx-auto col-10 flex-wrap"}
                                               variant="warning"
                                               dismissible={true}
                                               onClose={() => setWarning("")}>{warning}</Alert>}
                            <SyncLoader color="#eb6164"
                                        loading={progress}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            zIndex: 1
                                        }}/>
                <Nav className={"d-flex flex-row justify-content-evenly"}
                        justify
                        variant="tabs"
                        defaultActiveKey="0"
                        activeKey={activeSection}
                        style={{margin: 5}}>
                    <Nav.Item>
                        <Nav.Link className={"link-dark d-inline-flex justify-content-center"}
                                    style={{color: "red"}}
                                    eventKey="0"
                                    onClick={() => {
                                        setSection(0);
                                        setActiveSection(0);
                                        setWarning("");
                                    }}
                        >Anagrafica
                            {checkAnagrafica === true &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faCheck}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        marginTop: 10,
                                                        color: "green",
                                                        height: 15
                                                    }}/>}
                            {checkAnagrafica === false &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faXmark}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "red",
                                                        height: 15
                                                    }}/>}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link className={"link-dark d-inline-flex justify-content-center"}
                                    eventKey="1"
                                    onClick={() => {
                                        setSection(1);
                                        setActiveSection(1);
                                        setWarning("");
                                    }}
                        >Anamnesi
                            {checkAnanmesi === true &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faCheck}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "green",
                                                        height: 15
                                                    }}/>}
                            {checkAnanmesi === false &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faXmark}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "red",
                                                        height: 15
                                                    }}/>}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link className={"link-dark d-inline-flex justify-content-center"}
                                    eventKey="2"
                                    onClick={() => {
                                        setSection(2);
                                        setActiveSection(2);
                                        setWarning("");
                                    }}
                        >Esami
                            {checkEsami === true &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faCheck}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "green",
                                                        height: 15
                                                    }}/>}
                            {checkEsami === false &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faXmark}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "red",
                                                        height: 15
                                                    }}/>}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link className={"link-dark d-inline-flex justify-content-center"}
                                    eventKey="3"
                                    onClick={() => {
                                        setSection(3);
                                        setActiveSection(3);
                                        setWarning("");
                                    }}
                        >Parametri antropometrici
                            {checkMisureAntro === true &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faCheck}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "green",
                                                        height: 15
                                                    }}/>}
                            {checkMisureAntro === false &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faXmark}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "red",
                                                        height: 15
                                                    }}/>}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link className={"link-dark d-inline-flex justify-content-center"}
                                    eventKey="4"
                                    onClick={() => {
                                        setSection(4);
                                        setActiveSection(4);
                                        setWarning("");
                                    }}
                        >Altri parametri
                            {checkMisure === true &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faCheck}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "green",
                                                        height: 15
                                                    }}/>}
                            {checkMisure === false &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faXmark}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "red",
                                                        height: 15
                                                    }}/>}
                        </Nav.Link>
                    </Nav.Item>
                        <Nav.Item>
                        <Nav.Link
                        className={"link-dark d-inline-flex justify-content-center"}
                        eventKey="5"
                        onClick={() => {
                            setSection(5);
                            setActiveSection(5);
                            setWarning("");
                        }}
                    >
                    Allergie
                    {CheckAllergie === true && (
                        <FontAwesomeIcon
                        className={"my-auto"}
                        icon={faCheck}
                        style={{
                            marginRight: 0,
                            marginLeft: 10,
                            color: "green",
                            height: 15,
                        }}
                        />
                    )}
                    {CheckAllergie === false && (
                        <FontAwesomeIcon
                        className={"my-auto"}
                        icon={faXmark}
                        style={{
                            marginRight: 0,
                            marginLeft: 10,
                            color: "red",
                            height: 15,
                        }}
                        />
                    )}
                    </Nav.Link>
                </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                        className={"link-dark d-inline-flex justify-content-center"}
                        eventKey="6"
                        onClick={() => {
                            setSection(6);
                            setActiveSection(6);
                            setWarning("");
                        }}
                        >
                    Intolleranze
                    {CheckIntolleranze === true && (
                        <FontAwesomeIcon
                        className={"my-auto"}
                        icon={faCheck}
                        style={{
                            marginRight: 0,
                            marginLeft: 10,
                            color: "green",
                            height: 15,
                        }}
                        />
                    )}
                    {CheckIntolleranze === false && (
                        <FontAwesomeIcon
                        className={"my-auto"}
                        icon={faXmark}
                        style={{
                            marginRight: 0,
                            marginLeft: 10,
                            color: "red",
                            height: 15,
                        }}
                        />
                    )}
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                        <Nav.Link className={"link-dark d-inline-flex justify-content-center"}
                                    eventKey="7"
                                    onClick={() => {
                                        setSection(7);
                                        setActiveSection(7);
                                        setWarning("");
                                    }}
                        >Patologie
                            {CheckPatologie === true &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faCheck}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "green",
                                                        height: 15
                                                    }}/>}
                            {CheckPatologie === false &&
                                <FontAwesomeIcon className={"my-auto"}
                                                    icon={faXmark}
                                                    style={{
                                                        marginRight: 0,
                                                        marginLeft: 10,
                                                        color: "red",
                                                        height: 15
                                                    }}/>}
                        </Nav.Link>
                    </Nav.Item>
                            </Nav>
                            <Form onSubmit={handleCreatePatient}
                                  className={"d-flex flex-column"}>
                                <PatientSections section={section}
                                              formData={formData}
                                              setFormData={setFormData}
                                              allergie={formData.allergie}
                                              intolleranze={formData.intolleranze}
                                              patologie={formData.patologie}
                                              disabled={disabled}
                                              setProgress={setProgress}
                                              setLoading={setLoading}
                                              setWarning={setWarning}
                                              setError={setError}
                                />
                        <Container className={"d-flex flex-wrap justify-content-evenly"}
                                           style={{marginBottom: 20, marginTop: 20}}>
                                    {section > 0 && (
                                        <Button style={{height: 40, width: 85}}
                                                variant="warning"
                                                onClick={() => {
                                                    setSection(section - 1);
                                                    setActiveSection(activeSection - 1);
                                                    setWarning("");
                                                }}><FontAwesomeIcon icon={faAngleLeft}
                                                                    color={"black"}/></Button> )}
                                    {section < 7 && (
                                        <Button style={{height: 40, width: 85}}
                                                variant={"warning"}
                                                onClick={() => {
                                                    setSection(section + 1);
                                                    setActiveSection(activeSection + 1);
                                                    setWarning("");
                                                }}><FontAwesomeIcon icon={faAngleRight}
                                                                    color={"black"}/></Button> )}
                                    {section === 7 && (
                                        
                                        <button disabled={loading}
                                                type="submit"
                                                className="btn btn-primary"
                                                >
                                            <FontAwesomeIcon
                                                icon={faPlus}
                                                style={{marginRight: 5}}/>Crea
                                                                          Paziente</button> )}
                                </Container>
                            </Form>
                            </Card>
                    </Container>
                </Container>
            </Container>
            </>
 );      
                                                                                       
};