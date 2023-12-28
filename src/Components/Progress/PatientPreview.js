import {ListGroup} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import UserImg from "../../img/UserImg.png";
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
<ListGroup.Item onClick={() => navigate(`/tutti-pazienti/${id}`)}
                className={"col-12 mx-auto"}
                style={{padding: 0, cursor: "pointer"}}>
    <Container className={"d-flex flex-column mx-auto my-auto"}>
        <Container className={"d-flex flex-row justify-content-start align-items-center my-auto"}
                   style={{padding: 0, marginTop: 20}}>
            <Container style={{margin: 0, marginRight: 10}}
                       className={"col-3 mx-auto my-auto text-center"}>
                <img src={UserImg}
                    id={"UserImg"}
                    style={{padding: 8, height: 95, width: 95}}
                    alt={"User"}/>
            </Container>
            <Container style={{padding: 10}}
                       className={"col-7 my-auto mt-2 mt-sm-3 mt-lg-1"}>
                <div className={"flex-row"}>
                    <h5 className={"col-12"}><p className="fst-italic">Paziente: <i
                        style={{margin: 15, fontStyle: 'italic'}}>{cognomePaziente} {nomePaziente}</i></p></h5>
                </div>
                <div className={"flex-row"}>
                    <p style={{margin: 0}}>Codice Fiscale: <strong>{codiceFiscalePaziente}</strong></p>
                </div>
            </Container>
            <Container className={"col-2 my-auto text-end"}>
                <FontAwesomeIcon icon={faAngleRight}/>
            </Container>
        </Container>
    </Container>
</ListGroup.Item>


    );
};

export default PatientPreview;