import React, {useEffect, useState} from "react";
import {Alert, Button, Card, Form, InputGroup, ListGroup, Navbar} from "react-bootstrap";
import {useNavigate, useParams} from "react-router-dom";
import Container from "react-bootstrap/Container";
import {collection, doc, getDoc, getDocs, orderBy, query} from "firebase/firestore";
import {db} from "../../config/firebase-config";
import {SyncLoader} from "react-spinners";
import Spinner from "../Utilities/Spinner";
import Pagination from "../Utilities/Pagination";
import DiaryPreview from "./DiaryPreview";
import {scrollToTop} from "../helpers/scroll";
import {LinkContainer} from "react-router-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft} from "@fortawesome/free-solid-svg-icons";
import NewDietImg from "../../img/newDietImage.svg";

/*
 Funzione che si occupa di mostrare un elenco contenente tutte i progressi (es. peso giornaliero) registrati dal paziente
 Gli elementi vengono impaginati in modo tale che ce ne siano 7 per pagina
 */
export default function ShowDiary() {
    //Ottengo l'id dall'url
    const {id} = useParams();
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [diet, setDiet] = useState();
    const [progress, setProgress] = useState(true);
    //Numero di progressi visualizzate per pagina
    const progressPerPage = 7;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const lastProgressNumber = currentPage * progressPerPage;
    const firstProgressIndex = lastProgressNumber - progressPerPage;
    const [allDiary, setAllDiary] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();
        const getAllDiary= async () => {
            setProgress(true);
            //Controllo l'esistenza della dieta
            const docRef = doc(db, "diets", id);
            await getDoc(docRef)
                .then(async (doc) => {
                    if (doc.exists()) {
                        await getDocs(query(collection(db, "diets", id, "diarioAlimentare"),
                            orderBy("timestamp", "desc")))
                            .then((querySnapshot) => {
                                if (querySnapshot.empty) {
                                    setWarning("Non è stato ancora utilizzato il bot di telegram 'YourFoodCoachBot' per registrare il diario alimentare");
                                } else {
                                    setAllDiary(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})));
                                    setCurrentPage(1);
                                }
                            }).catch((error) => setError("Si è verificato un errore inaspettato"));
                    } else {
                        //Il paziente richiesto non esiste
                        //L'utente viene indirizzato alla pagina che visualizza l'elenco dei pazienti con una dieta attiva
                        navigate("/progressi-pazienti", {replace: true});
                    }
                }).finally(() => setProgress(false));
        };
        getAllDiary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const getDiet = async () => {
            setProgress(true);
            const docRef = doc(db, "diets", id);
            await getDoc(docRef)
                .then((doc) => {
                    if (doc.exists()) {
                        setDiet(doc.data());
                        setProgress(false);
                    }
                });
        };
        getDiet();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = allDiary.filter(
        //Funzione di ricerca: cerca la stringa data in input in timestamp
        (diary) => {
            return searchInput.toLowerCase() === "" ? diary
                : diary.timestamp.toDate().toLocaleDateString("it-IT").includes(searchInput.toLowerCase());
        }
    );

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
                        <Card className={"col-12 col-sm-12 col-md-10 mx-auto"}
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
                                            <LinkContainer to={`/progressi-paziente/${id}`}
                                                           className={"my-auto"}>
                                                <Button style={{height: 40, width: 100}}
                                                        variant={"warning"}
                                                ><FontAwesomeIcon icon={faAngleLeft}
                                                                  color={"black"}/></Button>
                                            </LinkContainer>
                                        </div>
                                    </div>
                                </div>
                                <div className={"d-flex d-inline-block col-12 justify-content-center"}>
                                    <img src={NewDietImg}
                                         style={{height: 90, width: 90, marginRight: 10}}
                                         alt={"Nuova dieta"}/>
                                    <h5 className={"my-auto"}>Diario Alimentare: <p>
                                        <strong>{diet.cognome_paziente} {diet.nome_paziente}</strong></p></h5>
                                </div>
                            </h2>
                            <SyncLoader color="#eb6164"
                                        loading={progress}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            zIndex: 1
                                        }}/>
                            <Form className={"d-flex flex-column"}>
                                <Container className={"d-flex flex-wrap justify-content-evenly"}
                                           style={{marginBottom: 20, marginTop: 10, minHeight: 500}}>
                                    <ListGroup className={"col-12 mx-auto"}
                                               style={{
                                                   marginBottom: 20
                                               }}>
                                        <Navbar expand="lg"
                                                className={"justify-content-end"}
                                                style={{marginBottom: 10}}>
                                            <Container className={"col-6 col-sm-6 col-lg-5"}
                                                       style={{margin: 0, padding: 0}}>
                                                <InputGroup className="d-flex ">
                                                    <Form.Control
                                                        type="search"
                                                        placeholder={"Cerca data..."}
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
                                        {filtered.slice(firstProgressIndex, lastProgressNumber)
                                                 .map((diary) =>
                                                     <DiaryPreview key={diary.id}
                                                                   diary={diary}
                                                     />)}
                                        {warning && <Alert className={"mx-auto col-10 flex-wrap"}
                                                           variant={"warning"}
                                                           style={{margin: 30}}>{warning}</Alert>}
                                        {filtered.length === 0 && !error && allDiary.length > 0
                                            ? (<Alert variant={"warning"}
                                                      style={{margin: 30}}>Nessun dato soddisfa i
                                                                           parametri di ricerca</Alert>)
                                            : (<></>)
                                        }
                                    </ListGroup>
                                    <Container className={"d-flex flex-wrap justify-content-center mt-auto"}>
                                        {allDiary.length !== 0 && <Pagination
                                            itemsCount={filtered.length}
                                            itemsPerPage={progressPerPage}
                                            currentPage={currentPage}
                                            setCurrentPage={setCurrentPage}
                                            alwaysShown={true}
                                        />
                                        }
                                    </Container>
                                </Container>
                            </Form>
                        </Card>
                    </Container>
                </Container>
            </Container>
            }
        </>
    );
}
