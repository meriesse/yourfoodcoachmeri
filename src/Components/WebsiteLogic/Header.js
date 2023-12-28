import React, {useState, useEffect} from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Logo from "../../img/Logo.svg";
import NomeLogo from "../../img/NomeLogo.svg";
import Offcanvas from "react-bootstrap/Offcanvas";
import {Alert, Button, Dropdown, Nav, NavDropdown} from "react-bootstrap";
import {useAuth} from "../../context/AuthContext";
import {auth} from "../../config/firebase-config";
import {useNavigate} from "react-router-dom";
import {LinkContainer} from "react-router-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faAppleWhole,
    faChartLine,
    faChartSimple,
    faCommentDots,
    faFolderOpen,
    faPlus,
    faRightFromBracket,
    faSearch,
    faUser
} from "@fortawesome/free-solid-svg-icons";
import {scrollToTop} from "../helpers/scroll";
import {fetchUser} from "../../context/UserContext";

export function Header(props) {

    const [progress, setProgress] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const [nome, setNome] = useState("Account");
    const [progressi_testo, setProgressi_testo] = useState("Progressi");
    const [feedback_testo, setFeedback_testo] = useState("Feedback");


    useEffect(() => {
        // Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();
    
        if (currentUser) {
            // Determino il nome dell'utente solo se già non impostato
            fetchUser(currentUser.uid)
                .then((docSnap) => {
                    if (docSnap.ruolo === "Nutrizionista") {
                        setProgressi_testo("Progressi Pazienti");
                        setFeedback_testo("Feedback Pazienti");
                    } else if (docSnap.ruolo === "Utente") {
                        setProgressi_testo("I tuoi Progressi");
                        setFeedback_testo("I tuoi Feedback");
                    }
                    setNome(docSnap.nome);
                    // Imposto il nome dell'utente così che possa essere visibile nell'header
                    localStorage.setItem("user", docSnap.nome);
                    localStorage.setItem("role", docSnap.ruolo);
                    //setNome(docSnap.nome);
                    //setNome(localStorage.getItem("user"));
                   
                })
                .catch((error) => {
                    console.error("Errore durante il recupero dei dati dell'utente:", error);
                })
                .finally(() => {
                    // Questo blocco verrà eseguito indipendentemente dal successo o dal fallimento della promessa
                    setProgress(false);
                });
        } else {
            setProgress(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);
    const isNutrizionista = localStorage.getItem("role") === 'Nutrizionista';
    async function handleLogout() {
        try {
            // Effettua il logout
            setError("");
            await auth.signOut();
    
            // Ripulisci i dati memorizzati nella cache locale
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            navigate("/", {replace: true});

            // Redirect alla LandingPage
            // ...
    
        } catch (error) {
            setError("Errore nell'eseguire il logout");
        }
    }

    return(
        <>
            { progress === false && <Navbar collapseOnSelect={true}
                                            bg="light"
                                            expand={props.expand}
                                            className="mb-0">
                <Container>
                    {/* Navbar*/}
                    <LinkContainer to="/">
                        <Navbar.Brand style={{marginLeft: 10, display: "inline", float: "left"}}
                                      aria-label="Vai alla homepage">
                            <img
                                alt=""
                                src={Logo}
                                width="60"
                                height="60"
                                className="d-inline-block align-top"
                                style={{cursor: "pointer"}}
                            />{" "}
                            <img
                                alt=""
                                src={NomeLogo}
                                width="200"
                                height="70"
                                className="d-inline-block align-top"
                                style={{cursor: "pointer"}}
                            />{" "}
                        </Navbar.Brand>
                    </LinkContainer>
                    <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${props.expand}`}/>
                    <Navbar.Offcanvas
                        id={`offcanvasNavbar-expand-${props.expand}`}
                        aria-labelledby={`offcanvasNavbarLabel-expand-${props.expand}`}
                        placement="end"
                    >
                        <Offcanvas.Header closeButton
                                          className={"text-align-center"}>
                            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${props.expand}`}
                                             style={{marginLeft: 15}}>
                                Menu:
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="justify-content-end flex-grow-1 mx-5 pe-4 me-auto"
                                 style={{textAlign: "match-parent"}}>
                                {!currentUser
                                    /*L'utente non è loggato*/
                                    ?
                                    (<LinkContainer to="/"
                                                    className={"my-auto"}
                                                    style={{marginRight: 30, padding: 15}}>
                                        <Nav.Link>
                                            Home
                                        </Nav.Link>
                                    </LinkContainer>)
                                    /*L'utente è loggato*/
                                    :
                                    (<LinkContainer to="/dashboard"
                                                    className={"my-auto"}
                                                    style={{marginRight: 30, padding: 15}}>
                                            <Nav.Link>
                                                Dashboard
                                            </Nav.Link>
                                        </LinkContainer>
                                    )
                                }
                                {/*Controllo autenticazione utente*/}
                                {!currentUser
                                    /*L'utente non è loggato*/
                                    ?
                                    (<LinkContainer to="/login"
                                                    className={"my-auto"}
                                                    style={{marginRight: 30, padding: 15}}>
                                        <Nav.Link>
                                            Accedi
                                        </Nav.Link>
                                    </LinkContainer>)
                                    /*L'utente è loggato*/
                                    :
                                    (<NavDropdown title={
                                        <span>
                                     <FontAwesomeIcon icon={faUser}
                                                      style={{marginRight: 5}}/> {nome}
                                </span>
                                    }
                                                  id="basic-nav-dropdown"
                                                  className={"my-auto"}
                                                  style={{marginRight: 30}}>
                                        <LinkContainer to="/account"
                                                       onClick={() => console.log("cliccato")}>
                                            <NavDropdown.Item>Dettagli</NavDropdown.Item>
                                        </LinkContainer>
                                        <LinkContainer to="/aggiorna-account">
                                            <NavDropdown.Item>Modifica</NavDropdown.Item>
                                        </LinkContainer>
                                        <NavDropdown.Divider/>
                                        <NavDropdown.Item onClick={handleLogout}>
                                            Disconnettiti <FontAwesomeIcon icon={faRightFromBracket}
                                                                           style={{marginLeft: 10}}/>
                                        </NavDropdown.Item>
                                    </NavDropdown>)
                                }

                                {!currentUser
                                    /*L'utente non è loggato*/
                                    ?
                                    (<LinkContainer to="/signup"
                                                    className={"my-auto"}
                                                    style={{marginRight: 20}}>
                                        <Nav.Link>
                                            <Button variant="outline-danger">Registrati</Button>
                                        </Nav.Link>
                                    </LinkContainer>)
                                    /*L'utente è loggato*/
                                    :
                                    (<div className={"d-flex my-3 text-end"}>
                                        <Dropdown className="me-3">
                                        <Dropdown.Toggle variant="outline-danger"
                                                         id="dropdown-diete">
                                            <FontAwesomeIcon icon={faAppleWhole}
                                                             style={{marginRight: 5}}/> Diete
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <LinkContainer to="/nuova-dieta">
                                                <Dropdown.Item><FontAwesomeIcon icon={faPlus}
                                                                                style={{marginRight: 5}}/> Nuova
                                                                                                           dieta</Dropdown.Item>
                                            </LinkContainer>
                                            <LinkContainer to="/diete">
                                                <Dropdown.Item><FontAwesomeIcon icon={faFolderOpen}
                                                                                style={{marginRight: 5}}/> Consulta
                                                                                                           diete</Dropdown.Item>
                                            </LinkContainer>
                                            <NavDropdown.Divider/>
                                            <LinkContainer to="/crea-pasto">
                                                <Dropdown.Item><FontAwesomeIcon icon={faPlus}
                                                                                style={{marginRight: 5}}/> Nuovo
                                                                                                           pasto</Dropdown.Item>
                                            </LinkContainer>
                                            <LinkContainer to="/pasti">
                                                <Dropdown.Item><FontAwesomeIcon icon={faFolderOpen}
                                                                                style={{marginRight: 5}}/> Consulta
                                                                                                           pasti</Dropdown.Item>
                                            </LinkContainer>
                                            <LinkContainer to="/analizza-pasto">
                                                <Dropdown.Item><FontAwesomeIcon icon={faChartSimple}
                                                                                style={{marginRight: 5}}/> Analizza
                                                                                                           pasto</Dropdown.Item>
                                            </LinkContainer>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    
                                {isNutrizionista && (
                                    <Dropdown>
                                        <Dropdown.Toggle variant="outline-danger"
                                                         id="dropdown-pazienti">
                                            <FontAwesomeIcon icon={faUser}
                                                             style={{marginRight: 5}}/> Pazienti
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <LinkContainer to="/tutti-pazienti">
                                                <Dropdown.Item><FontAwesomeIcon icon={faSearch}
                                                                                style={{marginRight: 5}}/> Cerca paziente</Dropdown.Item>
                                            </LinkContainer>
                                            <LinkContainer to="/inserisci-paziente">
                                                <Dropdown.Item><FontAwesomeIcon icon={faPlus}
                                                                                style={{marginRight: 5}}/> Inserisci paziente</Dropdown.Item>
                                            </LinkContainer>
                                            <LinkContainer to="/progressi-pazienti">
                                                <Dropdown.Item><FontAwesomeIcon icon={faChartLine}
                                                                                style={{marginRight: 5}}/> {progressi_testo}</Dropdown.Item>
                                            </LinkContainer>
                                            <LinkContainer to="/feedback-pazienti">
                                                <Dropdown.Item><FontAwesomeIcon icon={faCommentDots}
                                                                                style={{marginRight: 5}}/> {feedback_testo}</Dropdown.Item>
                                            </LinkContainer>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}
                                    </div>)}
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
                {error && <Alert className={"mx-auto col-10 flex-wrap"}
                                 variant="danger">{error}</Alert>}
            </Navbar>}
        </>
    )
}