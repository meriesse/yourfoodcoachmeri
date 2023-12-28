import {Card, Form} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import React from "react";

/*
 Componente che racchiude le sezioni che caratterizzano i campi di un singolo pasto
 */
const MealSections = ({formData, setFormData, disabled}) => {

    const cardBackgroundColor = {
        background: "#FFEAD3"
    };

    return (
        <>
            <div>
                <Card className={"col-10 mx-auto"}
                      style={{marginTop: 20}}>
                    <Card.Header style={cardBackgroundColor}
                                 className={"text-start"}
                                 as="h5">Dettagli
                                         Pasto</Card.Header>
                    <Card.Body>
                        <Container className={"d-flex flex-wrap justify-content-evenly"}>
                            <Form.Group id="nome"
                                        style={{marginBottom: 15, padding: 5}}
                                        className={"col-12"}>
                                <Form.Label className={"d-flex text-start"}>Nome Pasto:</Form.Label>
                                <Form.Control type="text"
                                              placeholder="es. pane 50 gr, petto di pollo 80 gr"
                                              value={formData.nome}
                                              onChange={(e) => {
                                                  setFormData({...formData, nome: e.target.value});
                                              }}
                                              disabled={disabled}
                                              required/>
                            </Form.Group>
                            <small style={{color: "grey", verticalAlign: "bottom"}}>Per poter effettuare l'analisi del
                                                                                    pasto inserisci gli ingredienti separandoli con la virgola</small>
                            <Container className={"d-flex d-inline flex-wrap justify-content-evenly"}
                                       style={{marginBottom: 20}}>
                                <Container className={"text-start col-6 col-md-3"}
                                           style={{margin: 0}}>
                                    <Form.Group id="checkBoxColazione"
                                                style={{marginBottom: 5, marginTop: 15, padding: 0}}>
                                        <Form.Check type="checkbox"
                                                    label="Colazione"
                                                    onChange={() => {
                                                        setFormData({...formData, colazione: !formData.colazione});
                                                    }}
                                                    checked={formData.colazione}
                                                    disabled={disabled}/>
                                    </Form.Group>
                                </Container>
                                <Container className={"text-start col-6 col-md-3"}
                                           style={{margin: 0}}>
                                    <Form.Group id="checkBoxPranzo"
                                                style={{marginBottom: 5, marginTop: 15, padding: 0}}
                                                className={"col-6 col-sm-4"}>
                                        <Form.Check type="checkbox"
                                                    label="Pranzo"
                                                    onChange={() => {
                                                        setFormData({...formData, pranzo: !formData.pranzo});
                                                    }}
                                                    checked={formData.pranzo}
                                                    disabled={disabled}/>
                                    </Form.Group>
                                </Container>
                                <Container className={"text-start col-6 col-md-3"}
                                           style={{margin: 0}}>
                                    <Form.Group id="checkBoxSpuntino"
                                                style={{marginBottom: 5, marginTop: 15, padding: 0}}
                                                className={"col-12 col-sm-10"}>
                                        <Form.Check type="checkbox"
                                                    label="Spuntino"
                                                    onChange={() => {
                                                        setFormData({...formData, spuntino: !formData.spuntino});
                                                    }}
                                                    checked={formData.spuntino}
                                                    disabled={disabled}/>
                                    </Form.Group>
                                </Container>
                                <Container className={"text-start col-6 col-md-3"}
                                           style={{margin: 0}}>
                                    <Form.Group id="checkBoxCena"
                                                style={{marginBottom: 5, marginTop: 15, padding: 0}}
                                                className={"col-12 col-sm-10"}>
                                        <Form.Check type="checkbox"
                                                    label="Cena"
                                                    onChange={() => {
                                                        setFormData({...formData, cena: !formData.cena});
                                                    }}
                                                    checked={formData.cena}
                                                    disabled={disabled}/>
                                    </Form.Group>
                                </Container>
                            </Container>
                        </Container>
                        <Container className={"d-flex flex-wrap justify-content-evenly"}>
                            <Form.Group id="preparazione"
                                        style={{marginBottom: 15, padding: 5}}
                                        className={"col-12"}>
                                <Form.Label className={"d-flex text-start"}>Preparazione Pasto:</Form.Label>
                                <Form.Control as={"textarea"}
                                              rows={9}
                                              placeholder="Preparazione Pasto"
                                              value={formData.preparazione}
                                              onChange={(e) => {
                                                  setFormData({...formData, preparazione: e.target.value});
                                              }}
                                              disabled={disabled}/>
                            </Form.Group>
                        </Container>
                        {/*<Container className={"d-flex flex-wrap justify-content-evenly"}>
                         <Form.Group id="sostituzioni"
                         style={{marginBottom: 15, padding: 5}}
                         className={"col-12"}>
                         <Form.Label className={"d-flex text-start"}>Sostituzioni Pasto:</Form.Label>
                         <Form.Control as={"textarea"}
                         rows={5}
                         placeholder="Sostituzioni Pasto"
                         value={formData.sostituzioni}
                         onChange={(e) => {
                         setFormData({...formData, sostituzioni: e.target.value});
                         }}
                         disabled={disabled}/>
                         </Form.Group>
                         </Container>*/}
                    </Card.Body>
                </Card>
            </div>
        </>
    );
};

export default MealSections;