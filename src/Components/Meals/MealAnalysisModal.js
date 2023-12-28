import {Alert, Button, Card, Col, Modal, Row} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import React from "react";
import PieChart from "react-pie-graph-chart";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEyeSlash, faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";
import MealAnalysisPreview from "./MealAnalysisPreview";
import {sumArrayObject} from "sum-any";

/*
 Componente che mostra i risultati dell'analisi di un pasto per mezzo di un Modal
 L'analisi viene effettuata sfruttando le API offerte da EDAMAM (https://developer.edamam.com/edamam-nutrition-api)
 La traduzione dell'input dell'utente, da italiano ad inglese, viene effettuata sfruttando le API offerte da LIBRETRANSLATE (https://libretranslate.de/)
 */
const MealAnalysisModal = ({
                               showModal, setShowModal, showDetails, setShowDetails, nutrients,
                               kcals, proteins, fats, carbohydrates, loading, userInput, food
                           }) => {
    return (
        <>
            <Modal
                show={showModal}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header className={"justify-content-center"}>
                    <h5 className={"my-auto"}>Pasto: "<strong>{food}</strong>"</h5>
                </Modal.Header>
                <Modal.Body>
                    <Card className={"col-10 mx-auto"}
                          style={{padding: 0, marginTop: 15}}>
                        <Container style={{padding: 0}}>
                            <Card.Header className={"text-center"}><strong>Valori nutrizionali
                                                                           totali</strong></Card.Header>
                            <Card.Body>
                                <Container className={"col-12 my-auto"}
                                           style={{marginLeft: 17}}>
                                    <Row className={"d-flex flew-row col-12 justify-content-center"}
                                         style={{marginRight: 0}}>
                                        <Col>
                                            <div className="text-start">
                                                <strong>Energia:</strong>
                                            </div>
                                            <div className="text-start">
                                                <p>{sumArrayObject(kcals, "quantity")} Kcal</p>
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className="text-start">
                                                <strong>Carboidrati:</strong>
                                            </div>
                                            <div className="text-start">
                                                <p>{sumArrayObject(carbohydrates, "quantity")} gr.</p>
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className="text-start">
                                                <strong>Grassi:</strong>
                                            </div>
                                            <div className="text-start">
                                                <p>{sumArrayObject(fats, "quantity")} gr.</p>
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className="text-start">
                                                <strong>Proteine:</strong>
                                            </div>
                                            <div className="text-start">
                                                <p>{sumArrayObject(proteins, "quantity")}gr.</p>
                                            </div>
                                        </Col>
                                    </Row>
                                </Container>
                            </Card.Body>
                        </Container>
                    </Card>
                    <PieChart data={[
                        {
                            type: "Carboidrati",
                            value: sumArrayObject(carbohydrates, "quantity"),
                            color: "#fbd464"
                        },
                        {
                            type: "Grassi",
                            value: sumArrayObject(fats, "quantity"),
                            color: "#fb7270"
                        },
                        {
                            type: "Proteine",
                            value: sumArrayObject(proteins, "quantity"),
                            color: "#3897f1"
                        }
                    ]}/>
                    <Container className={"mx-auto col-5 text-center"}>
                        {showDetails
                            ? (<Button variant="outline-secondary"
                                       className={"btn d-block mx-auto"}
                                       onClick={(e) => setShowDetails(false)}><FontAwesomeIcon icon={faEyeSlash}
                                                                                               style={{marginRight: 5}}/>Nascondi dettagli</Button>)
                            : (<Button variant="outline-secondary"
                                       className={"btn mx-auto"}
                                       onClick={(e) => setShowDetails(true)}><FontAwesomeIcon icon={faMagnifyingGlass}
                                                                                              style={{marginRight: 5}}/>Mostra
                                                                                                                        dettagli</Button>)
                        }
                    </Container>
                    <Container style={{marginTop: 20}}>
                        {showDetails && nutrients.map((item, index) => (
                            <MealAnalysisPreview key={index}
                                                 index={index}
                                                 userInput={userInput}
                                                 item={item}/>
                        ))}
                    </Container>
                    {(nutrients.length === 0 && loading === false) ? (
                        <Alert className={"col-10 mx-auto"}
                               variant={"warning"}>La
                                                   ricerca non ha prodotto risultati</Alert>) : (<></>)}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setShowModal(false)}>Chiudi</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MealAnalysisModal;