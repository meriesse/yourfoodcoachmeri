import React, {useEffect} from "react";
import {Button, Card} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import InformativaPrivacyImg from "../../img/InformativaPrivacyImg.svg";
import {scrollToTop} from "../helpers/scroll";
import {LinkContainer} from "react-router-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft} from "@fortawesome/free-solid-svg-icons";

/*
 Funzione che mostra l'Informativa Privacy dell'iniziativa 'YourFoodCoach'
 */
export default function PrivacyPolicy() {

    //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
    useEffect(() => {
        scrollToTop();
    }, []);

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
                               style={{maxWidth: 800, minHeight: 450, marginTop: 20}}>
                        <Card className={"col-12 col-sm-10 col-lg-12 mx-auto"}
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
                                            <LinkContainer to="/"
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
                                    <img src={InformativaPrivacyImg}
                                         style={{height: 100, width: 100, marginRight: 10}}
                                         alt={"Documento informativa privacy"}/>
                                    <p className={"my-auto"}>Informativa Privacy</p>
                                </Container>
                            </h2>
                            <Card.Body>
                                <Container>
                                    <li className={"text-start"}
                                        style={{marginBottom: 30}}>
                                        <strong>QUALI DATI TRATTIAMO E PERCHÉ?</strong>
                                        <p className={"col-10 mx-auto"}
                                           style={{textAlign: "justify", marginTop: 10}}>
                                            I dati personali sono quelli che fornisci in fase di iscrizione: dati
                                            anagrafici quali nome e cognome, indirizzo email e numero di telefono.
                                            Con il tuo consenso, <u>che è facoltativo</u>, i tuoi dati personali vengono
                                            trattati per le seguenti finalità:
                                        </p>
                                        <ul className={"col-10 mx-auto"}
                                            style={{textAlign: "justify", marginTop: 10}}>
                                            <li style={{marginLeft: 10, marginRight: 20, listStylePosition: "outside"}}>
                                                Consentirti la registrazione al sito e la fruizione dei servizi
                                                riservati agli utenti registrati
                                            </li>
                                            <li style={{marginLeft: 10, marginRight: 20}}>
                                                Fornire informazioni utili ai pazienti attraverso il bot
                                                telegram <strong>YourFoodCoachBot</strong>
                                            </li>
                                        </ul>
                                    </li>
                                    <hr className="solid"></hr>
                                    <li className={"text-start"}
                                        style={{marginBottom: 30}}>
                                        <strong>CHI TRATTERÀ I TUOI DATI?</strong>
                                        <p className={"col-10 mx-auto"}
                                           style={{textAlign: "justify", marginTop: 10}}>
                                            I tuoi dati personali sono trattati da personale autorizzato e interno
                                            all'iniziativa YourFoodCoach
                                        </p>
                                    </li>
                                    <hr className="solid"></hr>
                                    <li className={"text-start"}
                                        style={{marginBottom: 30}}>
                                        <strong>PER QUANTO TEMPO CONSERVIAMO I TUOI DATI?</strong>
                                        <p className={"col-10 mx-auto"}
                                           style={{textAlign: "justify", marginTop: 10}}>
                                            Conserviamo i tuoi dati personali per un periodo di tempo limitato che
                                            dipende dalla finalità per la quale sono stati raccolti,
                                            al termine del quale i tuoi dati personali saranno cancellati.
                                        </p>
                                    </li>
                                </Container>
                            </Card.Body>
                        </Card>
                    </Container>
                </Container>
            </Container>
        </>
    );
}
