import React from "react";
import Logo from "../../img/Logo.svg";
import NomeLogo from "../../img/NomeLogo.svg";
import {Button, Nav} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {useAuth} from "../../context/AuthContext";

/*
 Componente Footer del sito
 */
export const Footer = () => {
    const year = new Date().getFullYear();
    const {currentUser} = useAuth();
    return (
        <footer className="w-100 py-4 flex-shrink-0 position-absolute flex-bottom bg-light"
                style={{marginTop: "auto", marginBottom: 0}}>
            <div className="container py-4">
                <div className="row gy-4 gx-5">
                    <div className="col-lg-6 col-md-7 col-sm-6">
                        <LinkContainer to="/">
                            <h5 className="h1 text-black">
                                <img
                                    alt=""
                                    src={Logo}
                                    width="70"
                                    height="70"
                                    className="d-inline-block align-top"
                                    style={{cursor: "pointer"}}
                                />{" "}
                                <img
                                    alt=""
                                    src={NomeLogo}
                                    width="250"
                                    height="70"
                                    className="d-inline-block align-top"
                                    style={{cursor: "pointer"}}
                                />{" "}</h5>
                        </LinkContainer>
                        <p className="small">Ottieni subito l'accesso al bot Telegram cliccando
                                             sull'icona:</p>
                        <Button className={"text-center"}
                                aria-label={"Bottone Telegram"}
                                onClick={() => window.open("https://t.me/YourFoodCoachBot")}>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 width="48"
                                 height="24"
                                 fill="currentColor"
                                 className="bi bi-telegram"
                                 viewBox="0 0 16 16">
                                <path
                                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
                            </svg>
                        </Button>
                    </div>
                    <div className="col-lg-4 col-md-3 col-sm-4 col-6">
                        <h3 className="text-black mb-3">YourFoodCoach</h3>
                        <ul className="list-unstyled text-muted">
                            <LinkContainer to="/chi-siamo">
                                <li><Nav.Link href={"/chi-siamo"}
                                              style={{textDecoration: "none", cursor: "pointer"}}>Chi
                                                                                                  siamo</Nav.Link></li>
                            </LinkContainer>
                            <li><Nav.Link href="mailto:yourfoodcoach@outlook.it"
                                          style={{textDecoration: "none", cursor: "pointer"}}>Contattaci</Nav.Link></li>
                            <LinkContainer to="/informativa-privacy">
                                <li><Nav.Link href={"/informativa-privacy"}
                                              style={{textDecoration: "none", cursor: "pointer"}}>Informativa
                                                                                                  privacy</Nav.Link>
                                </li>
                            </LinkContainer>
                        </ul>
                    </div>
                    <div className="col-lg-2 col-md-2 col-sm-1 col-6">
                        <h3 className="text-black mb-3">Link Utili</h3>
                        <ul className="list-unstyled text-muted">
                            {!currentUser && (<>
                                {/*L'utente non è loggato*/}
                                <LinkContainer to="/login">
                                    <li><Nav.Link href={"/login"}
                                                  style={{textDecoration: "none", cursor: "pointer"}}>Accedi</Nav.Link>
                                    </li>
                                </LinkContainer>
                                <LinkContainer to="/signup">
                                    <li><Nav.Link href={"/signup"}
                                                  style={{
                                                      textDecoration: "none",
                                                      cursor: "pointer"
                                                  }}>Registrati</Nav.Link></li>
                                </LinkContainer>
                            </>)
                            }
                            {currentUser && (<>
                                {/*L'utente è loggato*/}
                                <LinkContainer to="/diete">
                                    <li><Nav.Link href={"/diete"}
                                                  style={{
                                                      textDecoration: "none",
                                                      cursor: "pointer"
                                                  }}>Gesione Diete</Nav.Link></li>
                                </LinkContainer>
                                <LinkContainer to="/pasti">
                                    <li><Nav.Link href={"/pasti"}
                                                  style={{
                                                      textDecoration: "none",
                                                      cursor: "pointer"
                                                  }}>Gestione Pasti</Nav.Link>
                                    </li>
                                </LinkContainer>
                                <LinkContainer to="/analizza-pasto">
                                    <li><Nav.Link href={"/analizza-pasto"}
                                                  style={{
                                                      textDecoration: "none",
                                                      cursor: "pointer"
                                                  }}>Analizza Pasto</Nav.Link>
                                    </li>
                                </LinkContainer>
                                <LinkContainer to="/progressi-pazienti">
                                    <li><Nav.Link href={"/progressi-pazienti"}
                                                  style={{
                                                      textDecoration: "none",
                                                      cursor: "pointer"
                                                  }}>Progressi Pazienti</Nav.Link>
                                    </li>
                                </LinkContainer>
                                <LinkContainer to="/feedback-pazienti">
                                    <li><Nav.Link href={"/feedback-pazienti"}
                                                  style={{
                                                      textDecoration: "none",
                                                      cursor: "pointer"
                                                  }}>Feedback Pazienti</Nav.Link>
                                    </li>
                                </LinkContainer>
                            </>)
                            }

                        </ul>
                    </div>
                </div>
            </div>
            <div className="text-center">
                <small className="text-center">&copy; YourFoodCoach, {year}.</small>
            </div>
        </footer>
    );
};
