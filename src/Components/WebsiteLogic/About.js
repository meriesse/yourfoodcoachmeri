import React, {useEffect} from "react";
import {Button, Card} from "react-bootstrap";
import {Link} from "react-router-dom";
import Container from "react-bootstrap/Container";
import AboutImg from "../../img/aboutImg.png";
import {scrollToTop} from "../helpers/scroll";
import {LinkContainer} from "react-router-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft} from "@fortawesome/free-solid-svg-icons";

/*
 Funzione che mostra le informazioni relative all'iniziativa 'YourFoodCoach'
 */
export default function About() {

    //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
    useEffect(() => {
        scrollToTop();
    }, []);

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
                                    style={{fontFamily: "Arial"}}>Cosa
                                                                  è <strong>YourFoodCoach</strong>?</h2>
                                <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                    <div className={"col-12 col-sm-6"}>
                                        <div className="container w-100 h-100">
                                            <div className="row align-items-center h-100">
                                                <Container className={"text-center my-auto"}>
                                                    <p><strong>Benvenuto/a</strong>,</p>
                                                    <p><strong>YourFoodCoach </strong>
                                                        è un progetto creato per supportare coloro che seguono quotidianamente una dieta.
                                                        È composto da un <strong>portale web</strong> accessibile a tutti, sia ai nutrizionisti che ai non esperti,
                                                        dove è possibile inserire una dieta personalizzata e da un <strong>chatbot Telegram</strong> che fornisce consigli e suggerimenti alimentari quotidiani.
                                                        Clicca sul bottone per accedere subito al bot:</p>
                                                    <div className={"text-center"}>
                                                        <Button className={"text-center"}
                                                                onClick={() => window.open("https://t.me/YourFoodCoachBot")}>
                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                 width="56"
                                                                 height="28"
                                                                 fill="currentColor"
                                                                 className="bi bi-telegram"
                                                                 viewBox="0 0 16 16">
                                                                <path
                                                                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                </Container>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={"col-12 col-sm-6"}>
                                        <img src={AboutImg}
                                             alt={"About"}
                                             className={"img-fluid"}
                                             style={{maxHeight: 700}}/>
                                    </div>
                                </Container>
                                <div className="w-100 align-text-bottom mt-3">
                                    <p className="small text-muted"><strong>Desideri utilizzare il servizio?</strong> <Link
                                        to="/signup">Registrati</Link></p>
                                </div>
                                <div className="w-100 align-text-bottom mt-3">
                                    <p className="small text-muted"><strong>Hai già un account?</strong> <Link
                                        to="/login">Effettua il login</Link></p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Container>
                </Container>
            </Container>
        </>
    );
}
