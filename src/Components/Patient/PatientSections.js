import {Button, Card, FloatingLabel, Form, Modal} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import React, {useState} from "react";

const PatientSections = ({
            section,
            formData,
            setFormData,
            disabled,
            allergie,
            intolleranze,
            patologie,
            setProgress,
            setLoading,
            setWarning,
            setError,
        }) => {

const cardBackgroundColor = {
background: "#FFEAD3"
};
const [showModal, setShowModal] = useState(false);
const [newExamText, setNewExamText] = useState('');
const [newExam, setNewExam] = useState('');

  //Funzione per gestire il cambio di stato delle checkbox
  const handleCheckboxChange = (tipo, id, isChecked) => {
    setFormData((prevFormData) => {
        const newArray = prevFormData[tipo].map((item) =>
            item.id === id ? { ...item, selected: isChecked } : item
        );

        return {
            ...prevFormData,
            [tipo]: newArray,
        };
    });
};
 const handleSaveExam = () => {
    // Aggiungi qui la logica per salvare l'esame
    console.log("Salva l'esame:", newExamText);
    setFormData({ ...formData, esami_effettuati: `${formData.esami_effettuati}\n${newExamText}` });
    setShowModal(false);
};
const handleSaveExamPresc = () => {
    // Aggiungi qui la logica per salvare l'esame
    console.log("Salva l'esame:", newExam);
    setFormData({ ...formData, esami_prescritti: `${formData.esami_prescritti}\n${newExam}` });
    setShowModal(false);
};
const handleCancelExam = () => {
    // Aggiungi qui la logica per annullare l'aggiunta dell'esame
    console.log("Annulla l'aggiunta dell'esame");
    setShowModal(false);
};

function calcolaEta(data_nascita_paziente) {
    // Crea un oggetto Date dalla data di nascita
    const dataNascitaObj = new Date(data_nascita_paziente);
    
    // Ottieni la data corrente
    const dataCorrente = new Date();
    
    // Calcola la differenza tra le due date in millisecondi
    const differenzaMillisecondi = dataCorrente - dataNascitaObj;

    // Calcola l'età in base alla differenza in millisecondi
    const eta = Math.floor(differenzaMillisecondi / (365.25 * 24 * 60 * 60 * 1000));

    return eta;
}

function calcolaMetabolismoBasale(sesso_paziente, peso_paziente, altezza_paziente, data_nascita_paziente) {
    const eta = calcolaEta(data_nascita_paziente);
    if (sesso_paziente === "M") {
        // Calcolo per uomo
        return 66.5 + (13.8 * peso_paziente) + (5.0 * altezza_paziente) - (6.8 * eta);
    } else if (sesso_paziente === "F") {
        // Calcolo per donna
        return 655 + (9.6 * peso_paziente) + (1.8 * altezza_paziente) - (4.7 * eta);
    } else {
        // Sesso non specificato o non valido
        return "Calcolo non eseguito correttamente";
    }
}
    /*
     Componente che si occupa della visualizzazione della sezione richiesta
     */
     const conditionalComponent = () => {
        switch (section) {
            case 0:
                //ANAGRAFICA PAZIENTE
                return <div>
                    <Card className={"col-10 mx-auto"}
                          style={{marginTop: 20}}>
                        <Card.Header style={cardBackgroundColor}
                                     className={"text-start d-flex d-inline"}
                                     as="h5"><p style={{marginRight: 20, marginBottom: 0}}>👤</p>Anagrafica</Card.Header>
                        <Card.Body>
                            <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group id="nome_paziente"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Nome">
                                        <Form.Control type="text"
                                                      placeholder="Nome"
                                                      value={formData.nome_paziente}
                                                      onChange={(e) => {
                                                          setFormData({...formData, nome_paziente: e.target.value});
                                                      }} 
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group id="cognome"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Cognome">
                                        <Form.Control type="text"
                                                      placeholder="Cognome"
                                                      value={formData.cognome_paziente}
                                                      onChange={(e) => {
                                                          setFormData({...formData, cognome_paziente: e.target.value});
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                            </Container>
                            <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group id="email"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid3"
                                                   label="Email">
                                        <Form.Control type="email"
                                                      placeholder="name@example.com"
                                                      onChange={(e) => {
                                                          setFormData({
                                                              ...formData,
                                                              email_paziente: e.target.value.toLowerCase()
                                                          });
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group id="numeroTelefono"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid4"
                                                   label="Numero di telefono">
                                        <Form.Control type="tel"
                                                      placeholder="Numero di telefono"
                                                      value={formData.numero_telefono_paziente}
                                                      onChange={(e) => {
                                                          setFormData({
                                                              ...formData,
                                                              numero_telefono_paziente: e.target.value
                                                          });
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                            </Container>
                            <Container className={"d-flex flex-wrap justify-content-evenly"}>
                            <Form.Group id="sesso"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid10"
                                                   label="Sesso">
                                        <Form.Select value={formData.sesso_paziente}
                                                     onChange={(e) => {
                                                     setFormData({...formData, sesso_paziente: e.target.value});
                                                     }}
                                                     disabled={disabled}
                                                     required>
                                            <option value={""}>-</option>
                                            <option value={"M"}>M</option>
                                            <option value={"F"}>F</option>
                                        </Form.Select>
                                    </FloatingLabel>
                                </Form.Group>
                            <Form.Group id="data_nascita"
                                        style={{marginBottom: 15, padding: 5}}
                                        className={"col-12 col-sm-6"}>
                                <FloatingLabel controlId="floatingInputGrid11"
                                                label="Data di nascita">
                                    <Form.Control type="date"
                                                    placeholder="Data di nascita"
                                                    value={formData.data_nascita_paziente}
                                                    onChange={(e) => {
                                                        setFormData({...formData, data_nascita_paziente: e.target.value});
                                                    }}
                                                    disabled={disabled}
                                                    required/>
                                </FloatingLabel>
                            </Form.Group>
                            </Container>
                            <Container className={"d-flex flex-wrap"}>
                                <Form.Group id="luogo_nascita"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Luogo di nascita">
                                        <Form.Control type="text"
                                                      placeholder="Luogo di nascita"
                                                      value={formData.luogo_nascita_paziente}
                                                      onChange={(e) => {
                                                          setFormData({...formData, luogo_nascita_paziente: e.target.value});
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group id="provincia_nascita"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Provincia">
                                        <Form.Control type="text"
                                                      placeholder="Provincia"
                                                      value={formData.provincia_nasc_paziente}
                                                      onChange={(e) => {
                                                          setFormData({...formData, provincia_nasc_paziente: e.target.value});
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                                </Container>
                                <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group id="citta_residenza"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Città di residenza">
                                        <Form.Control type="text"
                                                      placeholder="Città di residenza"
                                                      value={formData.citta_resid_paziente}
                                                      onChange={(e) => {
                                                          setFormData({...formData, citta_resid_paziente: e.target.value});
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group id="provincia_resid"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Provincia di residenza">
                                        <Form.Control type="text"
                                                      placeholder="Provincia di residenza"
                                                      value={formData.provincia_resid_paziente}
                                                      onChange={(e) => {
                                                          setFormData({...formData, provincia_resid_paziente: e.target.value});
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group id="via"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Via di residenza">
                                        <Form.Control type="text"
                                                      placeholder="Via di residenza"
                                                      value={formData.via_residenza_paziente}
                                                      onChange={(e) => {
                                                          setFormData({...formData, via_residenza_paziente: e.target.value});
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group id="codiceFiscale"
                                            style={{marginBottom: 15, padding: 5}}
                                            className={"col-12 col-sm-6"}>
                                    <FloatingLabel controlId="floatingInputGrid"
                                                   label="Codice fiscale">
                                        <Form.Control type="text"
                                                      placeholder="Codice fiscale"
                                                      value={formData.codice_fiscale_paziente}
                                                      onChange={(e) => {
                                                          setFormData({
                                                              ...formData,
                                                              codice_fiscale_paziente: e.target.value.toUpperCase()
                                                          });
                                                      }}
                                                      disabled={disabled}
                                                      required/>
                                    </FloatingLabel>
                                </Form.Group>
                            </Container>
                        </Card.Body>
                    </Card>
                </div>;
                //ANAMNESI
                case 1:
                    return <div>
                        <Card className={"col-10 mx-auto"}
                            style={{marginTop: 20}}>
                            <Card.Header style={cardBackgroundColor}
                                        className={"text-start d-flex d-inline"}
                                        as="h5"><p style={{marginRight: 20, marginBottom: 0}}></p>Anamnesi</Card.Header>
                            <Card.Body>
                                <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                    <Form.Group
                                        id="note_anamnesi"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12"}
                                    >
                                        <FloatingLabel controlId="floatingTextarea" label="Note Anamnesi">
                                            <Form.Control
                                                as="textarea"
                                                placeholder="Inserisci le tue note qui..."
                                                value={formData.note_anamnesi}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, note_anamnesi: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                        </FloatingLabel>
                                    </Form.Group>
                                </Container>
                            </Card.Body>
                        </Card>
                       </div>;
                       //ESAMI
                        case 2:
                        return <div>
                        <Card className={"col-10 mx-auto"}
                            style={{marginTop: 20}}>
                            <Card.Header style={cardBackgroundColor}
                                        className={"text-start d-flex d-inline"}
                                        as="h5"><p style={{marginRight: 20, marginBottom: 0}}></p>Esami effettuati</Card.Header>
                            <Card.Body>
                                <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="esami_effettuati"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12"}
                                    >
                                        <FloatingLabel controlId="floatingTextarea" label="Esami effettuati">
                                            <Form.Control
                                                as="textarea"
                                                placeholder="Inserisci gli esami effettuati e i valori da tenere sotto controllo"
                                                value={formData.esami_effettuati}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, esami_effettuati: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                        </FloatingLabel>
                                    </Form.Group>
                                    {/* Pulsante per aggiungere un esame */}
                         {/* Pulsante per aggiungere un esame  ma da sistemare!!!*/}

                         <Button variant="primary" onClick={() => setShowModal(false)}>
                            Aggiungi Esame
                        </Button>
                             </Container>
                            </Card.Body>
                        </Card>

                        <Card className={"col-10 mx-auto"}
                            style={{marginTop: 20}}>
                            <Card.Header style={cardBackgroundColor}
                                        className={"text-start d-flex d-inline"}
                                        as="h5"><p style={{marginRight: 20, marginBottom: 0}}></p>Esami Prescritti</Card.Header>
                            <Card.Body>
                                <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="esami_prescritti"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12"}
                                    >
                                        <FloatingLabel controlId="floatingTextarea" label="Esami prescritti">
                                            <Form.Control
                                                as="textarea"
                                                placeholder="Inserisci gli esami da prescrivere"
                                                value={formData.esami_prescritti}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, esami_prescritti: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                        </FloatingLabel>
                                    </Form.Group>
                                    {/* Pulsante per aggiungere un esame */}
                         {/* Pulsante per aggiungere un esame */}
                         <Button variant="primary" onClick={() => setShowModal(true)}>
                            Aggiungi Esame
                        </Button>
                             </Container>
                            </Card.Body>
                        </Card>
                        {/* Finestra modale per l'inserimento dell'esame */}
                        <Modal show={showModal} onHide={() => setShowModal(false)}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Inserisci un nuovo esame</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form.Group controlId="newExam" className={"mb-3"}>
                                                <Form.Label>Nuovo esame</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Inserisci il nome dell'esame da prescrivere"
                                                    value={newExam}
                                                    onChange={(e) => setNewExam(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={handleCancelExam}>
                                                Annulla
                                            </Button>
                                            <Button variant="primary" onClick={handleSaveExamPresc}>
                                                Salva
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                       </div>;
                        //PARAMETRI ANTROPOMETRICI
                        case 3:
                        return <div>
                        <Card className={"col-10 mx-auto"}
                            style={{marginTop: 20}}>
                            <Card.Header style={cardBackgroundColor}
                                        className={"text-start d-flex d-inline"}
                                        as="h5"><p style={{marginRight: 20, marginBottom: 0}}></p>Misure antropometriche</Card.Header>
                            <Card.Body>  
                                <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="altezza"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12 col-sm-6"}
                                    >
                                        <FloatingLabel controlId="floatingInputGrid" label="Altezza paziente">
                                            <Form.Control
                                                type="number"
                                                placeholder="Altezza"
                                                value={formData.altezza_paziente}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, altezza_paziente: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                            <span className="input-group-text">cm</span>
                                        </FloatingLabel>
                                    </Form.Group>
                             </Container>
                             <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="peso"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12 col-sm-6"}
                                    >
                                        <FloatingLabel controlId="floatingInputGrid" label="Peso">
                                            <Form.Control
                                                type="text"
                                                placeholder="Peso"
                                                value={formData.peso_paziente}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, peso_paziente: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                            <span className="input-group-text">kg</span>
                                        </FloatingLabel>
                                </Form.Group>
                                <Form.Group
                                    id="peso_obiettivo"
                                    style={{ marginBottom: 15, padding: 5 }}
                                    className={"col-12 col-sm-6"}
                                >
                                    <FloatingLabel controlId="floatingInputGrid" label="Obiettivo peso">
                                        <Form.Control
                                            type="text"
                                            placeholder="Obiettivo peso"
                                            value={formData.obiettivo_peso}
                                            onChange={(e) => {
                                                setFormData({ ...formData, obiettivo_peso: e.target.value });
                                            }}
                                            disabled={disabled}
                                        />
                                        <span className="input-group-text">kg</span>
                                    </FloatingLabel>
                                </Form.Group>
                             </Container>
                             <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="circonferenza fianchi"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12 col-sm-6"}
                                    >
                                        <FloatingLabel controlId="floatingInputGrid" label="Circonferenza fianchi">
                                            <Form.Control
                                                type="number"
                                                placeholder="Circonferenza fianchi"
                                                value={formData.circ_fianchi}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, circ_fianchi: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                            <span className="input-group-text">cm</span>
                                        </FloatingLabel>
                                </Form.Group>
                                <Form.Group
                                    id="circ_fianchi_obiettivo"
                                    style={{ marginBottom: 15, padding: 5 }}
                                    className={"col-12 col-sm-6"}
                                >
                                    <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                        <Form.Control
                                            type="number"
                                            placeholder="Obiettivo circ. fianchi"
                                            value={formData.obiett_fianchi}
                                            onChange={(e) => {
                                                setFormData({ ...formData, obiett_fianchi: e.target.value });
                                            }}
                                            disabled={disabled}
                                        />
                                        <span className="input-group-text">cm</span>
                                    </FloatingLabel>
                                </Form.Group>
                             </Container>
                             <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="circonferenza vita"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12 col-sm-6"}
                                    >
                                        <FloatingLabel controlId="floatingInputGrid" label="Circonferenza vita">
                                            <Form.Control
                                                type="number"
                                                placeholder="Circonferenza vita"
                                                value={formData.circ_vita}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, circ_vita: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                            <span className="input-group-text">cm</span>
                                        </FloatingLabel>
                                </Form.Group>
                                <Form.Group
                                    id="circ_vita_obiettivo"
                                    style={{ marginBottom: 15, padding: 5 }}
                                    className={"col-12 col-sm-6"}
                                >
                                    <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                        <Form.Control
                                            type="number"
                                            placeholder="Obiettivo circ. vita"
                                            value={formData.obiett_vita}
                                            onChange={(e) => {
                                                setFormData({ ...formData, obiett_vita: e.target.value });
                                            }}
                                            disabled={disabled}
                                        />
                                        <span className="input-group-text">cm</span>
                                    </FloatingLabel>
                                </Form.Group>
                             </Container>
                             <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="circonferenza torace"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12 col-sm-6"}
                                    >
                                        <FloatingLabel controlId="floatingInputGrid" label="Circonferenza torace">
                                            <Form.Control
                                                type="number"
                                                placeholder="Circonferenza torace"
                                                value={formData.circ_torace}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, circ_torace: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                            <span className="input-group-text">cm</span>
                                        </FloatingLabel>
                                </Form.Group>
                                <Form.Group
                                    id="circ_torace_obiettivo"
                                    style={{ marginBottom: 15, padding: 5 }}
                                    className={"col-12 col-sm-6"}
                                >
                                    <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                        <Form.Control
                                            type="number"
                                            placeholder="Obiettivo circ. torace"
                                            value={formData.obiett_torace}
                                            onChange={(e) => {
                                                setFormData({ ...formData, obiett_torace: e.target.value });
                                            }}
                                            disabled={disabled}
                                        />
                                        <span className="input-group-text">cm</span>
                                    </FloatingLabel>
                                </Form.Group>
                             </Container>
                             <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="circonferenza spalle"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12 col-sm-6"}
                                    >
                                        <FloatingLabel controlId="floatingInputGrid" label="Circonferenza spalle">
                                            <Form.Control
                                                type="number"
                                                placeholder="Circonferenza spalle"
                                                value={formData.circ_spalle}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, circ_spalle: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                            <span className="input-group-text">cm</span>
                                        </FloatingLabel>
                                </Form.Group>
                                <Form.Group
                                    id="circ_spalle_obiettivo"
                                    style={{ marginBottom: 15, padding: 5 }}
                                    className={"col-12 col-sm-6"}
                                >
                                    <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                        <Form.Control
                                            type="number"
                                            placeholder="Obiettivo circ. spalle"
                                            value={formData.obiett_spalle}
                                            onChange={(e) => {
                                                setFormData({ ...formData, obiett_spalle: e.target.value });
                                            }}
                                            disabled={disabled}
                                        />
                                        <span className="input-group-text">cm</span>
                                    </FloatingLabel>
                                </Form.Group>
                             </Container>
                             <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="circonferenza testa"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12 col-sm-6"}
                                    >
                                        <FloatingLabel controlId="floatingInputGrid" label="Circonferenza testa">
                                            <Form.Control
                                                type="number"
                                                placeholder="Circonferenza testa"
                                                value={formData.circ_testa}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, circ_testa: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                            <span className="input-group-text">cm</span>
                                        </FloatingLabel>
                                </Form.Group>
                                <Form.Group
                                    id="circ_testa_obiettivo"
                                    style={{ marginBottom: 15, padding: 5 }}
                                    className={"col-12 col-sm-6"}
                                >
                                    <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                        <Form.Control
                                            type="number"
                                            placeholder="Obiettivo circ. testa"
                                            value={formData.obiett_testa}
                                            onChange={(e) => {
                                                setFormData({ ...formData, obiett_testa: e.target.value });
                                            }}
                                            disabled={disabled}
                                        />
                                        <span className="input-group-text">cm</span>
                                    </FloatingLabel>
                                </Form.Group>
                             </Container>
                             <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="circonferenza cosce"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12 col-sm-6"}
                                    >
                                        <FloatingLabel controlId="floatingInputGrid" label="Circonferenza cosce">
                                            <Form.Control
                                                type="number"
                                                placeholder="Circonferenza cosce"
                                                value={formData.circ_cosce}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, circ_cosce: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                            <span className="input-group-text">cm</span>
                                        </FloatingLabel>
                                </Form.Group>
                                <Form.Group
                                    id="circ_cosce_obiettivo"
                                    style={{ marginBottom: 15, padding: 5 }}
                                    className={"col-12 col-sm-6"}
                                >
                                    <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                        <Form.Control
                                            type="number"
                                            placeholder="Obiettivo circ. cosce"
                                            value={formData.obiett_cosce}
                                            onChange={(e) => {
                                                setFormData({ ...formData, obiett_cosce: e.target.value });
                                            }}
                                            disabled={disabled}
                                        />
                                        <span className="input-group-text">cm</span>
                                    </FloatingLabel>
                                </Form.Group>
                             </Container>
                             <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="circonferenza collo"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12 col-sm-6"}
                                    >
                                        <FloatingLabel controlId="floatingInputGrid" label="Circonferenza collo">
                                            <Form.Control
                                                type="number"
                                                placeholder="Circonferenza collo"
                                                value={formData.circ_collo}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, circ_collo: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                            <span className="input-group-text">cm</span>
                                        </FloatingLabel>
                                </Form.Group>
                                <Form.Group
                                    id="circ_collo_obiettivo"
                                    style={{ marginBottom: 15, padding: 5 }}
                                    className={"col-12 col-sm-6"}
                                >
                                    <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                        <Form.Control
                                            type="number"
                                            placeholder="Obiettivo circ. collo"
                                            value={formData.obiett_collo}
                                            onChange={(e) => {
                                                setFormData({ ...formData, obiett_collo: e.target.value });
                                            }}
                                            disabled={disabled}
                                        />
                                        <span className="input-group-text">cm</span>
                                    </FloatingLabel>
                                </Form.Group>
                             </Container>
                             <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                <Form.Group
                                        id="circonferenza braccia"
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className={"col-12 col-sm-6"}
                                    >
                                        <FloatingLabel controlId="floatingInputGrid" label="Circonferenza braccia">
                                            <Form.Control
                                                type="number"
                                                placeholder="Circonferenza braccia"
                                                value={formData.circ_braccia}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, circ_braccia: e.target.value });
                                                }}
                                                disabled={disabled}
                                            />
                                            <span className="input-group-text">cm</span>
                                        </FloatingLabel>
                                </Form.Group>
                                <Form.Group
                                    id="circ_braccia_obiettivo"
                                    style={{ marginBottom: 15, padding: 5 }}
                                    className={"col-12 col-sm-6"}
                                >
                                    <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                        <Form.Control
                                            type="number"
                                            placeholder="Obiettivo circ. braccia"
                                            value={formData.obiett_braccia}
                                            onChange={(e) => {
                                                setFormData({ ...formData, obiett_braccia: e.target.value });
                                            }}
                                            disabled={disabled}
                                        />
                                        <span className="input-group-text">cm</span>
                                    </FloatingLabel>
                                </Form.Group>
                             </Container>
                            </Card.Body>
                        </Card>
                       </div>;
             //ALTRE MISURE
             case 4:
                return <div>
                <Card className={"col-10 mx-auto"}
                    style={{marginTop: 20}}>
                    <Card.Header style={cardBackgroundColor}
                                className={"text-start d-flex d-inline"}
                                as="h5"><p style={{marginRight: 20, marginBottom: 0}}></p>ALTRI PARAMETRI</Card.Header>
                    <Card.Body>
                        <Container className={"d-flex flex-wrap justify-content-evenly"}>
                        <Form.Group
                                id="carenze_vitaminiche"
                                style={{ marginBottom: 15, padding: 5 }}
                                className={"col-12 col-sm-6"}
                            >
                                <FloatingLabel controlId="floatingTextarea" label="Carenze vitaminiche">
                                    <Form.Control
                                        type="textarea"
                                        placeholder="Es. vitamina D..."
                                        value={formData.carenze_vitam}
                                        onChange={(e) => {
                                            setFormData({ ...formData, carenze_vitam: e.target.value });
                                        }}
                                        disabled={disabled}
                                    />
                                </FloatingLabel>
                            </Form.Group>
                     </Container>
                     <Container className={"d-flex flex-wrap justify-content-evenly"}>
                        <Form.Group
                                id="acqua_intra"
                                style={{ marginBottom: 15, padding: 5 }}
                                className={"col-12 col-sm-6"}
                            >
                                <FloatingLabel controlId="floatingInputGrid" label="Acqua intracellulare">
                                    <Form.Control
                                        type="text"
                                        placeholder="Acqua intracellulare"
                                        value={formData.acqua_intrace}
                                        onChange={(e) => {
                                            setFormData({ ...formData, acqua_intrace: e.target.value });
                                        }}
                                        disabled={disabled}
                                    />
                                    <span className="input-group-text">%</span>
                                </FloatingLabel>
                        </Form.Group>
                        <Form.Group
                            id="acquaintra_obiettivo"
                            style={{ marginBottom: 15, padding: 5 }}
                            className={"col-12 col-sm-6"}
                        >
                            <FloatingLabel controlId="floatingInputGrid" label="Obiettivo Acqua Intracellulare">
                                <Form.Control
                                    type="text"
                                    placeholder="Obiettivo"
                                    value={formData.obiett_acqua_intrace}
                                    onChange={(e) => {
                                        setFormData({ ...formData, obiett_acqua_intrace: e.target.value });
                                    }}
                                    disabled={disabled}
                                />
                                <span className="input-group-text">%</span>
                            </FloatingLabel>
                        </Form.Group>
                     </Container>
                     <Container className={"d-flex flex-wrap justify-content-evenly"}>
                        <Form.Group
                                id="acqua_extracellulare"
                                style={{ marginBottom: 15, padding: 5 }}
                                className={"col-12 col-sm-6"}
                            >
                                <FloatingLabel controlId="floatingInputGrid" label="Acqua extracellulare">
                                    <Form.Control
                                        type="text"
                                        placeholder="Acqua extracellulare"
                                        value={formData.acqua_extrace}
                                        onChange={(e) => {
                                            setFormData({ ...formData, acqua_extrace: e.target.value });
                                        }}
                                        disabled={disabled}
                                    />
                                    <span className="input-group-text">%</span>
                                </FloatingLabel>
                        </Form.Group>
                        <Form.Group
                            id="acqua_extrace_obiettivo"
                            style={{ marginBottom: 15, padding: 5 }}
                            className={"col-12 col-sm-6"}
                        >
                            <FloatingLabel controlId="floatingInputGrid" label="Obiettivo acqua extracellulare">
                                <Form.Control
                                    type="text"
                                    placeholder="Obiettivo"
                                    value={formData.obiett_acqua_extrace}
                                    onChange={(e) => {
                                        setFormData({ ...formData, obiett_acqua_extrace: e.target.value });
                                    }}
                                    disabled={disabled}
                                />
                                <span className="input-group-text">%</span>
                            </FloatingLabel>
                        </Form.Group>
                     </Container>
                     <Container className={"d-flex flex-wrap justify-content-evenly"}>
                        <Form.Group
                                id="massa_met_attiva"
                                style={{ marginBottom: 15, padding: 5 }}
                                className={"col-12 col-sm-6"}
                            >
                                <FloatingLabel controlId="floatingInputGrid" label="Massa metabolicamente attiva">
                                    <Form.Control
                                        type="text"
                                        placeholder="Massa metabolicamente attiva"
                                        value={formData.massa_met_att}
                                        onChange={(e) => {
                                            setFormData({ ...formData, massa_met_att: e.target.value });
                                        }}
                                        disabled={disabled}
                                    />
                                    <span className="input-group-text">%</span>
                                </FloatingLabel>
                        </Form.Group>
                        <Form.Group
                            id="massa_met_attiva_obiettivo"
                            style={{ marginBottom: 15, padding: 5 }}
                            className={"col-12 col-sm-6"}
                        >
                            <FloatingLabel controlId="floatingInputGrid" label="Obiettivo massa metab. attiva">
                                <Form.Control
                                    type="text"
                                    placeholder="Obiettivo"
                                    value={formData.obiett_massa_met_att}
                                    onChange={(e) => {
                                        setFormData({ ...formData, obiett_massa_met_att: e.target.value });
                                    }}
                                    disabled={disabled}
                                />
                                <span className="input-group-text">%</span>
                            </FloatingLabel>
                        </Form.Group>
                     </Container>
                     <Container className={"d-flex flex-wrap justify-content-evenly"}>
                        <Form.Group
                                id="met_basale"
                                style={{ marginBottom: 15, padding: 5 }}
                                className={"col-12 col-sm-6"}
                            >
                                <FloatingLabel controlId="floatingInputGrid" label="Metabolismo basale"> </FloatingLabel>
                                <div className="input-group">
                                    <div className="form-control" disabled>
                                        {calcolaMetabolismoBasale(formData.sesso_paziente, formData.peso_paziente, formData.altezza_paziente, formData.data_nascita_paziente)}
                                    </div>
                                    <span className="input-group-text">kcal/die</span>
                            </div>
                        </Form.Group>
                        <Form.Group
                            id="met_basale_obiett"
                            style={{ marginBottom: 15, padding: 5 }}
                            className={"col-12 col-sm-6"}
                        >
                            <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                <Form.Control
                                    type="number"
                                    placeholder="Obiettivo metabolismo basale"
                                    value={formData.obiett_met_basale}
                                    onChange={(e) => {
                                        setFormData({ ...formData, obiett_met_basale: e.target.value });
                                    }}
                                    disabled={disabled}
                                />
                                <span className="input-group-text">kcal/die</span>
                            </FloatingLabel>
                        </Form.Group>
                     </Container>  
                     <Container className={"d-flex flex-wrap justify-content-evenly"}>
                        <Form.Group
                                id="massa_grassa"
                                style={{ marginBottom: 15, padding: 5 }}
                                className={"col-12 col-sm-6"}
                            >
                                <FloatingLabel controlId="floatingInputGrid" label="Massa grassa"> 
                                <Form.Control
                                    type="number"
                                    placeholder="Massa grassa"
                                    value={formData.massa_grassa}
                                    onChange={(e) => {
                                        setFormData({ ...formData, massa_grassa: e.target.value });
                                    }}
                                    disabled={disabled}
                                />
                                <span className="input-group-text">%</span>
                                </FloatingLabel>
                        </Form.Group>
                        <Form.Group
                            id="obiett_massa_grassa"
                            style={{ marginBottom: 15, padding: 5 }}
                            className={"col-12 col-sm-6"}
                        >
                            <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                <Form.Control
                                    type="number"
                                    placeholder="Obiettivo massa grassa"
                                    value={formData.obiett_massa_grassa}
                                    onChange={(e) => {
                                        setFormData({ ...formData, obiett_massa_grassa: e.target.value });
                                    }}
                                    disabled={disabled}
                                />
                                <span className="input-group-text">%</span>
                            </FloatingLabel>
                        </Form.Group>
                     </Container>   
                     <Container className={"d-flex flex-wrap justify-content-evenly"}>
                        <Form.Group
                                id="massa_magra"
                                style={{ marginBottom: 15, padding: 5 }}
                                className={"col-12 col-sm-6"}
                            >
                                <FloatingLabel controlId="floatingInputGrid" label="Massa magra"> 
                                <Form.Control
                                    type="number"
                                    placeholder="Massa magra"
                                    value={formData.massa_magra}
                                    onChange={(e) => {
                                        setFormData({ ...formData, massa_magra: e.target.value });
                                    }}
                                    disabled={disabled}
                                />
                                <span className="input-group-text">%</span>
                                </FloatingLabel>
                        </Form.Group>
                        <Form.Group
                            id="obiett_massa_magra"
                            style={{ marginBottom: 15, padding: 5 }}
                            className={"col-12 col-sm-6"}
                        >
                            <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                <Form.Control
                                    type="number"
                                    placeholder="Obiettivo massa magra"
                                    value={formData.obiett_massa_magra}
                                    onChange={(e) => {
                                        setFormData({ ...formData, obiett_massa_magra: e.target.value });
                                    }}
                                    disabled={disabled}
                                />
                                <span className="input-group-text">%</span>
                            </FloatingLabel>
                        </Form.Group>
                     </Container>  
                     <Container className={"d-flex flex-wrap justify-content-evenly"}>
                        <Form.Group
                                id="angolo_bia"
                                style={{ marginBottom: 15, padding: 5 }}
                                className={"col-12 col-sm-6"}
                            >
                                <FloatingLabel controlId="floatingInputGrid" label="Angolo di fase(BIA)"> 
                                <Form.Control
                                    type="number"
                                    placeholder="Angolo di fase(BIA)"
                                    value={formData.angolo_bia}
                                    onChange={(e) => {
                                        setFormData({ ...formData, angolo_bia: e.target.value });
                                    }}
                                    disabled={disabled}
                                />
                                <span className="input-group-text">°</span>
                                </FloatingLabel>
                        </Form.Group>
                        <Form.Group
                            id="obiett_angolo_bia"
                            style={{ marginBottom: 15, padding: 5 }}
                            className={"col-12 col-sm-6"}
                        >
                            <FloatingLabel controlId="floatingInputGrid" label="Obiettivo">
                                <Form.Control
                                    type="number"
                                    placeholder="Obiettivo angolo di fase(BIA)"
                                    value={formData.obiett_angolo_bia}
                                    onChange={(e) => {
                                        setFormData({ ...formData, obiett_angolo_bia: e.target.value });
                                    }}
                                    disabled={disabled}
                                />
                                <span className="input-group-text">°</span>
                            </FloatingLabel>
                        </Form.Group>
                     </Container>           
                    </Card.Body>
                </Card>
               </div>; 
    //ALLERGIE
            case 5:
                return (
                <div>
                    <Card className={"col-10 mx-auto"} style={{ marginTop: 20 }}>
                    <Card.Header
                        style={cardBackgroundColor}
                        className={"text-start d-flex d-inline"}
                        as="h5"
                    >
                        <p style={{ marginRight: 20, marginBottom: 0 }}></p>ALLERGIE
                    </Card.Header>
                    <Card.Body>
                        <Container className={"d-flex flex-wrap justify-content-evenly"}>
                        {/* Colonna Allergie */}
                        <div className="col-6">
                            {allergie.map((allergia) => (
                            <Form.Group
                                key={`checkboxAllergia_${allergia.id}`}
                                controlId={`checkboxAllergia_${allergia.id}`}
                                style={{ marginBottom: 15, padding: 5 }}
                                className="d-flex align-items-center"
                            >
                                <Form.Check
                                type="checkbox"
                                id={`checkboxAllergia_${allergia.id}`}
                                label={allergia.nome}
                                checked={allergia.selected}
                                onChange={(e) =>
                                    handleCheckboxChange(
                                    'allergie',
                                    allergia.id,
                                    e.target.checked
                                    )
                                }
                                disabled={disabled}
                                />
                            </Form.Group>
                            ))}
                            {/* Aggiungi la componente testuale "Altro" nella colonna delle Allergie */}
                            <Form.Group
                            controlId="altroAllergie"
                            style={{ marginBottom: 15, padding: 5 }}
                            className="d-flex align-items-center"
                            >
                            <Form.Control
                                type="text"
                                placeholder="Altro"
                                value={formData.altroAllergie}
                                onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    altroAllergie: e.target.value,
                                })
                                }
                                disabled={disabled}
                            />
                            </Form.Group>
                        </div>
                        </Container>
                    </Card.Body>
                    </Card>
                </div>
                );

                case 6:
                    return (
                    <div>
                        <Card className={"col-10 mx-auto"} style={{ marginTop: 20 }}>
                        <Card.Header
                            style={cardBackgroundColor}
                            className={"text-start d-flex d-inline"}
                            as="h5"
                        >
                            <p style={{ marginRight: 20, marginBottom: 0 }}></p>INTOLLERANZE
                        </Card.Header>
                        <Card.Body>
                            <Container className={"d-flex flex-wrap justify-content-evenly"}>
                            {/* Colonna Intolleranze */}
                            <div className="col-6">
                                {intolleranze.map((intolleranza) => (
                                <Form.Group
                                    key={`checkboxIntolleranza_${intolleranza.id}`}
                                    controlId={`checkboxIntolleranza_${intolleranza.id}`}
                                    style={{ marginBottom: 15, padding: 5 }}
                                    className="d-flex align-items-center"
                                >
                                    <Form.Check
                                    type="checkbox"
                                    id={`checkboxIntolleranza_${intolleranza.id}`}
                                    label={intolleranza.nome}
                                    checked={intolleranza.selected}
                                    onChange={(e) =>
                                        handleCheckboxChange(
                                        'intolleranze',
                                        intolleranza.id,
                                        e.target.checked
                                        )
                                    }
                                    disabled={disabled}
                                    />
                                </Form.Group>
                                ))}
                                {/* Aggiungi la componente testuale "Altro" nella colonna delle Intolleranze */}
                                <Form.Group
                                controlId="altroIntolleranza"
                                style={{ marginBottom: 15, padding: 5 }}
                                className="d-flex align-items-center"
                                >
                                <Form.Control
                                    type="text"
                                    placeholder="Altro"
                                    value={formData.altroIntolleranze}
                                    onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        altroIntolleranze: e.target.value,
                                    })
                                    }
                                    disabled={disabled}
                                />
                                </Form.Group>
                            </div>
                            </Container>
                        </Card.Body>
                        </Card>
                    </div>
                    );

          //Patologie
                    case 7:
                        return (
                          <div>
                            <Card className={"col-10 mx-auto"} style={{ marginTop: 20 }}>
                              <Card.Header
                                style={cardBackgroundColor}
                                className={"text-start d-flex d-inline"}
                                as="h5"
                              >
                                <p style={{ marginRight: 20, marginBottom: 0 }}></p>PATOLOGIE
                              </Card.Header>
                              <Card.Body>
                                <Container className={"d-flex flex-wrap justify-content-evenly"}>
                                  {/* Colonna Patologie */}
                                  <div className="col-6">
                                    {patologie.map((patologia) => (
                                      <Form.Group
                                        key={`checkboxPatologie_${patologia.id}`}
                                        controlId={`checkboxPatologie_${patologia.id}`}
                                        style={{ marginBottom: 15, padding: 5 }}
                                        className="d-flex align-items-center"
                                      >
                                        <Form.Check
                                          type="checkbox"
                                          id={`checkboxPatologie_${patologia.id}`}
                                          label={patologia.nome}
                                          checked={patologia.selected}
                                          onChange={(e) =>
                                            handleCheckboxChange(
                                              'patologie',
                                              patologia.id,
                                              e.target.checked
                                            )
                                          }
                                          disabled={disabled}
                                        />
                                      </Form.Group>
                                    ))}
                                    {/* Aggiungi la componente testuale "Altro" nella colonna delle Allergie */}
                                    <Form.Group
                                      controlId="altroPatologie"
                                      style={{ marginBottom: 15, padding: 5 }}
                                      className="d-flex align-items-center"
                                    >
                                      <Form.Control
                                        type="text"
                                        placeholder="Altro"
                                        value={formData.altroPatologie}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            altroPatologie: e.target.value,
                                          })
                                        }
                                        disabled={disabled}
                                      />
                                    </Form.Group>
                                  </div>
                                </Container>
                              </Card.Body>
                            </Card>
                          </div>
                        );
                     
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
export default PatientSections;