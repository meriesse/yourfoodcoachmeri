import {ListGroup} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import React from "react";
import {faQuoteLeft, faQuoteRight, faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ReactComponent as MealSubstitutionImg} from "../../img/MealSubstitutionImg.svg";
import {ReactComponent as ProblemImg} from "../../img/ProblemImg.svg";
import Pollice from "../../img/Pollice.png";
import Normale from "../../img/Normale.png";

/*
 Componente che visualizza i dettagli di un singolo feedback utente in un ListGroup
 Il feedback utente può essere di due tipologie: {PROBLEMA, RICHIESTA_SOSTITUZIONE_PASTO, GIORNATA_POSITIVA, GIORNATA_NEGATIVA}
 */
const FeedbackPreview = ({timestamp, tipologia, testo}) => {
    const data = timestamp.toDate().toLocaleDateString("it-IT");
    return (
        <ListGroup.Item className={"col-12"}
                        style={{padding: 0}}>
            <Container className={"d-flex flex-column mx-auto my-auto "}>
                <Container className={"d-flex flex-wrap text-start"}
                           style={{padding: 0}}>
                    <Container className={"d-flex flex-row justify-content-evenly my-auto"}
                               style={{padding: 0, marginTop: 20}}>
                        <Container style={{margin: 0}}
                                   className={"d-flex flex-wrap justify-content-center col-4 col-sm-2 my-auto"}>
                            {tipologia === "RICHIESTA_SOSTITUZIONE_PASTO" &&
                                <MealSubstitutionImg id={"MealSubstitutionImg"}
                                                     style={{maxHeight: 80, margin: 5}}
                                />}
                            {tipologia === "PROBLEMA" &&
                                <ProblemImg id={"ProblemImg"}
                                            style={{maxHeight: 65, margin: 5}}
                                />}
                            {tipologia === "GIORNATA_POSITIVA" &&
                                <img src={Pollice}
                                     alt={"Pollice positivo"}
                                     className={"img-fluid"}
                                     style={{maxHeight: 65, margin: 5}}/>}
                            {tipologia === "GIORNATA_NEGATIVA" &&
                                <img src={Pollice}
                                alt={"About"}
                                className={"Pollice negativo"}
                                style={{maxHeight: 65, margin: 5, rotate:"180deg"}}/>}
                            {tipologia === "GIORNATA_NORMALE" &&
                                <img src={Normale}
                                     alt={"About"}
                                     className={"Uguale"}
                                     style={{maxHeight: 65, margin: 5}}/>}
                        </Container>
                        <Container className={"d-flex flex-wrap my-auto col-9 gap-3 mt-2 mt-sm-3 mt-lg-auto"}
                                   style={{padding: 0}}>
                            <Container style={{padding: 0}}
                                       className={"col-12 col-sm-2"}>
                                <div className={"float-start"}
                                     style={{margin: 0}}>Data: <strong>{data}</strong></div>
                            </Container>
                            <Container style={{padding: 0}}
                                       className={"d-flex col-12 col-sm-8 mb-2 mb-sm-3 mb-lg-auto my-auto"}>
                                <div
                                    style={{margin: 0}}><FontAwesomeIcon icon={faQuoteLeft}
                                                                         style={{marginRight: 10}}/><strong>{testo}</strong><FontAwesomeIcon icon={faQuoteRight}
                                                                                                                                             style={{marginLeft: 10}}/>
                                </div>
                            </Container>
                        </Container>
                    </Container>
                </Container>
            </Container>
        </ListGroup.Item>
    );
};

export default FeedbackPreview;