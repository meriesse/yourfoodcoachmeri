import React, {useEffect, useState} from "react";
import {Alert, Button, Card, Form} from "react-bootstrap";
import {useNavigate, useParams} from "react-router-dom";
import Container from "react-bootstrap/Container";
import ShowMealImg from "../../img/showMealImg.svg";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../../config/firebase-config";
import {SyncLoader} from "react-spinners";
import {faAngleLeft, faFilePen, faFloppyDisk, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import DeleteConfirmation from "../Diet/DeleteConfirmation";
import {clearArray, deleteMeal, updateMeal} from "../../context/MealContext";
import MealSections from "./MealSections";
import {scrollToTop} from "../helpers/scroll";
import MealAnalysisModal from "./MealAnalysisModal";
import axios from "axios";
import {urlEncoded} from "../../context/DietContext";
import {LinkContainer} from "react-router-bootstrap";

export default function ShowMeal() {
    //Ottengo l'id dall'url
    const {id} = useParams();
    const [disabled, setDisabled] = useState(true);
    const [warning, setWarning] = useState("");
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(true);
    const [loading, setLoading] = useState(true);
    const [displayConfirmationModal, setDisplayConfirmationModal] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [food, setFood] = useState([""]);
    const [userInput, setUserInput] = useState([""]);
    const [showDetails, setShowDetails] = useState(false);
    const navigate = useNavigate();
    const mealNameRegex = /^([a-z\s]+\d+[a-z\s]+,)*([a-z\s]+\d+[a-z\s]+){1}$/;
    const [nutrients] = useState([]);
    const [kcals] = useState([]);
    const [proteins] = useState([]);
    const [fats] = useState([]);
    const [carbohydrates] = useState([]);
    const [formData, setFormData] = useState({
        nome: "",
        preparazione: "",
        colazione: false,
        pranzo: false,
        spuntino: false,
        cena: false
    });

    useEffect(() => {
        //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();
        const getMeal = async () => {
            setLoading(true);
            setProgress(true);
            const docRef = doc(db, "pasti", id);
            await getDoc(docRef).then((doc) => {
                if (doc.exists()) {
                    setFormData(doc.data());
                    setProgress(false);
                    setLoading(false);
                } else {
                    //Il pasto richiesto non esiste
                    //L'utente viene indirizzato alla pagina che visualizza l'elenco dei pasti creati
                    navigate("/pasti", {replace: true});
                }
            });
        };
        getMeal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleSubmit(e) {
        setProgress(true);
        e.preventDefault();
        updateMeal(formData, id)
            .catch(error => console.error(error))
            .finally(() => setProgress(false));
    }

    function showDeleteModal() {
        setDeleteMessage("Sei sicuro di voler eliminare definitivamente il pasto?");
        setDisplayConfirmationModal(true);
    }

// Hide the modal
    function hideConfirmationModal() {
        setDisplayConfirmationModal(false);
    }

// Handle the actual deletion of the item
    function submitDelete() {
        setProgress(true);
        deleteMeal(id)
            //L'utente viene indirizzato alla pagina che visualizza l'elenco dei pasti creati
            .then(r => navigate("/pasti", {state: "success-delete", replace: true}))
            .catch((error) => {
                console.error(error);
            }).finally(() => setProgress(false));
        setDisplayConfirmationModal(false);
    }

    /*
     Funzione per l'analisi del pasto in input
     L'analisi viene effettuata sfruttando le API offerte da EDAMAM (https://developer.edamam.com/edamam-nutrition-api)
     */
    const handleSubmitAnalysis = async (e, value) => {
        e.preventDefault();
        setWarning("");

        if (!mealNameRegex.test(formData.nome)) {
            setProgress(false);
            setLoading(false);
            scrollToTop();
            return setWarning("Per poter eseguire l'analisi il titolo del pasto deve contenere il nome dell'ingrediente e la sua quantità, in caso di più ingredienti questi devono essere separati da una virgola: es. pane 50 gr, petto di pollo 80 gr");
        }

        if (value !== "" && value !== undefined) {
            //Inizializzo gli array per una nuova ricerca
            clearArray(nutrients);
            clearArray(kcals);
            clearArray(proteins);
            clearArray(carbohydrates);
            clearArray(fats);

            setProgress(true);
            setLoading(true);
            const req = {
                q: value,
                source: "it",
                target: "en"
            };
            axios.post(`https://translate.argosopentech.com/translate`, req).then((response) => {
                setFood(value);
                setUserInput(value.split(","));
                response.data.translatedText.split(",").forEach((ingredient) => {
                    let stringify = urlEncoded(ingredient);
                    axios.get(`https://api.edamam.com/api/nutrition-data?app_id=b92c2025&app_key=e1942e617a37552b845d1db4d36d9522&ingr=${stringify}`)
                         .then((res) => {
                             nutrients.push(res.data.totalNutrientsKCal);
                             proteins.push(res.data.totalNutrientsKCal.PROCNT_KCAL);
                             carbohydrates.push(res.data.totalNutrientsKCal.CHOCDF_KCAL);
                             fats.push(res.data.totalNutrientsKCal.FAT_KCAL);
                             kcals.push(res.data.totalNutrientsKCal.ENERC_KCAL);

                             if (nutrients.length === value.split(",").length) {
                                 setProgress(false);
                             }
                         });
                });
            });
            setShowModal(true);
        } else {
            setWarning("Per poter effettuare la ricerca inserisci prima un pasto nel formato richiesto: \nes. pane 50 gr, petto di pollo 80 gr");
        }
    };

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
                    <Container className={"d-flex flex-column mx-auto my-auto"}
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
                                            <LinkContainer to="/pasti"
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
                                    {disabled
                                        ? <><img src={ShowMealImg}
                                                 style={{height: 70, width: 70, marginRight: 10}}
                                                 alt={"Visualizza pasto"}/><p
                                            style={{margin: 0}}>Visualizzazione Pasto</p></>
                                        : <><img src={ShowMealImg}
                                                 style={{height: 70, width: 70, marginRight: 10}}
                                                 alt={"Modifica pasto"}/><p
                                            style={{margin: 0}}>Modifica Pasto</p></>
                                    }
                                </Container>
                            </h2>
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
                            {nutrients.length > 0 && (
                                <MealAnalysisModal
                                    showModal={showModal}
                                    setShowModal={setShowModal}
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
                            <Form onSubmit={handleSubmit}
                                  className={"d-flex flex-column"}>
                                <MealSections formData={formData}
                                              setFormData={setFormData}
                                              disabled={disabled}
                                />
                                <Container className={"d-flex flex-wrap justify-content-evenly"}
                                           style={{marginBottom: 20, marginTop: 20}}>
                                    {/*<Button variant="secondary"
                                     style={{width: 157, marginBottom: 10}}
                                     onClick={(e) => handleSubmitAnalysis(e, formData.nome)}><FontAwesomeIcon
                                     icon={faChartSimple}
                                     style={{marginRight: 5}}/>Analizza Pasto</Button>*/}
                                    {disabled
                                        ? <button type="submit"
                                                  className="btn btn-warning"
                                                  style={{width: 157, marginBottom: 10}}
                                                  onClick={() => setDisabled(false)}><FontAwesomeIcon icon={faFilePen}
                                                                                                      style={{marginRight: 5}}/>Modifica
                                                                                                                                Pasto
                                        </button>
                                        : <button type="submit"
                                                  className="btn btn-primary"
                                                  style={{width: 157, marginBottom: 10}}
                                                  onClick={() => setDisabled(true)}><FontAwesomeIcon icon={faFloppyDisk}
                                                                                                     style={{marginRight: 5}}/>Salva
                                                                                                                               Pasto
                                        </button>
                                    }
                                    <button type="submit"
                                            className="btn btn-danger"
                                            style={{width: 157, marginBottom: 10}}
                                            onClick={() => showDeleteModal()}>
                                        <FontAwesomeIcon icon={faTrash}
                                                         style={{marginRight: 5}}/>Elimina
                                    </button>
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
        </>
    );
}
