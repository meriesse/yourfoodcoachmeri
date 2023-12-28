import React, {useEffect, useState} from "react";
import axios from "axios";
import {Alert, Button, Card, Col, Form, InputGroup, Navbar, Row} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import ShowMealsImg from "../../img/showMealsImg.svg";
import {SyncLoader} from "react-spinners";
import MealAnalysisPreview from "./MealAnalysisPreview";
import PieChart from "react-pie-graph-chart";
import {faEyeSlash, faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {urlEncoded} from "../../context/DietContext";
import {scrollToTop} from "../helpers/scroll";
import {sumArrayObject} from "sum-any";
import {clearArray} from "../../context/MealContext";

/*
 Funzione che si occupa di eseguire l'analisi di un pasto dato in input dall'utente
 L'analisi viene effettuata sfruttando le API offerte da EDAMAM (https://developer.edamam.com/edamam-nutrition-api)
 */
export default function MealAnalysis() {
    const [warning, setWarning] = useState("");
    const [progress, setProgress] = useState(false);
    const [loading, setLoading] = useState(true);
    const [food, setFood] = useState("");
    const [nutrients] = useState([]);
    const [kcals] = useState([]);
    const [proteins] = useState([]);
    const [fats] = useState([]);
    const [carbohydrates] = useState([]);
    const [userInput, setUserInput] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const mealNameRegex = /^([a-z\s]+\d+[a-z\s]+,)*([a-z\s]+\d+[a-z\s]+){1}$/;


    const cardBackgroundColor = {
        background: "#FFEAD3"
    };

    //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
    useEffect(() => {
        scrollToTop();
    }, []);

    /*
     Funzione per l'analisi del pasto in input
     L'analisi viene effettuata sfruttando le API offerte da EDAMAM (https://developer.edamam.com/edamam-nutrition-api)
     La traduzione dell'input dell'utente, da italiano ad inglese, viene effettuata sfruttando le API offerte da LIBRETRANSLATE (https://libretranslate.de/)
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setWarning("");

        if (!mealNameRegex.test(food)) {
            setProgress(false);
            setLoading(false);
            scrollToTop();
            return setWarning("Per poter eseguire l'analisi il titolo del pasto deve contenere il nome dell'ingrediente e la sua quantità, in caso di più ingredienti questi devono essere separati da una virgola: es. pane 50 gr, petto di pollo 80 gr");
        }
        if (food !== "") {
            //Inizializzo gli array per una nuova ricerca
            clearArray(nutrients);
            clearArray(kcals);
            clearArray(proteins);
            clearArray(carbohydrates);
            clearArray(fats);

            setProgress(true);
            setLoading(true);
            const req = {
                q: food,
                source: "it",
                target: "en"
            };
            axios.post(`https://translate.argosopentech.com/translate`, req).then((response) => {
                setUserInput(food.split(","));
                response.data.translatedText.split(",").forEach((ingredient) => {
                    let stringify = urlEncoded(ingredient);
                    axios.get(`https://api.edamam.com/api/nutrition-data?app_id=b92c2025&app_key=e1942e617a37552b845d1db4d36d9522&ingr=${stringify}`)
                         .then((res) => {
                             nutrients.push(res.data.totalNutrientsKCal);
                             proteins.push(res.data.totalNutrientsKCal.PROCNT_KCAL);
                             carbohydrates.push(res.data.totalNutrientsKCal.CHOCDF_KCAL);
                             fats.push(res.data.totalNutrientsKCal.FAT_KCAL);
                             kcals.push(res.data.totalNutrientsKCal.ENERC_KCAL);

                             if (nutrients.length === food.split(",").length) {
                                 setProgress(false);
                                 setLoading(false);
                             }
                         });
                });
            });
        } else {
            setWarning("Per poter effettuare la ricerca inserisci prima un pasto nel formato richiesto: \nes. pane 50 gr, petto di pollo 80 gr");
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
                               style={{minHeight: 450, marginTop: 20}}>
                        <Card className={"col-12 col-md-10 mx-auto"}
                              style={{
                                  marginTop: 20,
                                  marginBottom: 20,
                                  borderRadius: 16,
                                  boxShadow: "10px 10px 10px rgba(30,30,30,0.5)",
                                  borderLeft: "solid 1px rgba(255,255,255,0.8)",
                                  borderTop: "solid 1px rgba(255,255,255,0.8)"
                              }}>
                            <SyncLoader color="#eb6164"
                                        loading={progress}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            zIndex: 1
                                        }}/>
                            <Card className={"col-11 col-lg-11 mx-auto"}
                                  style={{marginTop: 20, marginBottom: 20}}>
                                <Card.Header style={cardBackgroundColor}
                                             className={"text-start"}
                                             as="h5">Analisi
                                                     pasto</Card.Header>
                                <Card.Body>
                                    {warning && <Alert style={{margin: 20}}
                                                       variant="warning">{warning}</Alert>}
                                    <>
                                        <div>
                                            <Container
                                                className={"d-flex justify-content-center my-auto align-items-center col-12"}
                                                style={{padding: 0}}>
                                                <img src={ShowMealsImg}
                                                     id={"ShowMealsImg"}
                                                     style={{height: 200, width: 200, marginRight: 10}}
                                                     alt={"Pasti"}/>
                                            </Container>
                                            <div>
                                                Inserisci un pasto per ottenere subito informazioni riguardo ai
                                                macronutrienti e ai valori calorici degli ingredienti in esso contenuti:
                                            </div>
                                            <Navbar expand="lg">
                                                <Container
                                                    className={"d-flex flex-wrap justify-content-evenly col-12 col-sm-10 gap-2"}>
                                                    <Container style={{marginBottom: 15, padding: 5}}
                                                               className={"col-12 col-sm-8 my-auto"}>
                                                        <InputGroup style={{marginTop: 10}}
                                                                    className={"my-auto"}>
                                                            <Form.Control
                                                                type="search"
                                                                placeholder={"es. pane 50 gr, petto di pollo 80 gr"}
                                                                aria-label="Search"
                                                                value={food}
                                                                onChange={(e) => setFood(e.target.value)}
                                                            />
                                                        </InputGroup>
                                                    </Container>
                                                    <Container className={"col-12 col-sm-2 my-auto mx-auto"}>
                                                        <Button variant="outline-danger"
                                                                className={"flex-wrap"}
                                                                onClick={handleSubmit}>Analizza</Button>
                                                    </Container>
                                                </Container>
                                            </Navbar>
                                            {!loading ? (<></>) : (
                                                <small style={{color: "grey", verticalAlign: "bottom"}}>Inserisci gli
                                                                                                        ingredienti separandoli con la virgola</small>
                                            )}
                                            {progress ? (<></>) : (
                                                //Ha finito di caricare i risultati della ricerca
                                                <>
                                                    {(!loading && nutrients.length > 0) && (
                                                        <>
                                                            <Card className={"col-10 mx-auto"}
                                                                  style={{padding: 0, marginTop: 15}}>
                                                                <Container style={{padding: 0}}>
                                                                    <Card.Header className={"text-center"}
                                                                                 style={cardBackgroundColor}><strong>Valori
                                                                                                                     nutrizionali totali</strong></Card.Header>
                                                                    <Card.Body>
                                                                        <Container className={"col-12 my-auto"}
                                                                                   style={{marginLeft: 17}}>
                                                                            <Row
                                                                                className={"d-flex flew-row col-12 justify-content-center"}
                                                                                style={{marginRight: 0}}>
                                                                                <Col>
                                                                                    <div className="text-start">
                                                                                        <strong>Energia:</strong>
                                                                                    </div>
                                                                                    <div className="text-start">
                                                                                        <p>{sumArrayObject(kcals, "quantity")} Kcal</p>
                                                                                    </div>
                                                                                </Col>
                                                                                <Col>
                                                                                    <div className="text-start">
                                                                                        <strong>Carboidrati:</strong>
                                                                                    </div>
                                                                                    <div className="text-start">
                                                                                        <p>{sumArrayObject(carbohydrates, "quantity")} gr.</p>
                                                                                    </div>
                                                                                </Col>
                                                                                <Col>
                                                                                    <div className="text-start">
                                                                                        <strong>Grassi:</strong>
                                                                                    </div>
                                                                                    <div className="text-start">
                                                                                        <p>{sumArrayObject(fats, "quantity")} gr.</p>
                                                                                    </div>
                                                                                </Col>
                                                                                <Col>
                                                                                    <div className="text-start">
                                                                                        <strong>Proteine:</strong>
                                                                                    </div>
                                                                                    <div className="text-start">
                                                                                        <p>{sumArrayObject(proteins, "quantity")}gr.</p>
                                                                                    </div>
                                                                                </Col>
                                                                            </Row>
                                                                        </Container>
                                                                    </Card.Body>
                                                                </Container>
                                                            </Card>
                                                            <PieChart data={[
                                                                {
                                                                    type: "Carboidrati",
                                                                    value: sumArrayObject(carbohydrates, "quantity"),
                                                                    color: "#fbd464"
                                                                },
                                                                {
                                                                    type: "Grassi",
                                                                    value: sumArrayObject(fats, "quantity"),
                                                                    color: "#fb7270"
                                                                },
                                                                {
                                                                    type: "Proteine",
                                                                    value: sumArrayObject(proteins, "quantity"),
                                                                    color: "#3897f1"
                                                                }
                                                            ]}/>
                                                            <Container>
                                                                {showDetails
                                                                    ? (<Button variant="outline-secondary"
                                                                               className={"flex-wrap"}
                                                                               onClick={(e) => setShowDetails(false)}><FontAwesomeIcon
                                                                        icon={faEyeSlash}
                                                                        style={{marginRight: 5}}/>Nascondi
                                                                                                  dettagli</Button>)
                                                                    : (<Button variant="outline-secondary"
                                                                               className={"flex-wrap"}
                                                                               onClick={(e) => setShowDetails(true)}><FontAwesomeIcon
                                                                        icon={faMagnifyingGlass}
                                                                        style={{marginRight: 5}}/>Mostra
                                                                                                  dettagli</Button>)
                                                                }
                                                                <Container style={{marginTop: 20}}>
                                                                    {showDetails && nutrients.map((item, index) => (
                                                                        <MealAnalysisPreview key={index}
                                                                                             index={index}
                                                                                             userInput={userInput}
                                                                                             item={item}/>
                                                                    ))}
                                                                </Container>
                                                            </Container>
                                                        </>
                                                    )}
                                                    {(nutrients.length === 0 && !warning && loading === false) ? (
                                                        <Alert className={"col-10 mx-auto"}
                                                               variant={"warning"}>La ricerca non ha prodotto risultati</Alert>) : (<></>)}
                                                </>
                                            )}
                                        </div>
                                    </>
                                </Card.Body>
                            </Card>
                        </Card>
                    </Container>
                </Container>
            </Container>
        </>
    );
}
