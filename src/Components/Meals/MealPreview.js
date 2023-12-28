import {Badge, ListGroup} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {ReactComponent as ShowMealImg} from "../../img/showMealImg.svg";
import React from "react";
import {faAngleRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useNavigate} from "react-router-dom";
import EllipsisText from "react-ellipsis-text";

//Componente che visualizza i dettagli di un singolo pasto in un ListGroup
const MealPreview = ({id, nome, sostituzioni, colazione, pranzo, spuntino, cena}) => {
    const navigate = useNavigate();
    return (
        //L'utente viene indirizzato alla pagina che visualizza i dettagli del pasto
        <ListGroup.Item onClick={() => navigate(`/pasto/${id}`)}
                        className={"col-12 mx-auto"}
                        style={{padding: 0, cursor: "pointer"}}>
            <Container className={"d-flex flex-column mx-auto my-auto "}>
                <Container className={"d-flex flex-wrap text-start"}
                           style={{padding: 0}}>
                    <Container className={"d-flex flex-row justify-content-evenly my-auto"}
                               style={{padding: 0, marginTop: 20}}>
                        <Container style={{margin: 0}}
                                   className={"col-4 mx-auto my-auto text-center"}>
                            <ShowMealImg
                                id={"ShowMealImg"}
                                style={{maxHeight: 100, maxWidth: 100, margin: 10}}
                            />
                        </Container>
                        <Container style={{padding: 5}}
                                   className={"col-8 my-auto"}>
                            <h5 className={"d-flex flex-wrap"}><strong style={{margin: 15}}>
                                <div>
                                    <EllipsisText text={nome}
                                                  length={130}/>
                                </div>
                            </strong></h5>
                            <Container className={"align-top"}
                                       style={{marginBottom: 20}}>
                                {colazione ? (
                                    <Badge pill
                                           bg="primary"
                                           style={{marginRight: 5}}>Colazione</Badge>) : (<></>)}
                                {pranzo ? (<Badge pill
                                                  bg="primary"
                                                  style={{marginRight: 5}}>Pranzo</Badge>) : (<></>)}
                                {spuntino ? (
                                    <Badge pill
                                           bg="primary"
                                           style={{marginRight: 5}}>Spuntino</Badge>) : (<></>)}
                                {cena ? (<Badge pill
                                                bg="primary"
                                                style={{marginRight: 5}}>Cena</Badge>) : (<></>)}
                            </Container>
                            {/*<Container className={"d-flex flex-wrap text-start"}
                             style={{marginTop: 15}}>
                             <p className={"col-12"}
                             style={{margin: 0, padding: 0}}><strong>Sostituzioni: </strong></p>
                             <p style={{margin: 0, marginBottom: 20}}><EllipsisText text={sostituzioni}
                             length={180}/></p>
                             </Container>*/}
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

export default MealPreview;