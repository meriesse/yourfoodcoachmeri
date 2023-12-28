import {Alert, Card, Col, Row} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import React from "react";


/*
 Componente che visualizza i dettagli che caratterizzano l'analisi di un pasto
 L'analisi viene effettuata sfruttando le API offerte da EDAMAM (https://developer.edamam.com/edamam-nutrition-api)
 La traduzione dell'input dell'utente, da italiano ad inglese, viene effettuata sfruttando le API offerte da LIBRETRANSLATE (https://libretranslate.de/)
 */
const MealAnalysisPreview = ({index, item, userInput}) => {
    return (
        <Card className={"col-12 mx-auto"}
              style={{padding: 0, marginBottom: 15}}>
            <Card.Header className={"text-center"}><strong>{userInput[index]}</strong></Card.Header>
            <Container className={"d-flex flex-column mx-auto my-auto "}>
                <Container className={"d-flex flex-wrap text-start"}>
                    <Container className={"d-flex flex-wrap justify-content-evenly my-auto"}
                               style={{padding: 0, marginTop: 20}}>
                        <Container style={{padding: 5}}
                                   className={"col-12 my-auto"}>
                            <Container className={"d-flex flex-wrap"}
                                       style={{padding: 0, marginLeft: 10}}>
                                <Container className={"d-flex flex-wrap align-items-center col-12"}
                                           style={{padding: 0}}>
                                    <Container className={"justify-content-evenly mx-auto"}>
                                        <div className="col-md-12 mx-auto"
                                             style={{marginTop: 15}}>
                                            <Row className={"d-flex flew-row col-12 justify-content-evenly"}
                                                 style={{marginRight: 0}}>
                                                {item.ENERC_KCAL.quantity > 0 ?
                                                    //L'analisi dell'alimento ha prodotto risultati
                                                    (<>
                                                        <Col>
                                                            <div className="text-start">
                                                                <strong>Energia:</strong>
                                                            </div>
                                                            <div className="text-start">
                                                                <p>{item.ENERC_KCAL.quantity.toFixed(1)} Kcal</p>
                                                            </div>
                                                        </Col>
                                                        <Col>
                                                            <div className="text-start">
                                                                <strong>Carboidrati:</strong>
                                                            </div>
                                                            <div className="text-start">
                                                                <p>{item.CHOCDF_KCAL.quantity.toFixed(1)} gr.</p>
                                                            </div>
                                                        </Col>
                                                        <Col>
                                                            <div className="text-start">
                                                                <strong>Grassi:</strong>
                                                            </div>
                                                            <div className="text-start">
                                                                <p>{item.FAT_KCAL.quantity.toFixed(1)} gr.</p>
                                                            </div>
                                                        </Col>
                                                        <Col>
                                                            <div className="text-start">
                                                                <strong>Proteine:</strong>
                                                            </div>
                                                            <div className="text-start">
                                                                <p>{item.PROCNT_KCAL.quantity.toFixed(1)} gr.</p>
                                                            </div>
                                                        </Col>
                                                    </>)
                                                    //L'analisi dell'alimento non ha prodotto risultati
                                                    :
                                                    (<>
                                                        <Alert className={"text-center mx-auto col-12 flex-wrap"}
                                                               variant="warning">
                                                            Non è stato possibile effettuare l'analisi per questo ingrediente
                                                        </Alert>
                                                    </>)
                                                }
                                            </Row>
                                        </div>
                                    </Container>
                                </Container>
                            </Container>
                        </Container>
                    </Container>
                </Container>
            </Container>
        </Card>
    );
};

export default MealAnalysisPreview;