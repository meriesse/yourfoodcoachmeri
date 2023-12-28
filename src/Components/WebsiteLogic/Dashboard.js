import React, {useEffect, useState} from "react";
import {Card, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.js";
import {fetchUser} from "../../context/UserContext.js";
import Container from "react-bootstrap/Container";
import {SyncLoader} from "react-spinners";
import ShowDietsImg from "../../img/showDietsImg.svg";
import ShowMealsImg from "../../img/showMealsImg.svg";
import AllProgressiImg from "../../img/AllProgressImg.svg";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartLine, faCommentDots} from "@fortawesome/free-solid-svg-icons";
import {scrollToTop} from "../helpers/scroll";
import Spinner from "../Utilities/Spinner";

/*
 Funzione che si occupa di mostrare i dettagli di un account
 */
export default function Dashboard() {
    const [progress, setProgress] = useState(true);
    const {currentUser} = useAuth();
    const [error, setError] = useState("");

    const [gestione_pazienti_testo, setGestione_pazienti_testo] = useState("");
    let gestione_pazienti_nutrizionista = "Inserisci e visualizza i tuoi pazienti.\n" +
        "                                    Consegna il PDF auto-generato ai tuoi pazienti per permettergli di accedere subito alle funzioni offerte dal chatbot telegram 'YourFoodCoachBot'";
    
    const [gestione_diete_testo, setGestione_diete_testo] = useState("");
    let gestione_diete_nutrizionista = "Inserisci e visualizza le diete dei tuoi pazienti.\n" +
        "                                    Consegna il PDF auto-generato ai tuoi pazienti per permettergli di accedere subito alle funzioni offerte dal chatbot telegram 'YourFoodCoachBot'";
    let gestione_diete_utente = "Visualizza la tua dieta.\n" +
        "                                    Utilizza il PDF auto-generato per accedere subito alle funzioni offerte dal chatbot telegram 'YourFoodCoachBot'";

    const [gestione_pasti_testo, setGestione_pasti_testo] = useState("");
    let gestione_pasti_nutrizionista = "Inserisci, visualizza e modifica i pasti da inserire nelle diete dei tuoi pazienti.\n" +
        "                                    Ottieni subito informazioni riguardo ai\n" +
        "                                    macronutrienti e ai valori calorici degli ingredienti in essi contenuti";
    let gestione_pasti_utente = "Visualizza i pasti disponibili.\n" +
        "                                    Ottieni subito informazioni riguardo ai\n" +
        "                                    macronutrienti e ai valori calorici degli ingredienti in essi contenuti";
    
    const [gestione_progressi_testo, setGestione_progressi_testo] = useState("");
    let gestione_progressi_nutrizionista = "Monitora i progressi e i feedback che i pazienti inseriscono giornalmente attraverso il chatbot telegram 'YourFoodCoachBot'";
    let gestione_progressi_utente = "Monitora i tuoi progressi e i tuoi feedback che giornalmente inserisci attraverso il chatbot telegram 'YourFoodCoachBot";
    
    useEffect(() => {
        // Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();

        const fetchData = async () => {
            try {
                if (currentUser) {
                    // Determino il nome dell'utente solo se già non impostato
                    const docSnap = await fetchUser(currentUser.uid);
                    localStorage.setItem("user", docSnap.nome);
                    localStorage.setItem("role", docSnap.ruolo);

                    if (docSnap.ruolo === "Nutrizionista") {
                        setGestione_pazienti_testo(gestione_pazienti_nutrizionista);
                        setGestione_diete_testo(gestione_diete_nutrizionista);
                        setGestione_pasti_testo(gestione_pasti_nutrizionista);
                        setGestione_progressi_testo(gestione_progressi_nutrizionista);
                    } else if (docSnap.ruolo === "Utente") {
                        setGestione_diete_testo(gestione_diete_utente);
                        setGestione_pasti_testo(gestione_pasti_utente);
                        setGestione_progressi_testo(gestione_progressi_utente);
                    }
                }
            } catch (error) {
                console.error("Errore durante il recupero dei dati dell'utente:", error);
                setError("Errore durante il recupero dei dati dell'utente");
            } finally {
                // Questo blocco verrà eseguito indipendentemente dal successo o dal fallimento della promessa
                setProgress(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    if (progress === true) {
        return <Spinner />;
    }

    const isNutrizionista = localStorage.getItem("role") === 'Nutrizionista';


    const userUI = <Container className={"modal-fullscreen"}
                              style={{
                                  background: "linear-gradient(123deg, rgba(247,209,98,1) 30%, rgba(251,149,96,1) 50%, rgba(254,88,94,1) 70%)",
                                  backgroundSize: "cover",
                                  minHeight: "inherit",
                                  padding: 0
                              }}>

        <Container className={"d-flex flex-column mx-auto my-auto col-lg-11 col-xl-9"}
                   style={{minHeight: 450, marginTop: 20}}>
            {/*CARD GESTIONE UTENTI */}
            {isNutrizionista && (
            <Container className={"d-flex col-12 justify-content-start"}>
                <Card className={"col-12 col-sm-12 col-md-10 col-lg-9 col-xl-9 justify-content-evenly"}
                      style={{
                          marginTop: 20,
                          marginBottom: 20,
                          borderRadius: 16,
                          boxShadow: "10px 10px 10px rgba(30,30,30,0.5)",
                          borderLeft: "solid 1px rgba(255,255,255,0.8)",
                          borderTop: "solid 1px rgba(255,255,255,0.8)"
                      }}>
                    <Card.Body>
                        <Row className={"justify-content-center"}>
                            <Container className={"col-7 text-center my-auto"}>
                                <h2 className="fw-normal mb-4"
                                    style={{fontFamily: "Arial"}}>Gestione Pazienti</h2>
                                <div className={"col-12 mx-auto"}>
                                    {gestione_pazienti_testo}
                                </div>
                                
                                <div className="d-grid-4 gap-2 mt-3">
                                    <Link to="/tutti-pazienti"
                                          className="btn btn-primary"
                                          style={{width: 80}}>
                                        Vai
                                    </Link>
                                </div>
                            </Container>
                            <Container className={"d-flex flex-wrap col-5 justify-content-center my-auto"}>
                                <img src={ShowDietsImg}
                                     id={"ShowUserImg"}
                                     style={{maxHeight: 170}}
                                     alt={"Utenti"}
                                     className={"img-fluid"}
                                />
                            </Container>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
            )}

            {/* CARD GESTIONE DIETE */}
            <Container className={"d-flex col-12 justify-content-end"}>
                <Card className={"col-12 col-sm-12 col-md-10 col-lg-9 col-xl-9 justify-content-evenly"}
                      style={{
                          marginTop: 20,
                          marginBottom: 20,
                          borderRadius: 16,
                          boxShadow: "10px 10px 10px rgba(30,30,30,0.5)",
                          borderLeft: "solid 1px rgba(255,255,255,0.8)",
                          borderTop: "solid 1px rgba(255,255,255,0.8)"
                      }}>
                    <Card.Body>
                        <Row className={"justify-content-center"}>
                            <Container className={"col-7 text-center my-auto"}>
                                <h2 className="fw-normal mb-4"
                                    style={{fontFamily: "Arial"}}>Gestione Diete</h2>
                                <div className={"col-12 mx-auto"}>
                                    {gestione_diete_testo}
                                </div>
                                <div className="d-grid-4 gap-2 mt-3">
                                    <Link to="/diete"
                                          className="btn btn-primary"
                                          style={{width: 80}}>
                                        Vai
                                    </Link>
                                </div>
                            </Container>
                            <Container className={"d-flex flex-wrap col-5 justify-content-center my-auto"}>
                                <img src={ShowDietsImg}
                                     id={"ShowDietsImg"}
                                     style={{maxHeight: 170}}
                                     alt={"Pasti"}
                                     className={"img-fluid"}
                                />
                            </Container>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
            {/* CARD GESTIONE PASTI */}
            <Container className={"d-flex col-12 justify-content-start"}>
                <Card className={"col-12 col-sm-12 col-md-10 col-lg-9 col-xl-9 justify-content-evenly"}
                      style={{
                          marginTop: 20,
                          marginBottom: 20,
                          borderRadius: 16,
                          boxShadow: "10px 10px 10px rgba(30,30,30,0.5)",
                          borderLeft: "solid 1px rgba(255,255,255,0.8)",
                          borderTop: "solid 1px rgba(255,255,255,0.8)"
                      }}>
                    <Card.Body>
                        <Row className={"justify-content-evenly"}>
                            <Container className={"d-flex flex-wrap col-5 justify-content-center my-auto"}>
                                <img src={ShowMealsImg}
                                     id={"ShowMealsImg"}
                                     style={{maxHeight: 170}}
                                     alt={"Pasti"}
                                     className={"img-fluid"}
                                />
                            </Container>
                            <Container className={"col-7 text-center my-auto"}>
                                <h2 className="fw-normal mb-4"
                                    style={{fontFamily: "Arial"}}>Gestione Pasti</h2>
                                <div className={"col-11 mx-auto"}>
                                    {gestione_pasti_testo}
                                </div>
                                <div className="d-grid-4 gap-2 mt-3">
                                    <Link to="/pasti"
                                          className="btn btn-primary"
                                          style={{width: 80}}>
                                        Vai
                                    </Link>
                                </div>
                            </Container>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
            {/* CARD MONITORAGGIO PAZIENTI */}
            <Container className={"d-flex col-12 justify-content-end"}>
                <Card className={"d-flex flex-wrap col-12 col-sm-12 col-md-10 col-lg-9 col-xl-9 justify-content-evenly"}
                      style={{
                          marginTop: 20,
                          marginBottom: 40,
                          borderRadius: 16,
                          boxShadow: "10px 10px 10px rgba(30,30,30,0.5)",
                          borderLeft: "solid 1px rgba(255,255,255,0.8)",
                          borderTop: "solid 1px rgba(255,255,255,0.8)"
                      }}>
                    <Card.Body>
                        <SyncLoader color="#eb6164"
                                    loading={progress}
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        zIndex: 1
                                    }}/>
                        <Row className={"justify-content-evenly"}>
                            <Container className={"col-7 text-center my-auto"}>
                                <h2 className="fw-normal mb-4"
                                    style={{fontFamily: "Arial"}}>Monitora i Progressi e i Feedback</h2>
                                <div className={"col-10 mx-auto"}>
                                    {gestione_progressi_testo}
                                </div>
                                <Container className={"d-flex flex-wrap justify-content-evenly d-grid-4 gap-2 mt-3"}>
                                    <Link to="/progressi-pazienti"
                                          className="btn btn-primary"
                                          style={{width: 130}}>
                                        <FontAwesomeIcon icon={faChartLine}
                                                         style={{marginRight: 5}}/>
                                        Progressi
                                    </Link>
                                    <Link to="/feedback-pazienti"
                                          className="btn btn-primary"
                                          style={{width: 130}}>
                                        <FontAwesomeIcon icon={faCommentDots}
                                                         style={{marginRight: 5}}/>
                                        Feedback
                                    </Link>
                                </Container>
                            </Container>
                            <Container className={"d-flex flex-wrap col-5 justify-content-center my-auto mx-auto"}>
                                <img src={AllProgressiImg}
                                     id={"AllProgressiImg"}
                                     style={{maxHeight: 170}}
                                     alt={"Progressi pazienti"}
                                     className={"img-fluid"}
                                />
                            </Container>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        </Container>
    </Container>;

    return (
        <>
            {progress === false && userUI}
        </>
    );
}
