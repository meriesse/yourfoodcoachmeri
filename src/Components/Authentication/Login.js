import React, {useEffect, useRef, useState} from "react";
import {Alert, Button, Card, FloatingLabel, Form} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import {auth} from "../../config/firebase-config.js";
import Container from "react-bootstrap/Container";
import {SyncLoader} from "react-spinners";
import {scrollToTop} from "../helpers/scroll";
import {LinkContainer} from "react-router-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft, faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";

/*
 Funzione che si occupa del login dell'utente a partire da email e password
 Il login avviene sfruttando i servizi offerti da Firebase
 */
export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(false);
    const [showDangerAlert, setshowDangerAlert] = useState(false);
    const[eye,setEye]=useState(true);
    const[type,setType]=useState(true);
    const navigate = useNavigate();

    //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
    useEffect(() => {
        scrollToTop();
    }, []);

    //Permette di nascondere i caratteri che compongono la password
    const Eye=()=>{
        setEye(!eye);
        setType(!type);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setProgress(true);
        await auth.signInWithEmailAndPassword(
            emailRef.current.value,
            passwordRef.current.value
        ).then(()=>{
            //L'utente viene indirizzato alla pagina che visualizza i dettagli dell'account
            navigate("/dashboard", {replace: true});
        }).catch((error) => {
            setError("Accesso fallito: nome utente o password errati");
            setshowDangerAlert(true);
            setProgress(false);
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
                        <Alert style={{margin: 20}}
                               className={"mx-auto"}
                               show={showDangerAlert}
                               variant="danger">
                            <p className="mb-0">
                                {error}
                            </p>
                        </Alert>
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
                                <SyncLoader color="#eb6164"
                                            loading={progress}
                                            style={{
                                                position: "absolute",
                                                top: "50%",
                                                left: "50%",
                                                transform: "translate(-50%, -50%)",
                                                zIndex: 1
                                            }}/>
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
                                    style={{fontFamily: "Arial"}}>Accedi</h2>
                                <Form onSubmit={handleSubmit}>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="email"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="floatingInputGrid"
                                                           label="Email">
                                                <Form.Control type="email"
                                                              ref={emailRef}
                                                              required
                                                              placeholder="name@example.com"/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="password"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-10 col-sm-5 col-md-5"}>
                                            <FloatingLabel controlId="floatingPassword"
                                                           label="Password">
                                                <Form.Control type={type ? "password" : "text"}
                                                              ref={passwordRef}
                                                              required
                                                              placeholder="Password"/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Container className={"col-1 col-sm-1 my-auto"}>
                                            <Button variant={"primary"} size={"sm"} className={"col-1 col-sm-1"} style={{padding: 10, marginBottom: 20, width: 40, height:40}}>
                                                <i className={"d-flex"} onClick={Eye} >{eye ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}</i>
                                            </Button>
                                        </Container>
                                    </Container>
                                    <div className="w-100 text-center mt-3">
                                        <Link to="/password-dimenticata">Non ricordi la password?</Link>
                                    </div>
                                    <div className="d-grid-4 gap-2 mt-3">
                                        <button disabled={loading}
                                                type="submit"
                                                className="btn btn-primary">
                                            Accedi
                                        </button>
                                    </div>
                                </Form>
                                <div className="w-100 align-text-bottom mt-3">
                                    Non ti sei ancora registrato? <Link to="/signup">Registrati</Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Container>
                </Container>
            </Container>
        </>
    );
}
