import {ListGroup} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {ReactComponent as ShowDietImg} from "../../img/showDietImg.svg";
import React from "react";
import {faAngleRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useNavigate} from "react-router-dom";

/*
 Componente che visualizza i dettagli di un singolo paziente in un ListGroup
 */
const PatientPreview = ({id, nomePaziente, cognomePaziente, codiceFiscalePaziente}) => {
    const navigate = useNavigate();
    return (
        //L'utente viene indirizzato alla pagina che visualizza i progressi registrati dal paziente selezionato
        <ListGroup.Item onClick={() => navigate(`/feedback-paziente/${id}`)}
                        className={"col-12 mx-auto"}
                        style={{padding: 0, cursor: "pointer"}}>
            <Container className={"d-flex flex-column mx-auto my-auto "}>
                <Container className={"d-flex flex-wrap text-start"}
                           style={{padding: 0}}>
                    <Container className={"d-flex flex-row justify-content-evenly my-auto"}
                               style={{padding: 0, marginTop: 20}}>
                        <Container style={{margin: 0}}
                                   className={"d-flex justify-content-center col-4 col-lg-2 my-auto text-center"}>
                            <ShowDietImg
                                id={"ShowDietImg"}
                                style={{maxHeight: 80, maxWidth: 80, margin: 10}}
                            />
                        </Container>
                        <Container style={{padding: 5}}
                                   className={"col-8 my-auto mt-2 mt-sm-3 mt-lg-1"}>
                            <div className={"flex-row"}>
                                <h5 className={"col-12"}><p>Dieta: <strong
                                    style={{margin: 15}}>{cognomePaziente} {nomePaziente}</strong></p></h5>
                            </div>
                            <Container className={"d-flex flex-wrap text-start"}
                                       style={{padding: 0, marginTop: 25}}>
                                <Container style={{padding: 0}}
                                           className={"col-12 col-sm-12 mb-2 mb-sm-3 mb-lg-0"}>
                                    <p style={{margin: 0}}>C.F.: <strong>{codiceFiscalePaziente}</strong></p>
                                </Container>
                            </Container>
                        </Container>
                        <Container className={"col-1 my-auto"}
                                   style={{marginRight: 10}}>
                            <FontAwesomeIcon icon={faAngleRight}/>
                        </Container>
                    </Container>
                </Container>
            </Container>
        </ListGroup.Item>
    );
};

export default PatientPreview;