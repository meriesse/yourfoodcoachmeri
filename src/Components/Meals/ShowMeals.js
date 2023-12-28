import React, {useEffect, useState} from "react";
import {Alert, Button, Card, Form, InputGroup, ListGroup, Navbar} from "react-bootstrap";
import {useLocation, useNavigate} from "react-router-dom";
import Container from "react-bootstrap/Container";
import ShowMealsImg from "../../img/showMealsImg.svg";
import {collection, getDocs, orderBy, query} from "firebase/firestore";
import {db} from "../../config/firebase-config";
import {SyncLoader} from "react-spinners";
import Pagination from "../Utilities/Pagination";
import MealPreview from "./MealPreview";
import Select from "react-select";
import Spinner from "../Utilities/Spinner";
import {scrollToTop} from "../helpers/scroll";
import {faAngleLeft, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {LinkContainer} from "react-router-bootstrap";

/*
 Funzione che si occupa di mostrare un elenco contenente tutti i pasti creati
 I pasti vengono impaginati in modo tale che ce ne siano 3 per pagina
 */
export default function ShowMeals() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [progress, setProgress] = useState(true);
    const location = useLocation();
    //Numero di diete visualizzate per pagina
    const mealsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [categoria, setCategoria] = useState("");
    const [meals, setMeals] = useState([]);
    const lastMealNumber = currentPage * mealsPerPage;
    const firstMealIndex = lastMealNumber - mealsPerPage;
    const navigate = useNavigate();

    const options = [
        {value: "", label: "-"},
        {value: "colazione", label: "Colazione"},
        {value: "pranzo", label: "Pranzo"},
        {value: "spuntino", label: "Spuntino"},
        {value: "cena", label: "Cena"}
    ];

    useEffect(() => {
        //Ad ogni caricamento la pagina effettua uno scroll fino al suo inizio
        scrollToTop();
        const getMeals = async () => {
            setProgress(true);
            await getDocs(query(collection(db, "pasti"), orderBy("data_inserimento", "desc")))
                .then((querySnapshot) => {
                    setMeals(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})));
                    setCurrentPage(1);
                })
                .catch((error) => setError("Si è verificato un errore inaspettato"))
                .finally(() => setProgress(false));
        };
        getMeals();

        //Controllo se aggiornamento avvenuto con successo
        if (location.state === "success-delete") {
            setSuccess("Pasto eliminato con successo");
        } else if (location.state === "success-create") {
            setSuccess("Pasto creato con successo");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = meals.filter(
        //Funzione di ricerca: cerca la stringa data in input in Nome
        (meal) => {
            return searchInput.toLowerCase() === "" ? meal
                : meal.nome.toLowerCase().includes(searchInput.toLowerCase());
        }
    ).filter(
        //Funzione di ricerca per categoria pasto
        (meal) => {
            return categoria === "" ? meal
                : meal[categoria.value] === true;
        });

    if (progress === true) {
        return <Spinner/>;
    }


    return (
        <>
            {progress === false && <Container className={"modal-fullscreen"}
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
                            <h2 style={{fontFamily: "Arial", marginTop: 10}}>
                                <div className={"d-flex my-auto col-12"}>
                                    <div className={"col-12"}>
                                        <div className={"float-start"}
                                             style={{marginTop: 10, marginLeft: 20}}>
                                            <LinkContainer to="/dashboard"
                                                           className={"my-auto"}>
                                                <Button style={{height: 40, width: 100}}
                                                        variant={"warning"}
                                                ><FontAwesomeIcon icon={faAngleLeft}
                                                                  color={"black"}/></Button>
                                            </LinkContainer>
                                        </div>
                                    </div>
                                </div>
                                <Container className={"d-flex justify-content-center my-auto align-items-center col-12"}
                                           style={{padding: 0}}>
                                    <img src={ShowMealsImg}
                                         id={"ShowMealsImg"}
                                         style={{height: 100, width: 100, marginRight: 10}}
                                         alt={"Pasti"}/>
                                    <p className={"my-auto"}>Pasti Creati</p>
                                </Container>
                            </h2>
                            {error && !meals && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert style={{margin: 20}}
                                               variant="primary"
                                               onClose={() => setSuccess(false)}
                                               dismissible={true}>{success}</Alert>}
                            <SyncLoader color="#eb6164"
                                        loading={progress}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            zIndex: 1
                                        }}/>
                            <Container style={{minHeight: 500}}>
                                <ListGroup className={"d-flex col-12 col-md-12 mx-auto"}
                                           style={{
                                               marginBottom: 20
                                           }}>
                                    <Navbar expand="lg"
                                            className={"justify-content-evenly"}>
                                        <Container className={"col-12"}>
                                            <Container className={"col-12 col-md-6"}
                                                       style={{marginBottom: 10}}>
                                                <InputGroup className="d-flex">
                                                    <Form.Control
                                                        type="search"
                                                        placeholder={"Cerca..."}
                                                        className={"me-2"}
                                                        aria-label="Search"
                                                        value={searchInput}
                                                        onChange={(e) => {
                                                            setCurrentPage(1);
                                                            setSearchInput(e.target.value);
                                                        }}
                                                    />
                                                </InputGroup>
                                            </Container>
                                            <Container className={"col-6 col-md-3"}
                                                       style={{marginBottom: 10}}>
                                                <Select
                                                    inputId={"categoria_pasto"}
                                                    options={options}
                                                    placeholder="Categoria"
                                                    value={categoria}
                                                    onChange={(e) => e.value === "" ? setCategoria("") : setCategoria(e)}
                                                />
                                            </Container>
                                            <Container className={"col-6 col-md-3 d-inline-block"}
                                                       style={{marginBottom: 10, padding: 0}}>
                                                <Button variant="outline-danger"
                                                        className={"flex-wrap"}
                                                        onClick={() => navigate("/crea-pasto", {replace: true})}><FontAwesomeIcon icon={faPlus}
                                                                                                                                  style={{marginRight: 5}}/>Aggiungi
                                                                                                                                                            Pasto</Button>

                                            </Container>
                                        </Container>
                                    </Navbar>
                                    {filtered.slice(firstMealIndex, lastMealNumber)
                                             .map((meal) =>
                                                 <MealPreview key={meal.id}
                                                              id={meal.id}
                                                              nome={meal.nome}
                                                              descrizione={meal.sostituzioni}
                                                              colazione={meal.colazione}
                                                              pranzo={meal.pranzo}
                                                              spuntino={meal.spuntino}
                                                              cena={meal.cena}
                                                 />)}
                                    {meals.length === 0
                                        ? (<Alert variant={"warning"}
                                                  style={{margin: 30}}>Non è stato creato ancora nessun
                                                                       pasto</Alert>)
                                        : (<></>)
                                    }
                                    {filtered.length === 0 && !error && meals.length > 0
                                        ? (<Alert variant={"warning"}
                                                  style={{margin: 30}}>Nessun pasto soddisfa i parametri
                                                                       di ricerca</Alert>)
                                        : (<></>)
                                    }
                                </ListGroup>
                            </Container>
                            <Container className={"d-flex flex-wrap justify-content-center mt-auto"}>
                                {meals.length !== 0 && <Pagination
                                    itemsCount={filtered.length}
                                    itemsPerPage={mealsPerPage}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    alwaysShown={true}
                                />}
                            </Container>
                        </Card>
                    </Container>
                </Container>
            </Container>
            }
        </>
    );
}
