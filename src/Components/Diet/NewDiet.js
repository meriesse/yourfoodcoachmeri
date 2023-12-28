import React, {useEffect, useState} from "react";
import {Alert, Badge, Button, Card, Form, Modal, Nav} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import Container from "react-bootstrap/Container";
import NewDietImg from "../../img/newDietImage.svg";
import {faAngleLeft, faAngleRight, faCheck, faFileImport, faPlus, faXmark} from "@fortawesome/free-solid-svg-icons";
import {addDiet} from "../../context/DietContext";
import {SyncLoader} from "react-spinners";
import DietSections from "./DietSections";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useAuth} from "../../context/AuthContext";
import {Validator} from "@marketto/codice-fiscale-utils";
import {fetchUser} from "../../context/UserContext";
import MealAnalysisModal from "../Meals/MealAnalysisModal";
import {scrollToTop} from "../helpers/scroll";
import {collection, doc, getDoc, getDocs, orderBy, query, where} from "firebase/firestore";
import {db} from "../../config/firebase-config";
import {LinkContainer} from "react-router-bootstrap";
import NewMealImg from "../../img/showMealImg.svg";
import MealSections from "../Meals/MealSections";
import {addMeal} from "../../context/MealContext";
import Select from "react-select";
import { func } from "joi";

/*
 Una dieta è divisa in varie sezioni:
 Anagrafica, Obiettivi, Lunedì, Martedì, ..., Domenica
 L'utente potrà procedere con la creazione della dieta una volta che tutte le sezioni saranno complete
 */
export default function NewDiet() {
    const {currentUser} = useAuth();
    const navigate = useNavigate();
    const [nutrizionista, setNutrizionista] = useState([""]);
    const [warning, setWarning] = useState("");
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState(0);
    const [section, setSection] = useState(0);
    const [disabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(false);
    const [checkPaziente, setCheckPaziente] = useState(false);
    const [checkObiettivi, setCheckObiettivi] = useState(false);
    const [checkLunedi, setCheckLunedi] = useState(false);
    const [checkMartedi, setCheckMartedi] = useState(false);
    const [checkMercoledi, setCheckMercoledi] = useState(false);
    const [checkGiovedi, setCheckGiovedi] = useState(false);
    const [checkVenerdi, setCheckVenerdi] = useState(false);
    const [checkSabato, setCheckSabato] = useState(false);
    const [checkDomenica, setCheckDomenica] = useState(false);
    const [showModalAnalysis, setShowModalAnalysis] = useState(false);
    const [showModalNewMeal, setShowModalNewMeal] = useState(false);
    const [showModalImportDiet, setShowModalImportDiet] = useState(false);
    const [reloadOptions, setReloadOptions] = useState(false);
    const [diets, setDiets] = useState([]);
    const [dietsSelect, setDietsSelect] = useState([]);
    const [dietCopy, setDietCopy] = useState("");
    const [activeKey, setActiveKey] = useState("aggiornaDieta");

    const [food, setFood] = useState([""]);


    const [exists, setExists] = useState(false);
    const [nutrients] = useState([]);
    const [kcals] = useState([]);
    const [proteins] = useState([]);
    const [fats] = useState([]);
    const [carbohydrates] = useState([]);
    const [userInput, setUserInput] = useState([]);
    const [showDetails, setShowDetails] = useState(false);

    const [formDataNewMeal, setFormDataNewMeal] = useState({
        email_nutrizionista: currentUser.email,
        data_inserimento: "",
        nome: "",
        sostituzioni: "",
        preparazione: "",
        colazione: false,
        pranzo: false,
        spuntino: false,
        cena: false
    });

    function AggiornaDieta(){};
    function InserisciDieta(){};
    function makeid() {
        let result = "";
        let length = 6;
        //const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const characters = "0123456789";
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    useEffect(() => {
        const getDiets = async () => {
            setProgress(true);
            const q = query(collection(db, "diets"), where("email_nutrizionista", "==", currentUser.email), orderBy("data_inserimento", "desc"));
            await getDocs(q)
                .then((querySnapshot) => {
                    setDiets(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})));
                    setDietsSelect(querySnapshot.docs.map((doc) => ({value: doc.id, label: doc.data().nome_paziente + " " + doc.data().cognome_paziente})));
                }).catch((error) => setError("Si è verificato un errore inaspettato"))
                .finally(() => setProgress(false));
        };
        getDiets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //Recupero le informazioni del nutrizionista
    useEffect(() => {
        //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();
        setProgress(true);
        fetchUser(currentUser.uid)
            .then((dataSnap) => {
                const info = {
                    nome: dataSnap.nome,
                    cognome: dataSnap.cognome,
                    email: dataSnap.email,
                    telefono: dataSnap.telefono,
                    ruolo: dataSnap.ruolo
                };
                setNutrizionista(info);
                if(dataSnap.ruolo === "Utente"){
                    setFormData({...formData, nome_paziente: dataSnap.nome, cognome_paziente: dataSnap.cognome, email_paziente: dataSnap.email, numero_telefono_paziente: dataSnap.telefono});
                }
            })
            .catch((error) => {
                console.error(error);
            }).then(()=>{
            setProgress(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [formData, setFormData] = useState({
        email_nutrizionista: "",
        numero_telefono_nutrizionista: "",
        telegram_bot_passcode: makeid(),
        telegram_user_id: "",
        telegram_chat_id: "",
        telegram_alerts: true,
        telegram_alerts_acqua: true,
        tipologia_dieta: "",
        data_inserimento: "",
        email_paziente:"",
        data_inizio_dieta: "",
        data_fine_dieta: "",
        kcal_giornaliere: "",
        colazione_lunedi: "",
        colazione_unica: false,
        spuntino_lunedi_mattina: "",
        spuntino_unico_mattina: false,
        pranzo_lunedi: "",
        fascia_oraria_pranzo: "",
        spuntino_lunedi_pomeriggio: "",
        spuntino_unico_pomeriggio: false,
        cena_lunedi: "",
        fascia_oraria_cena: "",

        colazione_martedi: "",
        spuntino_martedi_mattina: "",
        pranzo_martedi: "",
        spuntino_martedi_pomeriggio: "",
        cena_martedi: "",

        colazione_mercoledi: "",
        spuntino_mercoledi_mattina: "",
        pranzo_mercoledi: "",
        spuntino_mercoledi_pomeriggio: "",
        cena_mercoledi: "",

        colazione_giovedi: "",
        spuntino_giovedi_mattina: "",
        pranzo_giovedi: "",
        spuntino_giovedi_pomeriggio: "",
        cena_giovedi: "",

        colazione_venerdi: "",
        spuntino_venerdi_mattina: "",
        pranzo_venerdi: "",
        spuntino_venerdi_pomeriggio: "",
        cena_venerdi: "",

        colazione_sabato: "",
        spuntino_sabato_mattina: "",
        pranzo_sabato: "",
        spuntino_sabato_pomeriggio: "",
        cena_sabato: "",

        colazione_domenica: "",
        spuntino_domenica_mattina: "",
        pranzo_domenica: "",
        spuntino_domenica_pomeriggio: "",
        cena_domenica: ""

    });


    //controllo dieta già presente con stessa email paziente
    useEffect(() => {
        const checkExists = async () => {
            if (formData.email_paziente !== "") {
                setError("");
                const q = query(collection(db, "diets"), where("email_paziente", "==", formData.email_paziente), where("email_nutrizionista", "==", currentUser.email));
                await getDocs(q)
                    .then((querySnapshot) => {
                        console.log(querySnapshot.docs);
                        //Esistono diete con la stessa email_paziente
                        if (!querySnapshot.empty) {
                            setExists(true);
                            setError("L'email immessa è già associato ad una dieta esistente," +
                                " puoi modificarla o eliminarla nell'apposita sezione");
                        } else {
                            setExists(false);
                        }
                    }).catch((error) => setError("Si è verificato un errore inaspettato"))
                    .finally(() => setProgress(false));
            }
        };
        checkExists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.email_paziente]);

    //controllo che il codice fiscale del paziente sia valido
   /* useEffect(() => {
        const checkExists = async () => {
            if (formData.codice_fiscale_paziente.length === 16) {
                setError("");
                if (!Validator.codiceFiscale(formData.codice_fiscale_paziente).valid) {
                    setError("Il codice fiscale inserito non è corretto");
                }
            }
        };
        checkExists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.codice_fiscale_paziente]); */


    //Controllo che le sezioni siano state completate
   /* useEffect(() => {
        if (formData.nome_paziente !== "" && formData.cognome_paziente !== "" && formData.email_paziente !== "" && formData.numero_telefono_paziente.length === 10 && formData.eta_paziente !== "" && formData.sesso_paziente !== "" /*&& Validator.codiceFiscale(formData.codice_fiscale_paziente).valid) {
            if (!exists) {
                setCheckAnagrafica(true);
            } else {
                setCheckAnagrafica(false);
            }
        } else {
            setCheckAnagrafica(false);
        }
    }, [formData.nome_paziente, formData.cognome_paziente, formData.email_paziente, formData.numero_telefono_paziente, formData.eta_paziente, formData.sesso_paziente, /*formData.cf_paz, exists]);
*/
    useEffect(() => {
        if (formData.data_inizio_dieta !== "" && formData.data_fine_dieta !== "" && formData.kcal_giornaliere) {
            setCheckObiettivi(true);
        } else {
            setCheckObiettivi(false);
        }
    }, [formData.data_inizio_dieta, formData.data_fine_dieta, formData.kcal_giornaliere]);

    useEffect(() => {
        if (formData.colazione_lunedi !== "" && formData.spuntino_lunedi_mattina !== "" && formData.pranzo_lunedi !== "" && formData.spuntino_lunedi_pomeriggio !== "" && formData.cena_lunedi !== "") {
            setCheckLunedi(true);
        } else {
            setCheckLunedi(false);
        }
    }, [formData.colazione_lunedi, formData.spuntino_lunedi_mattina, formData.pranzo_lunedi, formData.spuntino_lunedi_pomeriggio,
        formData.cena_lunedi]);

    useEffect(() => {
        if (formData.colazione_martedi !== "" && formData.spuntino_martedi_mattina && formData.pranzo_martedi !== "" && formData.spuntino_martedi_pomeriggio !== "" && formData.cena_martedi !== "") {
            setCheckMartedi(true);
        } else {
            setCheckMartedi(false);
        }
    }, [formData.colazione_martedi, formData.spuntino_martedi_mattina, formData.pranzo_martedi, formData.spuntino_martedi_pomeriggio,
        formData.cena_martedi]);

    useEffect(() => {
        if (formData.colazione_mercoledi !== "" && formData.spuntino_mercoledi_mattina !== "" && formData.pranzo_mercoledi !== "" && formData.spuntino_mercoledi_pomeriggio !== "" && formData.cena_mercoledi !== "") {
            setCheckMercoledi(true);
        } else {
            setCheckMercoledi(false);
        }
    }, [formData.colazione_mercoledi, formData.spuntino_mercoledi_mattina, formData.pranzo_mercoledi, formData.spuntino_mercoledi_pomeriggio,
        formData.cena_mercoledi]);

    useEffect(() => {
        if (formData.colazione_giovedi !== "" && formData.spuntino_giovedi_mattina && formData.pranzo_giovedi !== "" && formData.spuntino_giovedi_pomeriggio !== "" && formData.cena_giovedi !== "") {
            setCheckGiovedi(true);
        } else {
            setCheckGiovedi(false);
        }
    }, [formData.colazione_giovedi, formData.spuntino_giovedi_mattina, formData.pranzo_giovedi, formData.spuntino_giovedi_pomeriggio,
        formData.cena_giovedi]);

    useEffect(() => {
        if (formData.colazione_venerdi !== "" && formData.spuntino_venerdi_mattina !== "" && formData.pranzo_venerdi !== "" && formData.spuntino_venerdi_pomeriggio !== "" && formData.cena_venerdi !== "") {
            setCheckVenerdi(true);
        } else {
            setCheckVenerdi(false);
        }
    }, [formData.colazione_venerdi, formData.spuntino_venerdi_mattina, formData.pranzo_venerdi, formData.spuntino_venerdi_pomeriggio,
        formData.cena_venerdi]);

    useEffect(() => {
        if (formData.colazione_sabato !== "" && formData.spuntino_sabato_mattina && formData.pranzo_sabato !== "" && formData.spuntino_sabato_pomeriggio !== "" && formData.cena_sabato !== "") {
            setCheckSabato(true);
        } else {
            setCheckSabato(false);
        }
    }, [formData.colazione_sabato, formData.spuntino_sabato_mattina, formData.pranzo_sabato, formData.spuntino_sabato_pomeriggio,
        formData.cena_sabato]);

    useEffect(() => {
        if (formData.colazione_domenica !== "" && formData.spuntino_domenica_mattina !== "" && formData.pranzo_domenica !== "" && formData.spuntino_domenica_pomeriggio !== "" && formData.cena_domenica !== "") {
            setCheckDomenica(true);
        } else {
            setCheckDomenica(false);
        }
    }, [formData.colazione_domenica, formData.spuntino_domenica_mattina, formData.pranzo_domenica, formData.spuntino_domenica_pomeriggio,
        formData.cena_domenica]);

        const handleAggiornaDieta = async () => {
            // Logica per l'aggiornamento della dieta

            await AggiornaDieta();
          };
          
          const handleInserisciNuovaDieta = async () => {
            // Logica per l'inserimento di una nuova dieta
            await InserisciDieta();
          };

    function handleSubmitDiet(e) {
        e.preventDefault();
        setLoading(true);
        setProgress(true);

        
        //Controlle che tutte le sezioni siano complete
        if (checkPaziente === false || checkObiettivi === false || checkLunedi === false
            || checkMartedi === false || checkMercoledi === false || checkGiovedi === false
            || checkVenerdi === false || checkSabato === false || checkDomenica === false) {
            setProgress(false);
            setLoading(false);
            scrollToTop();
            return setError("Per poter procedere con la creazione della dieta devi prima completare tutti i campi necessari, le sezioni non complete sono contrassegnate con una ❌");
        }

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
            return setError("L'email immessa è già associato ad una dieta esistente," +
                " puoi modificarla o eliminarla nell'apposita sezione");
        }

       addDiet(formData, nutrizionista)
            .then(r => {
                //L'utente viene indirizzato alla pagina che visualizza tutte le diete create
                navigate("/diete", {state: "success-create", replace: true});
            }).catch(() => setError("Si è verificato un errore inaspettato"))
            .finally(() => {
                setProgress(false);
                setLoading(false);
            }); 

        if (section === 0) {
            if (activeKey === "aggiornaDieta") {
                handleAggiornaDieta();
            } else if (activeKey === "inserisciNuovaDieta") {
                handleInserisciNuovaDieta();
            }
            } 
    }

    const getDiet = async (id) => {
        setLoading(true);
        setProgress(true);
        const docRef = doc(db, "diets", id);
        await getDoc(docRef)
            .then((doc) => {
                if (doc.exists()) {
                    setFormData({...doc.data(), nome_paziente:"",
                        cognome_paziente:"",
                        email_paziente:"",
                        numero_telefono_paziente:"",
                        eta_paziente:"",
                        sesso_paziente:"",
                        codice_fiscale_paziente:"",
                        telegram_user_id:"",
                        telegram_chat_id:"",
                        telegram_bot_passcode: makeid()
                    });
                    //setFormData(doc.data());
                }
            }).then(()=>{
                setProgress(false);
                setLoading(false);
                setShowModalImportDiet(false);
            });
    };


    function handleDietCopy(e) {
        e.preventDefault();
        setProgress(true);
        setLoading(true);
        getDiet(dietCopy.value);
    }

    function handleSubmitMeal(e) {
        e.preventDefault();
        setProgress(true);
        setLoading(true);

        /*if (!mealNameRegex.test(formData.nome)) {
         setProgress(false);
         setLoading(false);
         scrollToTop();
         return setError("Il titolo del pasto deve contenere il nome dell'ingrediente e la sua quantità, in caso di più ingredienti questi devono essere separati da una virgola: es. pane 50 gr, petto di pollo 80 gr");
         }*/

        if (formDataNewMeal.colazione === false && formDataNewMeal.pranzo === false &&
            formDataNewMeal.spuntino === false && formDataNewMeal.cena === false) {
            setProgress(false);
            setLoading(false);
            scrollToTop();
            return setError("Per poter creare il pasto devi prima selezionare una categoria!");
        }

        addMeal(formDataNewMeal)
            .then(r => {
                console.log("Pasto creato correttamente");
                setReloadOptions(true);
                setProgress(false);
                setLoading(false);
                setShowModalNewMeal(false);
            })
            .catch(error => console.error(error))
            .finally(() => {
                //Inizializzo il form per un nuovo pasto
                formDataNewMeal.data_inserimento = "";
                formDataNewMeal.nome = "";
                formDataNewMeal.sostituzioni = "";
                formDataNewMeal.preparazione = "";
                formDataNewMeal.colazione = false;
                formDataNewMeal.pranzo = false;
                formDataNewMeal.spuntino = false;
                formDataNewMeal.cena = false;
            setProgress(false);
            setLoading(false);
        });
    }

    //Il modal per la creazione di un nuovo pasto viene reso non più visibile
    function onHideNewMealModal() {
        setShowModalNewMeal(false);
    }

    //Il modal per l'importazione dei dati di una dieta esistente viene reso non più visibile
    function onHideImportDietModal() {
        setShowModalImportDiet(false);
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
                                            <LinkContainer to="/diete"
                                                           className={"my-auto"}>
                                                <Button style={{height: 40, width: 100}}
                                                        variant={"warning"}
                                                ><FontAwesomeIcon icon={faAngleLeft}
                                                                  color={"black"}/></Button>
                                            </LinkContainer>
                                        </div>
                                        <div className={"float-end"}
                                             style={{marginRight: 17, marginTop: 10}}>
                                            <h4 className={"align-self-end top-0"}>
                                                <button disabled={loading}
                                                        style={{width: 157, marginBottom: 10}}
                                                        type="submit"
                                                        className="btn btn-primary"
                                                        onClick={(e) => setShowModalImportDiet(true)}
                                                ><FontAwesomeIcon
                                                    icon={faFileImport}
                                                    style={{marginRight: 5}}/>Copia da dieta
                                                </button>
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                                <Container
                                    className={"d-flex justify-content-center my-auto align-items-center col-12"}>
                                    <img src={NewDietImg}
                                         style={{height: 70, width: 70, marginRight: 10}}
                                         alt={"Nuova dieta"}/><p
                                    className={"my-auto"}
                                    style={{margin: 0}}>Creazione Dieta</p>
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
                            {(!loading && nutrients.length > 0) && (
                                <MealAnalysisModal
                                    showModal={showModalAnalysis}
                                    setShowModal={setShowModalAnalysis}
                                    showDetails={showDetails}
                                    setShowDetails={setShowDetails}
                                    loading={loading}
                                    userInput={userInput}
                                    food={food}
                                    nutrients={nutrients}
                                    kcals={kcals}
                                    proteins={proteins}
                                    fats={fats}
                                    carbohydrates={carbohydrates}
                                />
                            )}
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
                                                setCheckPaziente(!checkPaziente)
                                                  setSection(0);
                                                  setActiveSection(0);
                                                  setWarning("");
                                              }}
                                    >Paziente         
                                     {checkPaziente ? (
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 marginTop: 10,
                                                                 color: "green",
                                                                 height: 15
                                                                }}
                                                                />
                                                              ) : (
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
                                              eventKey="1"
                                              onClick={() => {
                                                  setSection(1);
                                                  setActiveSection(1);
                                                  setWarning("");
                                              }}>Obiettivi
                                        {checkObiettivi === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {checkObiettivi === false &&
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
                                              }}>Lunedì
                                        {checkLunedi === true && <FontAwesomeIcon className={"my-auto"}
                                                                                  icon={faCheck}
                                                                                  style={{
                                                                                      marginRight: 0,
                                                                                      marginLeft: 10,
                                                                                      color: "green",
                                                                                      height: 15
                                                                                  }}/>}
                                        {checkLunedi === false && <FontAwesomeIcon className={"my-auto"}
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
                                              }}>Martedì
                                        {checkMartedi === true && <FontAwesomeIcon className={"my-auto"}
                                                                                   icon={faCheck}
                                                                                   style={{
                                                                                       marginRight: 0,
                                                                                       marginLeft: 10,
                                                                                       color: "green",
                                                                                       height: 15
                                                                                   }}/>}
                                        {checkMartedi === false && <FontAwesomeIcon className={"my-auto"}
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
                                              }}>Mercoledì
                                        {checkMercoledi === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {checkMercoledi === false &&
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
                                              eventKey="5"
                                              onClick={() => {
                                                  setSection(5);
                                                  setActiveSection(5);
                                                  setWarning("");
                                              }}>Giovedì
                                        {checkGiovedi === true && <FontAwesomeIcon className={"my-auto"}
                                                                                   icon={faCheck}
                                                                                   style={{
                                                                                       marginRight: 0,
                                                                                       marginLeft: 10,
                                                                                       color: "green",
                                                                                       height: 15
                                                                                   }}/>}
                                        {checkGiovedi === false && <FontAwesomeIcon className={"my-auto"}
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
                                              eventKey="6"
                                              onClick={() => {
                                                  setSection(6);
                                                  setActiveSection(6);
                                                  setWarning("");
                                              }}>Venerdì
                                        {checkVenerdi === true && <FontAwesomeIcon className={"my-auto"}
                                                                                   icon={faCheck}
                                                                                   style={{
                                                                                       marginRight: 0,
                                                                                       marginLeft: 10,
                                                                                       color: "green",
                                                                                       height: 15
                                                                                   }}/>}
                                        {checkVenerdi === false && <FontAwesomeIcon className={"my-auto"}
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
                                              eventKey="7"
                                              onClick={() => {
                                                  setSection(7);
                                                  setActiveSection(7);
                                                  setWarning("");
                                              }}>Sabato
                                        {checkSabato === true && <FontAwesomeIcon className={"my-auto"}
                                                                                  icon={faCheck}
                                                                                  style={{
                                                                                      marginRight: 0,
                                                                                      marginLeft: 10,
                                                                                      color: "green",
                                                                                      height: 15
                                                                                  }}/>}
                                        {checkSabato === false && <FontAwesomeIcon className={"my-auto"}
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
                                              eventKey="8"
                                              onClick={() => {
                                                  setSection(8);
                                                  setActiveSection(8);
                                                  setWarning("");
                                              }}>Domenica
                                        {checkDomenica === true && <FontAwesomeIcon className={"my-auto"}
                                                                                    icon={faCheck}
                                                                                    style={{
                                                                                        marginRight: 0,
                                                                                        marginLeft: 10,
                                                                                        color: "green",
                                                                                        height: 15
                                                                                    }}/>}
                                        {checkDomenica === false &&
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
                            <Form onSubmit={handleSubmitDiet}
                                  className={"d-flex flex-column"}>
                                <DietSections section={section}
                                              formData={formData}
                                              setFormData={setFormData}
                                              disabled={disabled}
                                              setProgress={setProgress}
                                              setLoading={setLoading}
                                              setFood={setFood}
                                              setUserInput={setUserInput}
                                              nutrients={nutrients}
                                              kcals={kcals}
                                              carbohydrates={carbohydrates}
                                              fats={fats}
                                              proteins={proteins}
                                              setShowModalAnalysis={setShowModalAnalysis}
                                              setShowModalNewMeal={setShowModalNewMeal}
                                              setWarning={setWarning}
                                              setError={setError}
                                              reloadOptions={reloadOptions}
                                              setReloadOptions={setReloadOptions}
                                              checkPaziente={checkPaziente}
                                              setCheckPaziente={setCheckPaziente}
                                              activeKey= {activeKey}
                                              setActiveKey={setActiveKey}
                                />
                                <Container className={"d-flex flex-wrap justify-content-evenly"}
                                           style={{marginBottom: 20, marginTop: 20}}>
                                    {section === 0 &&
                                        <Button style={{height: 40, width: 85}}
                                                variant={"warning"}
                                                onClick={() => {
                                                    setSection(section - 1);
                                                    setActiveSection(activeSection - 1);
                                                    setWarning("");
                                                }}><FontAwesomeIcon icon={faAngleLeft}
                                                                    color={"black"}/></Button>}      
                                    {section > 1 &&
                                        <Button style={{height: 40, width: 85}}
                                                variant={"warning"}
                                                onClick={() => {
                                                   
                                                    setWarning("");
                                                }}><FontAwesomeIcon icon={faAngleLeft}
                                                                    color={"black"}/></Button>}
                                    {section < 8 &&
                                        <Button style={{height: 40, width: 85}}
                                                variant={"warning"}
                                                onClick={() => {
                                                    setSection(section + 1);
                                                    setActiveSection(activeSection + 1);
                                                    setWarning("");
                                                }}><FontAwesomeIcon icon={faAngleRight}
                                                                    color={"black"}/></Button>}
                                    {section === 8 &&
                                        <button disabled={loading}
                                                type="submit"
                                                className="btn btn-primary">
                                            <FontAwesomeIcon
                                                icon={faPlus}
                                                style={{marginRight: 5}}/>Crea
                                                                          Dieta</button>}
                                </Container>
                            </Form>
                        </Card>
                    </Container>
                </Container>
            </Container>
            <Modal
                show={showModalNewMeal}
                onHide={onHideNewMealModal}
                size={"lg"}
                aria-labelledby="contained-modal-title-vcenter"
                centered

            >
                <Modal.Header closeButton>
                    <Modal.Title className={"w-100 text-center"}>
                        <Container
                            className={"d-flex justify-content-center my-auto align-items-center col-12"}>
                            <img src={NewMealImg}
                                 style={{height: 70, width: 70, marginRight: 10}}
                                 alt={"Nuovo pasto"}/>
                            <p className={"my-auto"}
                               style={{margin: 0}}>Creazione Pasto</p>
                        </Container>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert className={"mx-auto col-10 flex-wrap"}
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
                    <Form onSubmit={handleSubmitMeal}
                          className={"d-flex flex-column"}>
                        <MealSections formData={formDataNewMeal}
                                      setFormData={setFormDataNewMeal}
                                      disabled={disabled}
                        />
                        <Container className={"d-flex flex-wrap justify-content-evenly"}
                                   style={{marginBottom: 20, marginTop: 20}}>
                            {/*<Button variant="secondary"
                             style={{width: 157, marginBottom: 10}}
                             onClick={(e) => handleSubmitAnalysis(e, formData.nome)}><FontAwesomeIcon
                             icon={faChartSimple}
                             style={{marginRight: 5}}/>Analizza Pasto</Button>*/}
                            <button disabled={loading}
                                    style={{width: 157, marginBottom: 10}}
                                    type="submit"
                                    className="btn btn-primary"><FontAwesomeIcon
                                icon={faPlus}
                                style={{marginRight: 5}}/>Crea Pasto
                            </button>
                        </Container>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal
                show={showModalImportDiet}
                onHide={onHideImportDietModal}
                size={"lg"}
                aria-labelledby="contained-modal-title-vcenter"
                centered

            >
                <Modal.Header closeButton>
                    <Modal.Title className={"w-100 text-center"}>
                        <Container
                            className={"d-flex justify-content-center my-auto align-items-center col-12"}>
                            <img src={NewDietImg}
                                 style={{height: 70, width: 70, marginRight: 10}}
                                 alt={"Nuovo pasto"}/>
                            <p className={"my-auto"}
                               style={{margin: 0}}>Copia da Dieta</p>
                        </Container>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container className={"text-center d-flex flex-wrap mx-auto justify-content-center"}>
                        <p className={"col-12 col-sm-10 col-md-8 col-lg-8"} style={{padding:10}}>Copia i pasti che hai già impostato per un'altra dieta con un solo click. Una volta fatto, ti basterà inserire i tuoi dati anagrafici e, se necessario, modificare gli obiettivi.</p>
                    </Container>
                    {error && <Alert className={"mx-auto col-10 flex-wrap"}
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
                    <Form onSubmit={handleDietCopy}
                          className={"d-flex flex-column text-center"}>
                        <Select
                            inputId={"dietCopyId"}
                            options={dietsSelect}
                            placeholder="Seleziona la dieta da copiare..."
                            value={dietCopy}
                            onChange={(e) => {setDietCopy(e)}}
                            className={"col-12 col-lg-10 mx-auto"}
                            required
                        />
                        <Container className={"d-flex flex-wrap justify-content-evenly"}
                                   style={{marginBottom: 20, marginTop: 20}}>
                            <button disabled={loading}
                                    style={{width: 157, marginBottom: 10}}
                                    type="submit"
                                    className="btn btn-primary"><FontAwesomeIcon
                                icon={faFileImport}
                                style={{marginRight: 5}}/>Copia
                            </button>
                        </Container>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}
