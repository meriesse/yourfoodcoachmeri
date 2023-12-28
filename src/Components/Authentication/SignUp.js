import React, {useEffect, useRef, useState} from "react";
import {Alert, Button, Card, FloatingLabel, Form} from "react-bootstrap";
import {Link, useNavigate, useParams} from "react-router-dom";
import Container from "react-bootstrap/Container";
import {SyncLoader} from "react-spinners";
import {signUpUser} from "../../context/UserContext";
import {scrollToTop} from "../helpers/scroll";
import {LinkContainer} from "react-router-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft, faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
//import { Validator } from "@marketto/codice-fiscale-utils";
/*
 Funzione che si occupa della registrazione di un nuovo account
 I dati richiesti sono: nome, cognome, email, numero di telefono, password, conferma password
 All'utente è richiesto di leggere e accettare le condizioni sulla privacy del sito per finalizzare la registrazione
 Una volta creato, i dati dell'account vengono salvati su Firestore Database come documento
 */
export default function SignUp() {
    //Ottengo il ruolo dall'url
    const {ruolo} = useParams();
    const navigate = useNavigate();
    const nomeRef = useRef();
    const cognomeRef = useRef();
    const numeroTelefonoRef = useRef();
    const cfRef = useRef();
    const dataNRef = useRef();
    const sessoRef = useRef();
    const luogo_nascRef = useRef();
    const prov_nascRef = useRef();
    const luogo_residRef = useRef();
    const prov_residRef = useRef();
    const via_residRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(false);
    const [checkPrivacy, setCheckPrivacy] = useState(false);
    const [checkResponsability, setCheckResponsability] = useState(false);
    const [showDangerAlert, setShowDangerAlert] = useState(false);
    const[eye,setEye]=useState(true);
    const[type,setType]=useState(true);

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

        setProgress(true);
        setLoading(true);
        setError("");
        setShowDangerAlert(false);
    
       /* if (!Validator.codiceFiscale(cfRef.current.value).valid) {
            setError("Il codice fiscale inserito non è valido");
            setShowDangerAlert(true);
            setProgress(false);
            setLoading(false);
            scrollToTop();
            return;
        } else {*/

        //Memorizzo i dati dell'account utente nel database
        signUpUser (emailRef.current.value, passwordRef.current.value, nomeRef.current.value,
            cognomeRef.current.value, sessoRef.current.value, numeroTelefonoRef.current.value, cfRef.current.value, dataNRef.current.value, luogo_nascRef.current.value, prov_nascRef.current.value, luogo_residRef.current.value, prov_nascRef.current.value, via_residRef.current.value, ruolo).then(() => {
               
                setProgress(false);
                //L'utente viene indirizzato alla dashboard
             navigate("/dashboard", {replace: true});
            }
        ).catch((error) => {
            switch (error.code) {
                //L'email inserita risulta già associata ad un account
                case "auth/email-already-in-use":
                    setError("L'email inserita è già associata ad un account esistente");
                    setShowDangerAlert(true);
                    setProgress(false);
                    setLoading(false);
                    scrollToTop();
                    break;
                default :
                    setError("La registrazione non è andata a buon fine: " + error);
                    setShowDangerAlert(true);
                    setProgress(false);
                    setLoading(false);
                    scrollToTop();
                    break;
            }
        });
    //}
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
                <div className={"d-flex flex-wrap"}>
                    <Alert className={"mx-auto mt-4"}
                           show={showDangerAlert}
                           variant="danger">
                        <Alert.Heading>Registrazione Fallita!</Alert.Heading>
                        <hr/>
                        <p className="mb-0">
                            {error}
                        </p>
                    </Alert>
                </div>
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
                                            <LinkContainer to="/signup"
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
                                    style={{fontFamily: "Arial"}}>Registrazione</h2>
                                {(error && !showDangerAlert) &&
                                    <Alert style={{margin: 20}}
                                           variant="danger">{error}</Alert>}
                                <Form onSubmit={handleSubmit}
                                      className={"d-flex flex-column"}>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="nome"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="nome"
                                                           label="Nome">
                                                <Form.Control type="text"
                                                              ref={nomeRef}
                                                              placeholder="Nome"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="cognome"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="cognome"
                                                           label="Cognome">
                                                <Form.Control type="text"
                                                              ref={cognomeRef}
                                                              placeholder="Cognome"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                    <Form.Group id="sesso"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="sesso"
                                                           label="Sesso">
                                                <Form.Control type="text"
                                                              ref={sessoRef}
                                                              placeholder="Sesso"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="data_nascita"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="data_nascita"
                                                           label="Data nascita">
                                                <Form.Control type="date"
                                                              ref={dataNRef}
                                                              placeholder="Data di nascita"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="luogo_nasc"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="luogo_nasc"
                                                           label="Luogo di nascita">
                                                <Form.Control type="text"
                                                              ref={luogo_nascRef}
                                                              placeholder="Luogo di nascita"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="Prov_nasc"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="prov_nasc"
                                                           label="Provincia di nascita">
                                                <Form.Control type="text"
                                                              ref={prov_nascRef}
                                                              placeholder="Provincia di nascita"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="codice_fiscale"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="cf"
                                                           label="Codice Fiscale">
                                                <Form.Control type="text"
                                                              ref={cfRef}
                                                              placeholder="Codice Fiscale"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>





                                        <Form.Group id="luogo_resid"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="luogo_resid"
                                                           label="Luogo di Residenza">
                                                <Form.Control type="text"
                                                              ref={luogo_residRef}
                                                              placeholder="Luogo di residenza"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="prov_resid"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="prov_resid"
                                                           label="Provincia di residenza">
                                                <Form.Control type="text"
                                                              ref={prov_residRef}
                                                              placeholder="Provincia di residenza"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="via_resid"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="via_resid"
                                                           label="Via di residenza">
                                                <Form.Control type="text"
                                                              ref={via_residRef}
                                                              placeholder="Via di residenza"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="email"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="email"
                                                           label="Email">
                                                <Form.Control type="email"
                                                              ref={emailRef}
                                                              placeholder="name@example.com"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="numeroTelefono"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="numeroTelefono"
                                                           label="Numero di telefono">
                                                <Form.Control type="tel"
                                                              ref={numeroTelefonoRef}
                                                              placeholder="Numero di telefono"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="password"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-10 col-sm-5 col-md-5"}>
                                            <FloatingLabel controlId="floatingPassword"
                                                           label="Password">
                                                <Form.Control type={type ? "password" : "text"}
                                                              ref={passwordRef}
                                                              placeholder="Password"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Container className={"col-1 col-sm-1 my-auto"}>
                                            <Button variant={"primary"} size={"sm"} className={"col-1 col-sm-1"} style={{padding: 10, marginBottom: 20, width: 40, height:40}}>
                                                <i className={"d-flex"} onClick={Eye} >{eye ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}</i>
                                            </Button>
                                        </Container>
                                        <Form.Group id="password-confirm"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="floatingPasswordConfirmation"
                                                           label="Conferma Password">
                                                <Form.Control type={type ? "password" : "text"}
                                                              ref={passwordConfirmRef}
                                                              placeholder="Password"
                                                              required/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <div className={"form-check col-9 col-md-8 mx-auto"}>
                                        <input type="checkbox"
                                               className="form-check-input"
                                               id="checkPrivacy"
                                               onChange={() => {
                                                   setCheckPrivacy(!checkPrivacy);
                                               }}
                                               checked={checkPrivacy}
                                               required></input>
                                        <label className="form-check-label">Ho letto e accetto le <a
                                            href={"/informativa-privacy"}
                                            target="_blank"
                                            rel="noreferrer">condizioni
                                                             sulla privacy </a> di questo sito</label>
                                    </div>
                                    <div className={"form-check col-9 col-md-8 mx-auto"}>
                                        <input type="checkbox"
                                               className="form-check-input"
                                               id="checkResponsability"
                                               onChange={() => {
                                                   setCheckResponsability(!checkResponsability);
                                               }}
                                               checked={checkResponsability}
                                               required></input>
                                        <label className="form-check-label">YourFoodCoach declina ogni responsabilità per l'uso improprio del sito o informazioni fornite in modo errato</label>
                                    </div>
                                    <Container className={"d-flex flex-row justify-content-evenly"}
                                               style={{marginTop: 15}}>
                                        <div className="d-grid-4 gap-2 mt-3">
                                            <button disabled={loading}
                                                    type="submit"
                                                    className="btn btn-primary">
                                                Registrati
                                            </button>
                                        </div>
                                    </Container>
                                </Form>
                                <div className="w-100 text-center mt-2">
                                    Hai già un account? <Link to="/login">Accedi</Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Container>
                </Container>
            </Container>
        </>
    );
}
