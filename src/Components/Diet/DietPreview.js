import {Badge, ListGroup} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {ReactComponent as ShowDietImg} from "../../img/showDietImg.svg";
import React from "react";
import {faAngleRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useNavigate} from "react-router-dom";

/*
 Componente che visualizza i dettagli di una singola dieta in un ListGroup
 */
const DietPreview = ({id, nomePaziente, cognomePaziente, codiceFiscalePaziente, dataInizio, dataFine}) => {
    const navigate = useNavigate();
    //Ottengo la data corrente es. 2022-08-12
    const currentData = new Date();
    //Converto stringa in oggetto date
    const dataFineDieta = new Date(dataFine);
    return (
        //L'utente viene indirizzato alla pagina che visualizza i dettagli della dieta
        <ListGroup.Item onClick={() => navigate(`/dieta/${id}`)}
                        className={"col-12 mx-auto"}
                        style={{padding: 0, cursor: "pointer"}}>
            <Container className={"d-flex flex-column mx-auto my-auto "}>
                <Container className={"d-flex flex-wrap text-start"}
                           style={{padding: 0}}>
                    <Container className={"d-flex flex-row justify-content-evenly my-auto"}
                               style={{padding: 0, marginTop: 20}}>
                        <Container style={{margin: 0}}
                                   className={"d-flex justify-content-center col-4 col-lg-2 my-auto"}>
                            <ShowDietImg
                                id={"ShowDietImg"}
                                style={{maxHeight: 80, maxWidth: 80, margin: 10}}
                            />
                        </Container>
                        <Container style={{padding: 5}}
                                   className={"col-8 my-auto mt-2 mt-sm-3 mt-lg-1"}>
                            <div className={"flex-row"}>
                                <h5 className={"col-12"}><p>Dieta di: <strong
                                    style={{margin: 15}}>{cognomePaziente} {nomePaziente}</strong></p></h5>
                            </div>
                            <Container className={"d-flex flex-wrap text-start"}
                                       style={{padding: 0, marginTop: 25}}>
                                <Container style={{padding: 0}}
                                           className={"col-12 col-sm-12 mb-3"}>
                                    <p style={{margin: 0}}>C.F.: <strong>{codiceFiscalePaziente}</strong></p>
                                </Container>
                                <Container className={"d-flex flex-wrap align-items-center col-12"}
                                           style={{padding: 0}}>
                                    <Container style={{padding: 0, margin: 0}}
                                               className={"col-12 col-lg-6 my-auto"}>
                                        <div style={{margin: 0}}>Data di inizio: <strong>{dataInizio}</strong></div>
                                    </Container>
                                    <Container style={{padding: 0}}
                                               className={"col-12 col-lg-6 mb-2 mb-sm-3 mb-lg-0"}>
                                        <Container className={"d-flex flex-wrap float-start col-12 p-0"}>Data di
                                                                                                         fine: <strong style={{marginLeft: 4}}>{dataFine}</strong>
                                            <Container style={{padding: 0}}
                                                       className={"col-1"}>
                                                {currentData > dataFineDieta ? (
                                                    <div className={"d-inline-block"}><Badge pill
                                                                                             bg="danger"
                                                                                             style={{marginLeft: 20}}>Scaduta</Badge>
                                                    </div>) : (<></>)}
                                            </Container>
                                        </Container>
                                    </Container>
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

export default DietPreview;