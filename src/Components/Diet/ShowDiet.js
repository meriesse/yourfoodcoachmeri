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
import DietSections from "./DietSections";
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

/*
 Funzione che si occupa di mostrare i dettagli di una singola dieta
 La visualizzazione è divisa in varie sezioni:
 Anagrafica, Obiettivi, Lunedì, Martedì, ..., Domenica
 L'utente ha la possibilità di Modificare la dieta, Eliminare la dieta o Generare un PDF
 */
export default function ShowDiet() {
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
    const [showModalAnalysis, setShowModalAnalysis] = useState(false);
    const [checkAnagrafica, setCheckAnagrafica] = useState(false);
    const [checkObiettivi, setCheckObiettivi] = useState(false);
    const [checkLunedi, setCheckLunedi] = useState(false);
    const [checkMartedi, setCheckMartedi] = useState(false);
    const [checkMercoledi, setCheckMercoledi] = useState(false);
    const [checkGiovedi, setCheckGiovedi] = useState(false);
    const [checkVenerdi, setCheckVenerdi] = useState(false);
    const [checkSabato, setCheckSabato] = useState(false);
    const [checkDomenica, setCheckDomenica] = useState(false);
    const [nutrients] = useState([]);
    const [kcals] = useState([]);
    const [proteins] = useState([]);
    const [fats] = useState([]);
    const [carbohydrates] = useState([]);
    const [food, setFood] = useState([""]);
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
        eta_paziente: "",
        sesso_paziente: "",
        codice_fiscale_paziente: "",
        peso_paziente: "",
        altezza_paziente: "",
        data_inizio_dieta: "",
        data_fine_dieta: "",
        obiettivo_peso: "",
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
            .catch(error => console.error(error)).finally(() => {
            setProgress(false);
            setLoading(false);
        });
    }

    //Il modal per la creazione di un nuovo viene reso non più visibile
    function onHideNewMealModal() {
        setShowModalNewMeal(false);
    }

    useEffect(() => {
        //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();
     const getDiet = async () => {
            setLoading(true);
            setProgress(true);
            const docRef = doc(db, "diets", id);
            await getDoc(docRef)
                .then((doc) => {
                    if (doc.exists()) {
                        setFormData(doc.data());
                        setProgress(false);
                        setLoading(false);
                    } else {
                        //La dieta richiesta non esiste
                        //L'utente viene indirizzato alla pagina che visualizza tutte le diete create
                        navigate("/diete", {replace: true});
                    }
                });
        };
        getDiet();
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
        if (formData.nome_paziente !== "" && formData.cognome_paziente !== "" && formData.email_paziente !== "" && formData.numero_telefono_paziente.length >= 10 && formData.eta_paziente !== "" && formData.sesso_paziente !== "" /*&& Validator.codiceFiscale(formData.codice_fiscale_paziente).valid*/) {
            if (!exists) {
                setCheckAnagrafica(true);
            } else {
                setCheckAnagrafica(false);
            }
        } else {
            setCheckAnagrafica(false);
        }
    }, [formData.nome_paziente, formData.cognome_paziente, formData.email_paziente, formData.numero_telefono_paziente, formData.eta_paziente, formData.sesso_paziente, formData.codice_fiscale_paziente, exists]);

    useEffect(() => {
        if (formData.peso_paziente !== "" && formData.altezza_paziente !== "" && formData.data_inizio_dieta !== "" && formData.data_fine_dieta !== "" && formData.obiettivo_peso !== "" && formData.kcal_giornaliere) {
            setCheckObiettivi(true);
        } else {
            setCheckObiettivi(false);
        }
    }, [formData.peso_paziente, formData.altezza_paziente, formData.data_inizio_dieta,
        formData.data_fine_dieta, formData.obiettivo_peso, formData.kcal_giornaliere]);

    useEffect(() => {
        if (formData.colazione_lunedi !== "" && formData.pranzo_lunedi !== "" && formData.spuntino_lunedi !== "" && formData.cena_lunedi !== "") {
            setCheckLunedi(true);
        } else {
            setCheckLunedi(false);
        }
    }, [formData.colazione_lunedi, formData.pranzo_lunedi, formData.spuntino_lunedi,
        formData.cena_lunedi]);

    useEffect(() => {
        if (formData.colazione_martedi !== "" && formData.pranzo_martedi !== "" && formData.spuntino_martedi !== "" && formData.cena_martedi !== "") {
            setCheckMartedi(true);
        } else {
            setCheckMartedi(false);
        }
    }, [formData.colazione_martedi, formData.pranzo_martedi, formData.spuntino_martedi,
        formData.cena_martedi]);

    useEffect(() => {
        if (formData.colazione_mercoledi !== "" && formData.pranzo_mercoledi !== "" && formData.spuntino_mercoledi !== "" && formData.cena_mercoledi !== "") {
            setCheckMercoledi(true);
        } else {
            setCheckMercoledi(false);
        }
    }, [formData.colazione_mercoledi, formData.pranzo_mercoledi, formData.spuntino_mercoledi,
        formData.cena_mercoledi]);

    useEffect(() => {
        if (formData.colazione_giovedi !== "" && formData.pranzo_giovedi !== "" && formData.spuntino_giovedi !== "" && formData.cena_giovedi !== "") {
            setCheckGiovedi(true);
        } else {
            setCheckGiovedi(false);
        }
    }, [formData.colazione_giovedi, formData.pranzo_giovedi, formData.spuntino_giovedi,
        formData.cena_giovedi]);

    useEffect(() => {
        if (formData.colazione_venerdi !== "" && formData.pranzo_venerdi !== "" && formData.spuntino_venerdi !== "" && formData.cena_venerdi !== "") {
            setCheckVenerdi(true);
        } else {
            setCheckVenerdi(false);
        }
    }, [formData.colazione_venerdi, formData.pranzo_venerdi, formData.spuntino_venerdi,
        formData.cena_venerdi]);

    useEffect(() => {
        if (formData.colazione_sabato !== "" && formData.pranzo_sabato !== "" && formData.spuntino_sabato !== "" && formData.cena_sabato !== "") {
            setCheckSabato(true);
        } else {
            setCheckSabato(false);
        }
    }, [formData.colazione_sabato, formData.pranzo_sabato, formData.spuntino_sabato,
        formData.cena_sabato]);

    useEffect(() => {
        if (formData.colazione_domenica !== "" && formData.pranzo_domenica !== "" && formData.spuntino_domenica !== "" && formData.cena_domenica !== "") {
            setCheckDomenica(true);
        } else {
            setCheckDomenica(false);
        }
    }, [formData.colazione_domenica, formData.pranzo_domenica, formData.spuntino_domenica,
        formData.cena_domenica]);


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
            return setError("L'email immessa è già associato ad una dieta esistente," +
                " puoi modificarla o eliminarla nell'apposita sezione");
        }

        updateDiet(formData, id)
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

    //Dopo la conferma la diete viene effettivamente eliminata dal database
    function submitDelete() {
        setProgress(true);
        deleteDiet(id)
            //L'utente viene indirizzato alla pagina che visualizza tutte le diete create
            .then(r => navigate("/diete", {state: "success-delete", replace: true}))
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

    //Handler per la generazione del PDF
    function handlePfGeneration() {
        makePdf(formData);
    }

    return (
        <>
            {loading === false && <Container className={"modal-fullscreen"}
                                             style={{
                                                 background: "linear-gradient(123deg, rgba(247,209,98,1) 30%, rgba(251,149,96,1) 50%, rgba(254,88,94,1) 70%)",
                                                 backgroundSize: "cover",
                                                 minHeight: "inherit",
                                                 padding: 0
                                             }}>
                <Container className={"modal-fullscreen text-center"}>
                    <Container className={"d-flex flex-column mx-auto my-auto"}
                               style={{minHeight: 450, marginTop: 20}}>
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
                                loading={loadingMealAnalysis}
                                userInput={userInput}
                                food={food}
                                nutrients={nutrients}
                                kcals={kcals}
                                proteins={proteins}
                                fats={fats}
                                carbohydrates={carbohydrates}
                            />
                        )}
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
                                            {!progress ? (
                                                <>{current > date
                                                    ?
                                                    <h4 className={"align-self-end top-0"}><Badge pill
                                                                                                  bg="danger">Scaduta
                                                                                                              il {formData.data_fine_dieta}</Badge>
                                                    </h4>
                                                    :
                                                    <h4 className={"align-self-end top-0"}><Badge pill
                                                                                                  bg="secondary">Fine
                                                                                                                 dieta: {formData.data_fine_dieta}</Badge>
                                                    </h4>
                                                }</>
                                            ) : (<></>)}
                                        </div>
                                    </div>
                                </div>
                                <Container
                                    className={"d-flex justify-content-center my-auto align-items-center col-12"}>
                                    {disabled
                                        ?
                                        <>
                                            <img src={NewDietImg}
                                                 style={{height: 70, width: 70, marginRight: 10}}
                                                 alt={"Visualizzazione dieta"}/> <p
                                            style={{margin: 0}}>Visualizzazione Dieta</p>
                                        </>
                                        : <>
                                            <img src={NewDietImg}
                                                 style={{height: 70, width: 70, marginRight: 10}}
                                                 alt={"Modifica dieta"}/><p
                                            style={{margin: 0}}>Modifica Dieta</p>
                                        </>
                                    }
                                </Container>
                            </h2>
                            {error && <Alert className={"mx-auto col-10 col-md-10 col-lg-6 flex-wrap"}
                                             variant="danger"
                                             dismissible={true}
                                             onClose={() => setError("")}>{error}</Alert>}
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
                                        {disabled === false && checkAnagrafica === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 marginTop: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {disabled === false && checkAnagrafica === false &&
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
                                              }}>Obiettivi
                                        {disabled === false && checkObiettivi === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {disabled === false && checkObiettivi === false &&
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
                                        {disabled === false && checkLunedi === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {disabled === false && checkLunedi === false &&
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
                                              }}>Martedì
                                        {disabled === false && checkMartedi === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {disabled === false && checkMartedi === false &&
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
                                              }}>Mercoledì
                                        {disabled === false && checkMercoledi === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {disabled === false && checkMercoledi === false &&
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
                                        {disabled === false && checkGiovedi === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {disabled === false && checkGiovedi === false &&
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
                                              eventKey="6"
                                              onClick={() => {
                                                  setSection(6);
                                                  setActiveSection(6);
                                                  setWarning("");
                                              }}>Venerdì
                                        {disabled === false && checkVenerdi === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {disabled === false && checkVenerdi === false &&
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
                                              eventKey="7"
                                              onClick={() => {
                                                  setSection(7);
                                                  setActiveSection(7);
                                                  setWarning("");
                                              }}>Sabato
                                        {disabled === false && checkSabato === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {disabled === false && checkSabato === false &&
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
                                              eventKey="8"
                                              onClick={() => {
                                                  setSection(8);
                                                  setActiveSection(8);
                                                  setWarning("");
                                              }}>Domenica
                                        {disabled === false && checkDomenica === true &&
                                            <FontAwesomeIcon className={"my-auto"}
                                                             icon={faCheck}
                                                             style={{
                                                                 marginRight: 0,
                                                                 marginLeft: 10,
                                                                 color: "green",
                                                                 height: 15
                                                             }}/>}
                                        {disabled === false && checkDomenica === false &&
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
                            <Form onSubmit={handleSubmit}
                                  className={"d-flex flex-column"}>
                                <DietSections section={section}
                                              formData={formData}
                                              setFormData={setFormData}
                                              disabled={disabled}
                                              setProgress={setProgress}
                                              setLoading={setLoadingMealAnalysis}
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
                                />
                                <Container className={"d-flex flex-wrap justify-content-evenly"}
                                           style={{marginBottom: 20, marginTop: 20}}>
                                    {disabled
                                        ?
                                        (
                                            <>
                                                <button type="submit"
                                                        className="btn btn-danger"
                                                        style={{width: 154, marginBottom: 10}}
                                                        onClick={() => showDeleteModal()}><FontAwesomeIcon
                                                    icon={faTrash}
                                                    style={{marginRight: 5}}/>Elimina
                                                </button>
                                                <button type="submit"
                                                        className="btn btn-warning"
                                                        style={{width: 154, marginBottom: 10}}
                                                        onClick={() => {
                                                            setDisabled(false);
                                                        }}><FontAwesomeIcon
                                                    icon={faFilePen}
                                                    style={{marginRight: 5}}/>Modifica Dieta
                                                </button>
                                                <button disabled={loading}
                                                        type="submit"
                                                        onClick={() => handlePfGeneration()}
                                                        className="btn btn-primary"
                                                        style={{width: 154, marginBottom: 10}}><FontAwesomeIcon
                                                    icon={faFilePdf}
                                                    style={{marginRight: 5}}/>Scarica PDF
                                                </button>
                                            </>
                                        )
                                        : <button type="submit"
                                                  className="btn btn-primary"
                                                  style={{width: 154, marginBottom: 10}}
                                                  onClick={() => setDisabled(true)}><FontAwesomeIcon icon={faFloppyDisk}
                                                                                                     style={{marginRight: 5}}/>Salva
                                                                                                                               Dieta
                                        </button>
                                    }
                                </Container>
                            </Form>
                        </Card>
                    </Container>
                </Container>
                <DeleteConfirmation showModal={displayConfirmationModal}
                                    confirmModal={submitDelete}
                                    hideModal={hideConfirmationModal}
                                    message={deleteMessage}/>
            </Container>
            }
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
        </>
    );
}
