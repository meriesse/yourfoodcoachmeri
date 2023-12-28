import React, {useEffect, useRef, useState} from "react";
import {Alert, Button, Card, FloatingLabel, Form} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.js";
import Container from "react-bootstrap/Container";
import {fetchUser, updateUser} from "../../context/UserContext";
import {SyncLoader} from "react-spinners";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "../../config/firebase-config";
import {updateTelephone} from "../../context/DietContext";
import {scrollToTop} from "../helpers/scroll";
import {LinkContainer} from "react-router-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft} from "@fortawesome/free-solid-svg-icons";

/*
 Funzione che si occupa di permettere all'utente di aggiornare le informzazioni relative al proprio account
 */
export default function UpdateProfile() {
    const {currentUser} = useAuth();
    //const uid = userCredential.user.uid;
    const [user, setUser] = useState({});
    const nomeRef = useRef();
    const cognomeRef = useRef();
    const numeroTelefonoRef = useRef();
    const cfRef = useRef();
    const dataNRef = useRef();
    const sessoRef = useRef();
    const luogo_nascitaRef = useRef();
    const prov_nascRef = useRef();
    const luogo_residRef = useRef();
    const prov_residRef = useRef();
    const via_residRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(false);
    //Flag di stato per determinare le modifiche nei dati
    const emailWarningMessage = "Non è possibile cambiare l'email associata all'account in fase di registrazione";
    const navigate = useNavigate();

    useEffect(() => {
        //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();
        fetchUser(currentUser.uid)
            .then((docSnap) => {
                const info = {
                    nome: docSnap.nome,
                    cognome: docSnap.cognome,
                    sesso: docSnap.sesso,
                    data_nasc: docSnap.data_nasc,
                    luogo_nasc: docSnap.luogo_nasc,
                    prov_nasc: docSnap.prov_nasc,
                    cf: docSnap.cf,
                    luogo_resid: docSnap.luogo_resid,
                    prov_resid: docSnap.prov_resid,
                    via_resid: docSnap.via_resid,
                    telefono: docSnap.telefono,
                    email: docSnap.email,
                   
                };
                setUser(info);
            })
            .catch((error) => {
                console.error(error);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser.uid]);


    function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setWarning("");

        //Controlla la corrispondenza delle password inserite
        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError("Le password non corrispondono");
        }

        //Controllo che almeno un valore inserito sia diverso da quelli precedenti
        if (luogo_residRef.current.value === user.luogo_resid && prov_residRef.current.value === user.prov_resid && via_residRef.current.value === user.via_resid &&  numeroTelefonoRef.current.value === user.telefono) {
            return setWarning("Non hai cambiato nessun valore.");
        }

        setProgress(true);

        const promises = [];

        if (passwordRef.current.value) {
            promises.push(currentUser.updatePassword(passwordRef.current.value));
        }
        // Aggiornamento dei dati utente
        promises.push(
            updateUser(
                currentUser.uid,
                nomeRef.current.value,
                cognomeRef.current.value,
                sessoRef.current.value,
                dataNRef.current.value,
                luogo_nascitaRef.current.value,
                prov_nascRef.current.value,
                cfRef.current.value,
                luogo_residRef.current.value,
                prov_residRef.current.value,
                via_residRef.current.value,
                numeroTelefonoRef.current.value,
                emailRef.current.value
            )
        );
         // Aggiornamento del numero di telefono nelle diete
    if (numeroTelefonoRef.current.value !== user.telefono) {
        promises.push(
            getDocs(query(collection(db, "diets"), where("email_nutrizionista", "==", currentUser.email))).then(
                (querySnapshot) => {
                    const updatePromises = [];
                    querySnapshot.forEach((doc) => {
                        updatePromises.push(updateTelephone({ numero_telefono_nutrizionista: numeroTelefonoRef.current.value }, doc.id));
                    });
                    return Promise.all(updatePromises);
                }
            )
        );
    }
 Promise.all(promises)
               .then(() => {
            setProgress(false);
            //L'utente viene indirizzato alla pagina che visualizza i dettagli dell'account
            navigate("/account", {state: "success-update", replace: true});
        }).catch(() => {
            setError("Non è stato possibile aggiornare l'account");
        }).finally(() => {
            setLoading(false);
            setProgress(false);
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
                                            <LinkContainer to="/account"
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
                                    style={{fontFamily: "Arial"}}>Aggiorna Profilo</h2>
                                {error && <Alert style={{margin: 20}}
                                                 variant="danger">{error}</Alert>}
                                {warning && <Alert style={{margin: 20}}
                                                   variant="warning">{warning}</Alert>}

                                <Form onSubmit={handleSubmit}
                                      className={"d-flex flex-column"}>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="nome"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="nome"
                                                           label="Nome">
                                                <Form.Control style={{color: "grey"}}
                                                              type="text"
                                                              ref={nomeRef}
                                                              placeholder="Nome"
                                                              defaultValue={user.nome}
                                                              readOnly/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="cognome"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="cognome"
                                                           label="Cognome">
                                                <Form.Control style={{color: "grey"}}
                                                              type="text"
                                                              ref={cognomeRef}
                                                              placeholder="Cognome"
                                                              defaultValue={user.cognome}
                                                              readOnly/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="sesso"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="sesso"
                                                           label="Sesso">
                                                <Form.Control style={{color: "grey"}}
                                                              type="text"
                                                              ref={sessoRef}
                                                              placeholder="Sesso"
                                                              defaultValue={user.sesso}
                                                              readOnly/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="data_nasc"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="data_nasc"
                                                           label="Data di nascita">
                                                <Form.Control style={{color: "grey"}}
                                                              type="date"
                                                              ref={dataNRef}
                                                              placeholder="Data di nascita"
                                                              defaultValue={user.data_nasc}
                                                              readOnly/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="luogonasc"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="LuogoNasc"
                                                           label="Luogo di nascita">
                                                <Form.Control style={{color: "grey"}}
                                                              type="text"
                                                              ref={luogo_nascitaRef}
                                                              placeholder="Luogo di nascita"
                                                              defaultValue={user.luogo_nasc}
                                                              readOnly/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="Provincia"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="ProvinciaNasc"
                                                           label="Provincia di nascita">
                                                <Form.Control style={{color: "grey"}}
                                                              type="text"
                                                              ref={prov_nascRef}
                                                              placeholder="Provincia di nascita"
                                                              defaultValue={user.prov_nasc}
                                                              readOnly/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="cf"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="cf"
                                                           label="Codice Fiscale">
                                                <Form.Control style={{color: "grey"}}
                                                              type="text"
                                                              ref={cfRef}
                                                              placeholder="Codice Fiscale"
                                                              defaultValue={user.cf}
                                                              readOnly/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="luogoresid"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="LuogoResid"
                                                           label="Luogo di residenza">
                                                <Form.Control type="text"
                                                              ref={luogo_residRef}
                                                              placeholder="Luogo di residenza"
                                                              defaultValue={user.luogo_resid}
                                                              onClick={() => setWarning("")}/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="provinciaRes"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="provinciares"
                                                           label="Provincia di Residenza">
                                                <Form.Control type="text"
                                                              ref={prov_residRef}
                                                              placeholder="Provincia di residenza"
                                                              defaultValue={user.prov_resid}
                                                              onClick={() => setWarning("")}/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="via_resid"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="via_resid"
                                                           label="Via di Residenza">
                                                <Form.Control type="text"
                                                              ref={via_residRef}
                                                              placeholder="Via di residenza"
                                                              defaultValue={user.via_resid}
                                                              onClick={() => setWarning("")}/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="numeroTelefono"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="numeroTelefono"
                                                           label="Numero di telefono">
                                                <Form.Control type="text"
                                                              ref={numeroTelefonoRef}
                                                              placeholder="Numero di telefono"
                                                              defaultValue={user.telefono}
                                                              onClick={() => setWarning("")}/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="email"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="email"
                                                           label="Email">
                                                <Form.Control style={{color: "grey"}}
                                                              type="email"
                                                              ref={emailRef}
                                                              placeholder="name@example.com"
                                                              defaultValue={user.email}
                                                              onClick={() => setWarning(emailWarningMessage)}
                                                              readOnly/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                        <Form.Group id="password"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="password"
                                                           label="Password">
                                                <Form.Control type="password"
                                                              ref={passwordRef}
                                                              placeholder="Password"
                                                              onClick={() => setWarning("")}/>
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group id="password-confirm"
                                                    style={{marginBottom: 15, padding: 5}}
                                                    className={"col-12 col-sm-6"}>
                                            <FloatingLabel controlId="password-confirm"
                                                           label="Conferma Password">
                                                <Form.Control type="password"
                                                              ref={passwordConfirmRef}
                                                              placeholder="Password"
                                                              onClick={() => setWarning("")}/>
                                            </FloatingLabel>
                                        </Form.Group>
                                    </Container>
                                    <Container className={"d-flex flex-row justify-content-evenly"}>
                                        <div className="d-grid-4 gap-2 mt-3">
                                            <button disabled={loading}
                                                    type="submit"
                                                    className="btn btn-primary">
                                                Conferma
                                            </button>
                                        </div>
                                    </Container>
                                    <Container className={"d-flex flex-row justify-content-evenly"}>
                                        <div className="d-grid-4 gap-2 mt-3">
                                            <div className="w-100 text-center mt-2">
                                                <Link to="/account">Annulla</Link>
                                            </div>
                                        </div>
                                    </Container>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Container>
                </Container>
            </Container>
        </>
    );
}
