import React, {useEffect, useState} from "react";
import {Alert, Card, Form, Row} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import Container from "react-bootstrap/Container";
import {scrollToTop} from "../helpers/scroll";
import {ReactComponent as ShowDietImg} from "../../img/showDietImg.svg";
import FeedbackImg from "../../img/AllFeedbackImg.svg";

/*
 Funzione che si occupa di determinare il ruolo dell'utente all'interno della piattaforma
 Nutrizionista o Utente
 */
export default function AccountRole() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [nutrizionistaRole, setNutrizionistaRole] = useState(false);
    const [utenteRole, setUtenteRole] = useState(false);

    //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
    useEffect(() => {
        scrollToTop();
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if(nutrizionistaRole === false && utenteRole === false){
            setError("Per procedere devi prima effettuare una selezione");
        }
        if(nutrizionistaRole){
            navigate("/signup/Nutrizionista", {replace: true});
        }else if(utenteRole){
            navigate("/signup/Utente", {replace: true});
        }
    }


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
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                <h2 className="fw-normal mb-4"
                                    style={{fontFamily: "Arial"}}>Come utilizzerai la piattaforma?</h2>
                                {error &&
                                    <Alert style={{margin: 20}}
                                           variant="danger">{error}</Alert>}
                                <Row className={"gap-5 justify-content-center"}>
                                    <Card className={"col-10 col-sm-8 col-md-5"} style={{height:250}}>
                                        <Card.Body>
                                            <h3 className="fw-normal mb-4"
                                                style={{fontFamily: "Arial"}}>Nutrizionista</h3>
                                            <ShowDietImg
                                                id={"ShowDietImg"}
                                                style={{maxHeight: 100, maxWidth: 100, margin: 10}}
                                            />
                                            <Form.Group className="mb-3 d-flex flex-wrap justify-content-center" controlId="formBasicCheckbox" style={{marginTop:10}}>
                                                <Form.Check type="radio" checked={nutrizionistaRole} onChange={()=> {setNutrizionistaRole(!nutrizionistaRole); setUtenteRole(false)}}   label="" />
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>
                                    <Card className={"col-10 col-sm-8 col-md-5"} style={{height:250}}>
                                        <Card.Body>
                                            <h3 className="fw-normal mb-4"
                                                style={{fontFamily: "Arial"}}>Uso personale</h3>
                                            <img src={FeedbackImg}
                                                 style={{maxHeight: 130, maxWidth: 105, marginLeft:20}}
                                                 alt={"Feedback utenti"}/>
                                            <Form.Group className="mb-3 d-flex flex-wrap justify-content-center" controlId="formBasicCheckbox" style={{marginTop:18}}>
                                                <Form.Check type="radio" checked={utenteRole} onChange={()=>{setUtenteRole(!utenteRole); setNutrizionistaRole(false)}} label="" className={"d-flex flex-wrap"}/>
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>
                                </Row>
                                <Container className={"d-flex flex-row justify-content-evenly"}
                                           style={{marginTop: 15}}>
                                    <div className="d-grid-4 gap-2 mt-3">
                                        <button
                                                type="submit"
                                                className="btn btn-primary">
                                            Avanti
                                        </button>
                                    </div>
                                </Container>
                                <div className="w-100 text-center mt-2">
                                    Hai già un account? <Link to="/login">Accedi</Link>
                                </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Container>
                </Container>
            </Container>
        </>
    );
}
