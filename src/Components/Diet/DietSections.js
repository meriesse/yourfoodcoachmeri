import {Alert, Button, Card, Nav, Tab, FloatingLabel, Form, Row, Table} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import React, {useEffect, useState} from "react";
import {collection, doc, getDocs, getDoc, query, where} from "firebase/firestore";
import {db} from "../../config/firebase-config";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import {urlEncoded} from "../../context/DietContext";
import {clearArray} from "../../context/MealContext";
import { func } from "joi";
import {useAuth} from "../../context/AuthContext.js";
import createUtilityClassName from "react-bootstrap/esm/createUtilityClasses";
import PatientPreview from "../Progress/PatientPreview";
/*
 Componente che racchiude le sezioni che caratterizzano i campi di una singola dieta
 */
const DietSections = ({
                          section,
                          formData,
                          setFormData,
                          disabled,
                          setProgress,
                          setLoading,
                          setFood,
                          setUserInput,
                          nutrients,
                          kcals,
                          carbohydrates,
                          fats,
                          proteins,
                          setShowModalAnalysis,
                          setShowModalNewMeal,
                          setWarning,
                          setError,
                          reloadOptions,
                          setReloadOptions,
                          setCheckPaziente,
                          checkPaziente,
                          activeKey,
                          setActiveKey,
                      }) => {
    const [colazioni, setColazioni] = useState([]);
    const [pranzi, setPranzi] = useState([]);
    const [spuntini, setSpuntini] = useState([]);
    const [cene, setCene] = useState([]);
    const [patients, setPatients] = useState([]);
    const [patientsWithoutDiet, setPatientsWithoutDiet] = useState([]);
    const [noPatientsMessage, setNoPatientsMessage] = useState(null)
    const {currentUser} = useAuth();
    const [selectedPatient, setSelectedPatient] = useState(null);
    
    const handleTabSelect = (key) => {
        setActiveKey(key);
      };

    const cardBackgroundColor = {
        background: "#FFEAD3"
    };

    const handleSomeEvent = () => {
        // Fai qualcosa che influenzerà checkPaziente
        setCheckPaziente(true);
      };

    //Ottengo tutti i pasti con categoria 'COLAZIONE'
    const getColazioni = async () => {
        setProgress(true);
        const querySnapshot = await getDocs(query(collection(db, "pasti"), where("colazione", "==", true)));
        setColazioni(querySnapshot.docs.map((doc) => ({value: doc.id, label: doc.data().nome})));
        if (querySnapshot.empty) {
            setError("Per poter creare con successo una nuova dieta devi prima creare almeno un pasto per ogni categoria di pasto: Colazione, Pranzo, Spuntino e Cena. Puoi farlo subito andando nella sezione \"Gestione Pasti\"");
        }
        setProgress(false);
    };

    //Per mostrare i pazienti con una dieta e quindi la possibilità di aggiornarla
    useEffect(() => {
        const getPatients = async () => {
          setProgress(true);
      
          try {
            const userID = currentUser.uid;
            const userDocRef = doc(db, "users", userID);
            const userDocSnapshot = await getDoc(userDocRef);
      
            if (userDocSnapshot.exists()) {
              const nutrizionista = userDocSnapshot.data();
              const userPazienti = nutrizionista.pazienti || [];
      
              const patientsData = [];
              let noPatientsFound = true; // Flag per indicare se ci sono pazienti con diete attive
      
              for (const uid of userPazienti) {
                const patientDocRef = doc(db, "users", uid, "anagrafica", uid);
                const patientDocSnapshot = await getDoc(patientDocRef);
      
                if (patientDocSnapshot.exists()) {
                  // Verifica se il paziente ha una dieta attiva localmente
                  const dietsQuery = doc(db, "diets", uid);
                  const dietsQuerySnapshot = await getDoc(dietsQuery);
      
                  console.log("patientDocSnapshot.exists():", patientDocSnapshot.exists());
                  console.log("dietsQuerySnapshot.exists():", dietsQuerySnapshot.exists());
      
                  if (dietsQuerySnapshot.exists()) {
                    const currentData = new Date();
                    const dietData = dietsQuerySnapshot.data();
                    const dataFineDieta = new Date(dietData.data_fine_dieta);
      
                    if (currentData < dataFineDieta) {
                      console.log("La dieta è attiva per il paziente:", patientDocSnapshot.data());
                      patientsData.push(patientDocSnapshot.data());
                      noPatientsFound = false; // Ci sono pazienti con diete attive
                    }
                  }
                }
              }
      
              // Imposta il messaggio solo se non ci sono pazienti con diete attive
              if (noPatientsFound) {
                setNoPatientsMessage("Non sono stati trovati pazienti che rispettino i parametri.");
              } else {
                setNoPatientsMessage(null); // Azzera il messaggio se ci sono pazienti con diete attive
              }
      
              setPatients(patientsData);
              console.log("PatientsData:", patientsData);
              console.log("Patients:", patients);
            } else {
              console.log("Nessun nutrizionista trovato con l'email corrente");
            }
          } catch (error) {
            console.error("Errore durante la query degli utenti:", error.message);
          }
      
          setProgress(false);
        };
      
        getPatients();
      }, [currentUser]);
      
      
     
      
      //Per mostrare i pazienti che non hanno una dieta o è scaduta
      useEffect(() => {
        const getPatientsWithoutDiet = async () => {
          setProgress(true);
      
          try {
            const userID = currentUser.uid;
            const userDocRef = doc(db, "users", userID);
            const userDocSnapshot = await getDoc(userDocRef);
      
            if (userDocSnapshot.exists()) {
              const nutrizionista = userDocSnapshot.data();
              const userPazienti = nutrizionista.pazienti || [];
      
              const patientsDataWithoutDiet = [];
      
              for (const uid of userPazienti) {
                const patientDocRef = doc(db, "users", uid, "anagrafica", uid);
                const patientDocSnapshot = await getDoc(patientDocRef);
      
                if (patientDocSnapshot.exists()) {
                  // Ora, verifica se il paziente non ha una dieta attiva localmente
                  const dietsQuery = doc(db, "diets", uid);
                  const dietsQuerySnapshot = await getDoc(dietsQuery);
      
                  console.log("patientDocSnapshot.exists():", patientDocSnapshot.exists());
                  console.log("dietsQuerySnapshot.exists():", dietsQuerySnapshot.exists());
      
                  if (dietsQuerySnapshot.exists()) {
                    const currentData = new Date();
                    const dietData = dietsQuerySnapshot.data();
                    const dataFineDieta = new Date(dietData.data_fine_dieta);
      
                    if (currentData > dataFineDieta) {
                        setNoPatientsMessage(null);
                        console.log("La dieta non è attiva per il paziente:", patientDocSnapshot.data());                    
                        patientsDataWithoutDiet.push(patientDocSnapshot.data());
                    } else {
                        setNoPatientsMessage("Non sono stati trovati pazienti che rispettino i parametri.");
                        console.log("La dieta è attiva per il paziente:", patientDocSnapshot.data());
                    }
                  } else {
                    setNoPatientsMessage("Non sono stati trovati pazienti che rispettino i parametri.");
                    console.log("Nessuna dieta trovata per i pazienti");
                  }
                } else {
                setNoPatientsMessage("Non sono stati trovati pazienti che rispettino i parametri.");
                  console.log("Nessun paziente trovato per il nutrizionista corrente");
                }
              }
      
              setPatientsWithoutDiet(patientsDataWithoutDiet);
            } else {
              console.log("Nessun nutrizionista trovato con l'email corrente");
            }
          } catch (error) {
            console.error("Errore durante la query degli utenti:", error.message);
          }
      
          setProgress(false);
        };
      
        getPatientsWithoutDiet();
      }, [currentUser]);


    //Ottengo tutti i pasti con categoria 'PRANZO'
    const getPranzi = async () => {
        setProgress(true);
        const querySnapshot = await getDocs(query(collection(db, "pasti"), where("pranzo", "==", true)));
        setPranzi(querySnapshot.docs.map((doc) => ({value: doc.id, label: doc.data().nome})));
        if (querySnapshot.empty) {
            setError("Per poter creare con successo una nuova dieta devi prima creare almeno un pasto per ogni categoria di pasto: Colazione, Pranzo, Spuntino e Cena. Puoi farlo subito andando nella sezione \"Gestione Pasti\"");
        }
        setProgress(false);
    };

    //Ottengo tutti i pasti con categoria 'SPUNTINO'
    const getSpuntini = async () => {
        setProgress(true);
        const querySnapshot = await getDocs(query(collection(db, "pasti"), where("spuntino", "==", true)));
        setSpuntini(querySnapshot.docs.map((doc) => ({value: doc.id, label: doc.data().nome})));
        if (querySnapshot.empty) {
            setError("Per poter creare con successo una nuova dieta devi prima creare almeno un pasto per ogni categoria di pasto: Colazione, Pranzo, Spuntino e Cena. Puoi farlo subito andando nella sezione \"Gestione Pasti\"");
        }
        setProgress(false);
    };

    //Ottengo tutti i pasti con categoria 'CENA'
    const getCene = async () => {
        setProgress(true);
        const querySnapshot = await getDocs(query(collection(db, "pasti"), where("cena", "==", true)));
        setCene(querySnapshot.docs.map((doc) => ({value: doc.id, label: doc.data().nome})));
        if (querySnapshot.empty) {
            setError("Per poter creare con successo una nuova dieta devi prima creare almeno un pasto per ogni categoria di pasto: Colazione, Pranzo, Spuntino e Cena. Puoi farlo subito andando nella sezione \"Gestione Pasti\"");
        }
        setProgress(false);
    };

    //Carico le opzioni al caricamento della pagina
    useEffect(() => {
        getColazioni();
        getPranzi();
        getSpuntini();
        getCene();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //Ricarico le opzioni ogni volta che viene aggiunto un nuovo pasto
    useEffect(() => {
        if (reloadOptions) {
            getColazioni();
            getPranzi();
            getSpuntini();
            getCene();
            setReloadOptions(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadOptions]);

    //Gestione scelta relativa alla colazione unica
    useEffect(() => {
        if (formData.colazione_unica) {
            setFormData({
                ...formData,
                colazione_martedi: formData.colazione_lunedi,
                colazione_mercoledi: formData.colazione_lunedi,
                colazione_giovedi: formData.colazione_lunedi,
                colazione_venerdi: formData.colazione_lunedi,
                colazione_sabato: formData.colazione_lunedi,
                colazione_domenica: formData.colazione_lunedi
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.colazione_unica, formData.colazione_lunedi]);

    //Gestione scelta relativa allo spuntino unico della mattina
    useEffect(() => {
        if (formData.spuntino_unico_mattina) {
            setFormData({
                ...formData,
                spuntino_martedi_mattina: formData.spuntino_lunedi_mattina,
                spuntino_mercoledi_mattina: formData.spuntino_lunedi_mattina,
                spuntino_giovedi_mattina: formData.spuntino_lunedi_mattina,
                spuntino_venerdi_mattina: formData.spuntino_lunedi_mattina,
                spuntino_sabato_mattina: formData.spuntino_lunedi_mattina,
                spuntino_domenica_mattina: formData.spuntino_lunedi_mattina
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.spuntino_unico_mattina, formData.spuntino_lunedi_mattina]);


    //Gestione scelta relativa allo spuntino unico del pomeriggio
    useEffect(() => {
        if (formData.spuntino_unico_pomeriggio) {
            setFormData({
                ...formData,
                spuntino_martedi_pomeriggio: formData.spuntino_lunedi_pomeriggio,
                spuntino_mercoledi_pomeriggio: formData.spuntino_lunedi_pomeriggio,
                spuntino_giovedi_pomeriggio: formData.spuntino_lunedi_pomeriggio,
                spuntino_venerdi_pomeriggio: formData.spuntino_lunedi_pomeriggio,
                spuntino_sabato_pomeriggio: formData.spuntino_lunedi_pomeriggio,
                spuntino_domenica_pomeriggio: formData.spuntino_lunedi_pomeriggio
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.spuntino_unico_pomeriggio, formData.spuntino_lunedi_pomeriggio]);
      

    /*
     Funzione per l'analisi del pasto in input
     L'analisi viene effettuata sfruttando le API offerte da EDAMAM (https://developer.edamam.com/edamam-nutrition-api)
     */
    const handleSubmitAnalysis = async (e, value) => {
        e.preventDefault();
        setWarning("");

        if (value !== "" && value !== undefined) {
            //Inizializzo gli array per una nuova ricerca
            clearArray(nutrients);
            clearArray(kcals);
            clearArray(proteins);
            clearArray(carbohydrates);
            clearArray(fats);

            setProgress(true);
            setLoading(true);
            const req = {
                q: value,
                source: "it",
                target: "en"
            };
            axios.post(`https://translate.argosopentech.com/translate`, req).then((response) => {
                setFood(value);
                setUserInput(value.split(","));
                response.data.translatedText.split(",").forEach((ingredient) => {
                    let stringify = urlEncoded(ingredient);
                    axios.get(`https://api.edamam.com/api/nutrition-data?app_id=b92c2025&app_key=e1942e617a37552b845d1db4d36d9522&ingr=${stringify}`)
                         .then((res) => {
                             nutrients.push(res.data.totalNutrientsKCal);
                             proteins.push(res.data.totalNutrientsKCal.PROCNT_KCAL);
                             carbohydrates.push(res.data.totalNutrientsKCal.CHOCDF_KCAL);
                             fats.push(res.data.totalNutrientsKCal.FAT_KCAL);
                             kcals.push(res.data.totalNutrientsKCal.ENERC_KCAL);

                             if (nutrients.length === value.split(",").length) {
                                 setProgress(false);
                                 setLoading(false);
                                 setShowModalAnalysis(true);
                             }
                         });
                });
            });
        } else {
            setWarning("Per poter effettuare la ricerca inserisci prima un pasto nel formato richiesto: \nes. pane 50 gr, petto di pollo 80 gr");
        }
    };

    /*
     Componente che si occupa della visualizzazione della sezione richiesta
     */
    const conditionalComponent = () => {
        switch (section) {
            case 0:
                //PAZIENTE
                return <div>
                      <Card className="col-10 mx-auto" style={{ marginTop: 20 }}>
                        <Card.Header style={cardBackgroundColor} className="text-start d-flex d-inline" as="h5">
                          <p style={{ marginRight: 20, marginBottom: 0 }}>👤</p>Per quale paziente vuoi inserire la dieta?
                        </Card.Header>
                        <Card.Body>
                        <Nav variant="tabs" activeKey={activeKey} onSelect={handleTabSelect}>
                            <Nav.Item>
                              <Nav.Link eventKey="aggiornaDieta">Aggiorna Dieta</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link eventKey="inserisciNuovaDieta">Inserisci Nuova Dieta</Nav.Link>
                            </Nav.Item>
                          </Nav>
                  
                          {activeKey === "aggiornaDieta" && (
                            <div>
                              {patients.length > 0 ? (
                                <>
                                  <h4>Pazienti con dieta attiva</h4>
                                  <Table striped bordered hover>
                                    <tbody>
                                      {patients.map((patient) => (
                                        <tr key={patient.email}>
                                          <td style={{ verticalAlign: "middle" }}>
                                            <Form.Check
                                              type="radio"
                                              id={patient.uid}
                                              checked={selectedPatient && selectedPatient.uid === patient.uid}
                                              onChange={() => setSelectedPatient(patient)}
                                              onClick={() => {
                                                // Esempio di come puoi utilizzare setCheckPaziente per aggiornare lo stato in DietSections
                                                setCheckPaziente(checkPaziente);
                                              }}
                                            />
                                          </td>
                                          <td>
                                            <PatientPreview
                                              id={patient.uid}
                                              nomePaziente={patient.nome}
                                              cognomePaziente={patient.cognome}
                                              codiceFiscalePaziente={patient.cf}
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </>
                              ) : (
                                <div>Non ci sono pazienti con dieta attiva al momento.</div>
                              )}
                            </div>
                          )}
                  
                          {activeKey === "inserisciNuovaDieta" && (
                            <div>
                              {patientsWithoutDiet.length > 0 ? (
                                <>
                                  <h4>Pazienti senza dieta o con dieta scaduta</h4>
                                  <Table striped bordered hover>
                                    <tbody>
                                      {patientsWithoutDiet.map((patient) => (
                                        <tr key={patient.email}>
                                          <td style={{ verticalAlign: "middle" }}>
                                            <Form.Check
                                              type="radio"
                                              id={patient.uid}
                                              checked={selectedPatient && selectedPatient.uid === patient.uid}
                                              onClick={() => {
                                                // Esempio di come puoi utilizzare setCheckPaziente per aggiornare lo stato in DietSections
                                                setCheckPaziente(checkPaziente);
                                              }}
                                              onChange={() => setSelectedPatient(patient)}
                                            />
                                          </td>
                                          <td>
                                            <PatientPreview
                                              id={patient.uid}
                                              nomePaziente={patient.nome}
                                              cognomePaziente={patient.cognome}
                                              codiceFiscalePaziente={patient.cf}
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </>
                              ) : (
                                <div>Non ci sono pazienti senza dieta o con dieta scaduta al momento.</div>
                              )}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </div>;
                  
            //OBIETTIVI DIETA
            case 1:
                return <div>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>📈</p>Obiettivi
                                                                                                Dieta</Card.Header>
                        <Card.Body>
                            <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group id="dataInizioDieta"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Data inizio dieta">
                                        <Form.Control type="date"
                                                      placeholder="Data inizio dieta"
                                                      value={formData.data_inizio_dieta}
                                                      onChange={(e) => {
                                                          setFormData({...formData, data_inizio_dieta: e.target.value});
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group id="dataFineDieta"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Data fine dieta">
                                        <Form.Control type="date"
                                                      placeholder="Data fine dieta"
                                                      value={formData.data_fine_dieta}
                                                      onChange={(e) => {
                                                          setFormData({...formData, data_fine_dieta: e.target.value});
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                            </Container>
                            <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group id="kcalGiornaliere"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Kcal Giornaliere">
                                        <Form.Control type="number"
                                                      placeholder="Kcal Giornaliere"
                                                      value={formData.kcal_giornaliere}
                                                      onChange={(e) => {
                                                          setFormData({...formData, kcal_giornaliere: e.target.value});
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                            </Container>
                        </Card.Body>
                    </Card>
                </div>;
            //LUNEDI
            case 2:
                return <div>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🥐</p>Colazione</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"colazione_lunedi"}
                                    options={colazioni}
                                    placeholder="Seleziona colazione..."
                                    value={formData.colazione_lunedi}
                                    onChange={(e) => setFormData({...formData, colazione_lunedi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.colazione_lunedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                            <Container className={"text-start"}
                                       style={{margin: 0}}>
                                <Form.Group id="checkBoxColazione"
                                            style={{marginBottom: 5, marginTop: 15, padding: 0}}
                                            className={"col-12 col-sm-10"}>
                                    <Form.Check type="checkbox"
                                                label="Imposta questa colazione per i restanti giorni"
                                                onChange={() => {
                                                    setFormData({
                                                        ...formData,
                                                        colazione_unica: !formData.colazione_unica
                                                    });
                                                }}
                                                checked={formData.colazione_unica}
                                                disabled={disabled}/>
                                </Form.Group>
                            </Container>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🍎</p>Spuntino Mattutino</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_lunedi_mattina"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino mattutino..."
                                    value={formData.spuntino_lunedi_mattina}
                                    onChange={(e) => setFormData({...formData, spuntino_lunedi_mattina: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_lunedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                            <Container className={"text-start"}
                                       style={{margin: 0}}>
                                <Form.Group id="checkBoxSpuntinoMattutino"
                                            style={{marginBottom: 5, marginTop: 15, padding: 0}}
                                            className={"col-12 col-sm-10"}>
                                    <Form.Check type="checkbox"
                                                label="Imposta questo spuntino mattutino per i restanti giorni"
                                                onChange={() => {
                                                    setFormData({
                                                        ...formData,
                                                        spuntino_unico_mattina: !formData.spuntino_unico_mattina
                                                    });
                                                }}
                                                checked={formData.spuntino_unico_mattina}
                                                disabled={disabled}/>
                                </Form.Group>
                            </Container>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍝</p>Pranzo</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"pranzo_lunedi"}
                                    options={pranzi}
                                    placeholder="Seleziona pranzo..."
                                    value={formData.pranzo_lunedi}
                                    onChange={(e) => setFormData({...formData, pranzo_lunedi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.pranzo_lunedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🧃</p>Spuntino Pomeridiano</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_lunedi_pomeriggio"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino pomeridiano..."
                                    value={formData.spuntino_lunedi_pomeriggio}
                                    onChange={(e) => setFormData({...formData, spuntino_lunedi_pomeriggio: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_lunedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                            <Container className={"text-start"}
                                       style={{margin: 0}}>
                                <Form.Group id="checkBoxSpuntinoPomeriggio"
                                            style={{marginBottom: 5, marginTop: 15, padding: 0}}
                                            className={"col-12 col-sm-10"}>
                                    <Form.Check type="checkbox"
                                                label="Imposta questo spuntino pomeridiano per i restanti giorni"
                                                onChange={() => {
                                                    setFormData({
                                                        ...formData,
                                                        spuntino_unico_pomeriggio: !formData.spuntino_unico_pomeriggio
                                                    });
                                                }}
                                                checked={formData.spuntino_unico_pomeriggio}
                                                disabled={disabled}/>
                                </Form.Group>
                            </Container>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍖</p>Cena</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"cena_lunedi"}
                                    options={cene}
                                    placeholder="Seleziona cena..."
                                    value={formData.cena_lunedi}
                                    onChange={(e) => setFormData({...formData, cena_lunedi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.cena_lunedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                </div>;
            //MARTEDI
            case 3:
                return <div>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🥐</p>Colazione</Card.Header>
                        <Card.Body>
                            {formData.colazione_unica && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato la colazione del Lunedì per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"colazione_martedi"}
                                    options={colazioni}
                                    placeholder="Seleziona colazione..."
                                    value={formData.colazione_unica ? formData.colazione_lunedi : formData.colazione_martedi}
                                    onChange={(e) => setFormData({...formData, colazione_martedi: e})}
                                    isDisabled={formData.colazione_unica ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.colazione_martedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🍎</p>Spuntino Mattutino</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_mattina && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì mattina per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_martedi_mattina"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino mattutino..."
                                    value={formData.spuntino_unico_mattina ? formData.spuntino_lunedi_mattina : formData.spuntino_martedi_mattina}
                                    onChange={(e) => setFormData({...formData, spuntino_martedi_mattina: e})}
                                    isDisabled={formData.spuntino_unico_mattina ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_martedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍝</p>Pranzo</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"pranzo_martedi"}
                                    options={pranzi}
                                    placeholder="Seleziona pranzo..."
                                    value={formData.pranzo_martedi}
                                    onChange={(e) => setFormData({...formData, pranzo_martedi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.pranzo_martedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🧃</p>Spuntino Pomeridiano</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_pomeriggio && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì pomeriggio per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_martedi_pomeriggio"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino pomeridiano..."
                                    value={formData.spuntino_unico_pomeriggio ? formData.spuntino_lunedi_pomeriggio : formData.spuntino_martedi_pomeriggio}
                                    onChange={(e) => setFormData({...formData, spuntino_martedi_pomeriggio: e})}
                                    isDisabled={formData.spuntino_unico_pomeriggio ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_martedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍖</p>Cena</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"cena_martedi"}
                                    options={cene}
                                    placeholder="Seleziona cena..."
                                    value={formData.cena_martedi}
                                    onChange={(e) => setFormData({...formData, cena_martedi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.cena_martedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                </div>;
            case 4:
                //MERCOLEDI
                return <div>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🥐</p>Colazione</Card.Header>
                        <Card.Body>
                            {formData.colazione_unica && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato la colazione del Lunedì per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"colazione_mercoledi"}
                                    options={colazioni}
                                    placeholder="Seleziona colazione..."
                                    value={formData.colazione_unica ? formData.colazione_lunedi : formData.colazione_mercoledi}
                                    onChange={(e) => setFormData({...formData, colazione_mercoledi: e})}
                                    isDisabled={formData.colazione_unica ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.colazione_mercoledi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🍎</p>Spuntino Mattutino</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_mattina && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì mattina per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_mercoledi_mattina"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino mattutino..."
                                    value={formData.spuntino_unico_mattina ? formData.spuntino_lunedi_mattina : formData.spuntino_mercoledi_mattina}
                                    onChange={(e) => setFormData({...formData, spuntino_mercoledi_mattina: e})}
                                    isDisabled={formData.spuntino_unico_mattina ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_mercoledi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍝</p>Pranzo</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"pranzo_mercoledi"}
                                    options={pranzi}
                                    placeholder="Seleziona pranzo..."
                                    value={formData.pranzo_mercoledi}
                                    onChange={(e) => setFormData({...formData, pranzo_mercoledi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.pranzo_mercoledi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🧃</p>Spuntino Pomeridiano</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_pomeriggio && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì pomeriggio per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_mercoledi_pomeriggio"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino pomeridiano..."
                                    value={formData.spuntino_unico_pomeriggio ? formData.spuntino_lunedi_pomeriggio : formData.spuntino_mercoledi_pomeriggio}
                                    onChange={(e) => setFormData({...formData, spuntino_mercoledi_pomeriggio: e})}
                                    isDisabled={formData.spuntino_unico_pomeriggio ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_mercoledi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍖</p>Cena</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"cena_mercoledi"}
                                    options={cene}
                                    placeholder="Seleziona cena..."
                                    value={formData.cena_mercoledi}
                                    onChange={(e) => setFormData({...formData, cena_mercoledi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.cena_mercoledi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                </div>;
            case 5:
                //GIOVEDI
                return <div>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🥐</p>Colazione</Card.Header>
                        <Card.Body>
                            {formData.colazione_unica && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato la colazione del Lunedì per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"colazione_giovedi"}
                                    options={colazioni}
                                    placeholder="Seleziona colazione..."
                                    value={formData.colazione_unica ? formData.colazione_lunedi : formData.colazione_giovedi}
                                    onChange={(e) => setFormData({...formData, colazione_giovedi: e})}
                                    isDisabled={formData.colazione_unica ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.colazione_giovedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🍎</p>Spuntino Mattutino</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_mattina && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì mattina per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_giovedi_mattina"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino mattutino..."
                                    value={formData.spuntino_unico_mattina ? formData.spuntino_lunedi_mattina : formData.spuntino_giovedi_mattina}
                                    onChange={(e) => setFormData({...formData, spuntino_giovedi_mattina: e})}
                                    isDisabled={formData.spuntino_unico_mattina ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_giovedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍝</p>Pranzo</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"pranzo_giovedi"}
                                    options={pranzi}
                                    placeholder="Seleziona pranzo..."
                                    value={formData.pranzo_giovedi}
                                    onChange={(e) => setFormData({...formData, pranzo_giovedi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.pranzo_giovedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🧃</p>Spuntino Pomeridiano</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_pomeriggio && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì pomeriggio per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_giovedi_pomeriggio"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino pomeridiano..."
                                    value={formData.spuntino_unico_pomeriggio ? formData.spuntino_lunedi_pomeriggio : formData.spuntino_giovedi_pomeriggio}
                                    onChange={(e) => setFormData({...formData, spuntino_giovedi_pomeriggio: e})}
                                    isDisabled={formData.spuntino_unico_pomeriggio ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_giovedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍖</p>Cena</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"cena_giovedi"}
                                    options={cene}
                                    placeholder="Seleziona cena..."
                                    value={formData.cena_giovedi}
                                    onChange={(e) => setFormData({...formData, cena_giovedi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.cena_giovedi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                </div>;
            case 6:
                //VENERDI
                return <div>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🥐</p>Colazione</Card.Header>
                        <Card.Body>
                            {formData.colazione_unica && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato la colazione del Lunedì per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"colazione_venerdi"}
                                    options={colazioni}
                                    placeholder="Seleziona colazione..."
                                    value={formData.colazione_unica ? formData.colazione_lunedi : formData.colazione_venerdi}
                                    onChange={(e) => setFormData({...formData, colazione_venerdi: e})}
                                    isDisabled={formData.colazione_unica ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.colazione_venerdi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🍎</p>Spuntino Mattutino</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_mattina && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì mattina per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_venerdi_mattina"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino mattutino..."
                                    value={formData.spuntino_unico_mattina ? formData.spuntino_lunedi_mattina : formData.spuntino_venerdi_mattina}
                                    onChange={(e) => setFormData({...formData, spuntino_venerdi_mattina: e})}
                                    isDisabled={formData.spuntino_unico_mattina ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_venerdi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍝</p>Pranzo</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"pranzo_venerdi"}
                                    options={pranzi}
                                    placeholder="Seleziona pranzo..."
                                    value={formData.pranzo_venerdi}
                                    onChange={(e) => setFormData({...formData, pranzo_venerdi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.pranzo_venerdi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🧃</p>Spuntino Pomeridiano</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_pomeriggio && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì pomeriggio per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_venerdi_pomeriggio"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino pomeridiano..."
                                    value={formData.spuntino_unico_pomeriggio ? formData.spuntino_lunedi_pomeriggio : formData.spuntino_venerdi_pomeriggio}
                                    onChange={(e) => setFormData({...formData, spuntino_venerdi_pomeriggio: e})}
                                    isDisabled={formData.spuntino_unico_pomeriggio ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_venerdi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍖</p>Cena</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"cena_venerdi"}
                                    options={cene}
                                    placeholder="Seleziona cena..."
                                    value={formData.cena_venerdi}
                                    onChange={(e) => setFormData({...formData, cena_venerdi: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.cena_venerdi.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                </div>;
            case 7:
                //SABATO
                return <div>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🥐</p>Colazione</Card.Header>
                        <Card.Body>
                            {formData.colazione_unica && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato la colazione del Lunedì per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"colazione_sabato"}
                                    options={colazioni}
                                    placeholder="Seleziona colazione..."
                                    value={formData.colazione_unica ? formData.colazione_lunedi : formData.colazione_sabato}
                                    onChange={(e) => setFormData({...formData, colazione_sabato: e})}
                                    isDisabled={formData.colazione_unica ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.colazione_sabato.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🍎</p>Spuntino Mattutino</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_mattina && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì mattina per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_sabato_mattina"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino mattutino..."
                                    value={formData.spuntino_unico_mattina ? formData.spuntino_lunedi_mattina : formData.spuntino_sabato_mattina}
                                    onChange={(e) => setFormData({...formData, spuntino_sabato_mattina: e})}
                                    isDisabled={formData.spuntino_unico_mattina ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_sabato.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍝</p>Pranzo</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"pranzo_sabato"}
                                    options={pranzi}
                                    placeholder="Seleziona pranzo..."
                                    value={formData.pranzo_sabato}
                                    onChange={(e) => setFormData({...formData, pranzo_sabato: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.pranzo_sabato.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🧃</p>Spuntino Pomeridiano</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_pomeriggio && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì pomeriggio per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_sabato_pomeriggio"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino pomeridiano..."
                                    value={formData.spuntino_unico_pomeriggio ? formData.spuntino_lunedi_pomeriggio : formData.spuntino_sabato_pomeriggio}
                                    onChange={(e) => setFormData({...formData, spuntino_sabato_pomeriggio: e})}
                                    isDisabled={formData.spuntino_unico_pomeriggio ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_sabato.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍖</p>Cena</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"cena_sabato"}
                                    options={cene}
                                    placeholder="Seleziona cena..."
                                    value={formData.cena_sabato}
                                    onChange={(e) => setFormData({...formData, cena_sabato: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.cena_sabato.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                </div>;
            case 8:
                //DOMENICA
                return <div>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🥐</p>Colazione</Card.Header>
                        <Card.Body>
                            {formData.colazione_unica && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato la colazione del Lunedì per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"colazione_domenica"}
                                    options={colazioni}
                                    placeholder="Seleziona colazione..."
                                    value={formData.colazione_unica ? formData.colazione_lunedi : formData.colazione_domenica}
                                    onChange={(e) => setFormData({...formData, colazione_domenica: e})}
                                    isDisabled={formData.colazione_unica ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.colazione_domenica.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🍎</p>Spuntino Mattutino</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì mattina per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_domenica_mattina"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino mattutino..."
                                    value={formData.spuntino_unico_mattina ? formData.spuntino_lunedi_mattina : formData.spuntino_domenica_mattina}
                                    onChange={(e) => setFormData({...formData, spuntino_domenica_mattina: e})}
                                    isDisabled={formData.spuntino_unico_mattina ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_domenica.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍝</p>Pranzo</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"pranzo_domenica"}
                                    options={pranzi}
                                    placeholder="Seleziona pranzo..."
                                    value={formData.pranzo_domenica}
                                    onChange={(e) => setFormData({...formData, pranzo_domenica: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.pranzo_domenica.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{
                            marginRight: 20,
                            marginBottom: 0
                        }}>🧃</p>Spuntino Pomeridiano</Card.Header>
                        <Card.Body>
                            {formData.spuntino_unico_pomeriggio && !disabled
                                ? (
                                    <Alert className={"col-12 col-sm-11 col-lg-8 mx-auto"}
                                           variant={"warning"}>Hai già
                                                               impostato lo spuntino del Lunedì pomeriggio per i restanti
                                                               giorni della settimana,
                                                               se hai cambiato idea puoi modificare la tua scelta nella sezione dedicata del
                                                               Lunedì </Alert>
                                )
                                : (<></>)}
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"spuntino_domenica_pomeriggio"}
                                    options={spuntini}
                                    placeholder="Seleziona spuntino pomeridiano..."
                                    value={formData.spuntino_unico_pomeriggio ? formData.spuntino_lunedi_pomeriggio : formData.spuntino_domenica_pomeriggio}
                                    onChange={(e) => setFormData({...formData, spuntino_domenica_pomeriggio: e})}
                                    isDisabled={formData.spuntino_unico_pomeriggio ? true : disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.spuntino_domenica.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>🍖</p>Cena</Card.Header>
                        <Card.Body>
                            <Row className={"mx-auto justify-content-evenly gap-3 gap-lg-0"}>
                                <Select
                                    inputId={"cena_domenica"}
                                    options={cene}
                                    placeholder="Seleziona cena..."
                                    value={formData.cena_domenica}
                                    onChange={(e) => setFormData({...formData, cena_domenica: e})}
                                    isDisabled={disabled}
                                    className={"col-12 col-lg-10"}
                                    required
                                />
                                {!disabled && <Button variant="outline-secondary"
                                                      className={"col-4 col-lg-2 mx-auto"}
                                                      onClick={(e) => setShowModalNewMeal(true)}><FontAwesomeIcon
                                    icon={faPlus}
                                    style={{marginRight: 5}}/>Crea Nuovo</Button>}
                                {/*<Button variant="outline-secondary"
                                 className={"col-4 col-lg-2 mx-auto"}
                                 onClick={(e) => handleSubmitAnalysis(e, formData.cena_domenica.label)}><FontAwesomeIcon
                                 icon={faChartSimple}
                                 style={{marginRight: 5}}/>Analizza</Button>*/}
                            </Row>
                        </Card.Body>
                    </Card>
                </div>;
            default:
                return <div>Sezione non esistente</div>;
        }
    };

    return (
        <>
            {conditionalComponent()}
        </>
    );
};

export default DietSections;