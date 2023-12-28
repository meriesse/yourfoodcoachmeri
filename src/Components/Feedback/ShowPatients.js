import React, {useEffect, useState} from "react";
import {Alert, Button, Card, Form, InputGroup, ListGroup, Navbar} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import AllFeedbackImg from "../../img/AllFeedbackImg.svg";
import {collection, getDocs, orderBy, query, where} from "firebase/firestore";
import {db} from "../../config/firebase-config";
import {SyncLoader} from "react-spinners";
import Pagination from "../Utilities/Pagination";
import PatientPreview from "./PatientPreview";
import {useAuth} from "../../context/AuthContext";
import Spinner from "../Utilities/Spinner";
import {scrollToTop} from "../helpers/scroll";
import {LinkContainer} from "react-router-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft} from "@fortawesome/free-solid-svg-icons";

/*
 Funzione che si occupa di mostrare un elenco contenente tutte i pazienti con una dieta attiva
 Gli elementi vengono impaginati in modo tale che ce ne siano 5 per pagina
 */
export default function ShowPatients() {
    const {currentUser} = useAuth();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [progress, setProgress] = useState(true);
    //Numero di diete visualizzate per pagina
    const dietsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [showExpired, setShowExpired] = useState(false);
    const [diets, setDiets] = useState([]);
    const lastDietNumber = currentPage * dietsPerPage;
    const firstDietIndex = lastDietNumber - dietsPerPage;

    useEffect(() => {
        //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();
        const getDiets = async () => {
            setProgress(true);
            await getDocs(query(collection(db, "diets"),
                where("email_nutrizionista", "==", currentUser.email),
                orderBy("data_inserimento", "desc")))
                .then((querySnapshot) => {
                    setDiets(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})));
                    setCurrentPage(1);
                }).catch((error) => setError("Si è verificato un errore inaspettato"))
                .finally(() => setProgress(false));
        };
        getDiets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //Ottengo la data corrente es. 2022-08-12
    const currentData = new Date();

    const filtered = diets.filter(
        //Funzione di ricerca: cerca la stringa data in input in Nome, Cognome e Codice Fiscale
        (diet) => {
            return searchInput.toLowerCase() === "" ? diet
                : diet.nome_paziente.toLowerCase().includes(searchInput.toLowerCase())
                || diet.cognome_paziente.toLowerCase().includes(searchInput.toLowerCase())
                || diet.codice_fiscale_paziente.toLowerCase().includes(searchInput.toLowerCase());
        }
    ).filter(
        //Funzione di ricerca diete scadute:
        (diet) => {
            //Converto stringa in oggetto date
            const dataFineDieta = new Date(diet.data_fine_dieta);
            return showExpired ? currentData > dataFineDieta : diet;
        });

    if (progress === true) {
        return <Spinner/>;
    }


    return (
        <>
            {progress === false && <Container className={"modal-fullscreen"}
                                              style={{
                                                  background: "linear-gradient(123deg, rgba(247,209,98,1) 30%, rgba(251,149,96,1) 50%, rgba(254,88,94,1) 70%)",
                                                  backgroundSize: "cover",
                                                  minHeight: "inherit",
                                                  padding: 0
                                              }}>
                <Container className={"modal-fullscreen text-center"}>
                    <Container className={"d-flex flex-column mx-auto my-auto"}
                               style={{minHeight: 450, marginTop: 20}}>
                        <Card className={"col-12 col-md-9 mx-auto"}
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
                                            <LinkContainer to="/dashboard"
                                                           className={"my-auto"}>
                                                <Button style={{height: 40, width: 100}}
                                                        variant={"warning"}
                                                ><FontAwesomeIcon icon={faAngleLeft}
                                                                  color={"black"}/></Button>
                                            </LinkContainer>
                                        </div>
                                    </div>
                                </div>
                                <Container className={"d-flex justify-content-center my-auto align-items-center col-12"}
                                           style={{padding: 0}}>
                                    <img src={AllFeedbackImg}
                                         id={"ShowDietsImg"}
                                         style={{height: 70, width: 70, marginRight: 10}}
                                         alt={"Feedback pazienti"}/>
                                    <p className={"my-auto"}>Feedback</p>
                                </Container>
                            </h2>
                            {error && !diets && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert style={{margin: 20}}
                                               variant="primary"
                                               onClose={() => setSuccess(false)}
                                               dismissible={true}>{success}</Alert>}
                            <SyncLoader color="#eb6164"
                                        loading={progress}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            zIndex: 1
                                        }}/>
                            <Container style={{minHeight: 500}}>
                                <ListGroup className={"col-12 col-md-11 mx-auto"}
                                           style={{
                                               marginBottom: 20
                                           }}>
                                    <Navbar expand="lg"
                                            className={"justify-content-end gap-2"}
                                            style={{marginBottom: 10}}>
                                        <Form className={"col-7 col-lg-5 col-xl-4 d-inline-block flex-wrap mx-auto"}
                                              style={{marginRight: 15}}>
                                            <Form.Check
                                                type="switch"
                                                id="custom-switch"
                                                label="Diete scadute"
                                                checked={showExpired}
                                                onChange={() => {
                                                    setShowExpired(!showExpired);
                                                    setCurrentPage(1);
                                                }}
                                            />
                                        </Form>
                                        <Container className={"col-12 col-sm-12 col-lg-5"}
                                                   style={{margin: 0, padding: 0}}>
                                            <InputGroup className="d-flex ">
                                                <Form.Control
                                                    type="search"
                                                    placeholder={"Cerca..."}
                                                    className={"me-2"}
                                                    aria-label="Search"
                                                    value={searchInput}
                                                    onChange={(e) => {
                                                        setCurrentPage(1);
                                                        setSearchInput(e.target.value);
                                                    }}
                                                />
                                            </InputGroup>
                                        </Container>
                                    </Navbar>
                                    {filtered.slice(firstDietIndex, lastDietNumber)
                                             .map((diet) =>
                                                 <PatientPreview key={diet.id}
                                                                 id={diet.id}
                                                                 nomePaziente={diet.nome_paziente}
                                                                 cognomePaziente={diet.cognome_paziente}
                                                                 codiceFiscalePaziente={diet.codice_fiscale_paziente}
                                                 />)}
                                    {diets.length === 0 && !error
                                        ? (<Alert variant={"warning"}
                                                  style={{margin: 30}}>Non hai inserito ancora nessuna
                                                                       dieta</Alert>)
                                        : (<></>)
                                    }
                                    {filtered.length === 0 && !error && diets.length > 0
                                        ? (<Alert variant={"warning"}
                                                  style={{margin: 30}}>Non ci sono al momento diete scadute</Alert>)
                                        : (<></>)
                                    }
                                </ListGroup>
                            </Container>
                            <Container className={"d-flex flex-wrap justify-content-center mt-auto"}>
                                {diets.length !== 0 && <Pagination
                                    itemsCount={filtered.length}
                                    itemsPerPage={dietsPerPage}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    alwaysShown={true}
                                />}
                            </Container>
                        </Card>
                    </Container>
                </Container>
            </Container>
            }
        </>
    );
}
