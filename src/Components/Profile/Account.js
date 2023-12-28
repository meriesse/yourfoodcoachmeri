import React, {useEffect, useState} from "react";
import {Alert, Button, Card, Row, Modal, Form} from "react-bootstrap";
import {Link, useLocation} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.js";
import {fetchUser} from "../../context/UserContext.js";
import Container from "react-bootstrap/Container";
import {SyncLoader} from "react-spinners";
import {scrollToTop} from "../helpers/scroll";
import {LinkContainer} from "react-router-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft} from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { handleDelete } from "../Authentication/DeleteAccount.js";
/*
 Funzione che si occupa di mostrare i dettagli di un account
 */
export default function Account() {
    const [user, setUser] = useState([]);
    const [success, setSuccess] = useState("");
    const [progress, setProgress] = useState(false);
    const {currentUser} = useAuth();
    const location = useLocation();
    const [benvenuto_testo, setBenvenuto_testo] = useState("");
    let benvenuto_nutrizionista = "Benvenuto/a Dott./ssa";
    let benvenuto_utente = "Benvenuto/a";
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
  
    useEffect(() => {
        //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();
        setProgress(true);
        fetchUser(currentUser.uid)
            .then((docSnap) => {
                const info = {
                    nome: docSnap.nome,
                    cognome: docSnap.cognome,
                    email: docSnap.email,
                    cf: docSnap.cf,
                    sesso:docSnap.sesso,
                    data_nasc: docSnap.data_nasc,
                    luogo_nasc: docSnap.luogo_nasc,
                    prov_nasc: docSnap.prov_nasc,
                    luogo_resid: docSnap.luogo_resid,
                    prov_resid: docSnap.prov_resid,
                    via_resid: docSnap.via_resid,
                    telefono: docSnap.telefono,
                    ruolo: docSnap.ruolo
                };
                if (info.ruolo === "Nutrizionista") {
                    setBenvenuto_testo(benvenuto_nutrizionista);
                } else if (info.ruolo === "Utente") {
                    setBenvenuto_testo(benvenuto_utente);
                }
                setUser(info)
                localStorage.setItem("user", docSnap.nome);
                localStorage.setItem("role", docSnap.ruolo);
                setProgress(false);
            })
            .catch((error) => {
                console.error(error);
            });
        //Controllo se aggiornamento account avvenuto con successo
        if (location.state === "success-update") {
            setSuccess("Account aggiornato con successo");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser.email, location.state]);

    const handleDeleteAccount = async () => {
        try {
          const result = await handleDelete();
    
          if (result) {
            // Account eliminato con successo, puoi aggiungere logica aggiuntiva o reindirizzare l'utente
            console.log('Account eliminato con successo');
          }
        } catch (error) {
          // Gestisci gli errori qui
          console.error('Errore durante l\'eliminazione dell\'account', error);
        } finally {
          // Chiudi il modal dopo l'operazione
          handleCloseModal();
        }
      }; 
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
                        <Card className={"col-12 col-sm-10 col-lg-10 mx-auto"}
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
                                <div className="d-flex justify-content-between align-items-center my-auto col-12">
                                <div>
                                    <LinkContainer to="/dashboard" className="my-auto">
                                    <Button style={{ height: 40, width: 100 }} variant="warning">
                                        <FontAwesomeIcon icon={faAngleLeft} color="black" />
                                    </Button>
                                    </LinkContainer>
                                </div>
                                </div>
                                <h2 className="fw-normal mb-4"
                                    style={{fontFamily: "Arial"}}>Dettagli Account
                                    </h2>
                                {success &&
                                    <Alert style={{margin: 20}}
                                           variant="primary"
                                           onClose={() => setSuccess(false)}
                                           dismissible={true}>{success}</Alert>}
                                <div className="text-center">
                                    <strong>{benvenuto_testo} </strong>
                                    <i>
                                        {user.cognome} {user.nome}
                                    </i>
                                </div>
                                <Card className={"col-12 col-md-10 mx-auto"}
                                      style={{marginTop: 20}}>
                                    <section className="section about-section gray-bg"
                                             id="about">
                                        <div className="container">
                                            <div className="row align-items-center">
                                                <div className="col-lg-12">
                                                    <div className="col-md-12 mx-auto"
                                                         style={{marginTop: 15}}>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Email:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.email}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Nome:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.nome}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Cognome:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.cognome}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Codice Fiscale:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.cf}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Data di nascita:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.data_nasc}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Sesso:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.sesso}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Luogo di nascita:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.luogo_nasc}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Provincia di nascita:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.prov_nasc}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Luogo di residenza:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.luogo_resid}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Provincia di residenza:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.prov_resid}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Via di residenza:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.via_resid}</p>
                                                            </div>
                                                        </Row>
                                                        <Row className={"d-flex flew-row col-12"}>
                                                            <div className="col-5 text-end"
                                                                 style={{float: "right"}}>
                                                                <strong>Telefono:</strong>
                                                            </div>
                                                            <div className="col-7 text-start">
                                                                <p>{user.telefono}</p>
                                                            </div>
                                                        </Row>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </Card>
                                <div className="d-grid-4 gap-2 mt-3">
                                    <Link to="/aggiorna-account"
                                          className="btn btn-primary">
                                        Aggiorna
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Container>
                </Container>
            </Container>
        </>
    );
}
