import React, {useEffect, useRef, useState} from "react";
import {Alert, Button, Card, FloatingLabel, Form} from "react-bootstrap";
import {Link} from "react-router-dom";
import {auth} from "../../config/firebase-config.js";
import Container from "react-bootstrap/Container";
import {scrollToTop} from "../helpers/scroll";
import {LinkContainer} from "react-router-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft} from "@fortawesome/free-solid-svg-icons";

/*
 Funzione che si occupa del reset della password a partire dall'email associata all'account
 */
export default function ForgotPassword() {
    const emailRef = useRef();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDangerAlert, setshowDangerAlert] = useState(false);

    //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
    useEffect(() => {
        scrollToTop();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setSuccess("");
        setError("");
        setshowDangerAlert(false);
        setLoading(true);
        await auth.sendPasswordResetEmail(emailRef.current.value).then(() => {
            setSuccess("Controlla la tua casella di posta: ti abbiamo inviato un link per il reset della password");
            setLoading(false);
        }).catch((error) => {
            setError("L'email inserita non è associata ad un account esistente");
            setshowDangerAlert(true);
            setLoading(false);
        });
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
                        <Alert className={"mx-auto"}
                               show={showDangerAlert}
                               variant="danger">
                            <p className="mb-0">
                                {error}
                            </p>
                        </Alert>
                        {success && <Alert className={"mx-auto col-10 flex-wrap"}
                                           variant={"primary"}
                                           style={{margin: 30}}>{success}</Alert>}
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
                                <h2 className="fw-normal mb-4"
                                    style={{fontFamily: "Arial"}}>Resetta password</h2>
                                <Form onSubmit={handleSubmit}
                                      className={"d-flex flex-wrap justify-content-evenly"}>
                                    <Form.Group id="email"
                                                style={{marginBottom: 15, padding: 5}}
                                                className={"col-10"}>
                                        <FloatingLabel controlId="floatingInputGrid"
                                                       label="Email">
                                            <Form.Control type="email"
                                                          ref={emailRef}
                                                          required
                                                          placeholder="name@example.com"/>
                                        </FloatingLabel>
                                    </Form.Group>
                                    <div className="d-grid-4 gap-2 mt-3">
                                        <button disabled={loading}
                                                type="submit"
                                                className="btn btn-primary">
                                            Resetta password
                                        </button>
                                    </div>
                                </Form>
                                <div className="w-100 align-text-bottom mt-3">
                                    Devi creare un nuovo account? <Link to="/signup">Registrati</Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Container>
                </Container>
            </Container>
        </>
    );
}
