import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Form, InputGroup, ListGroup, Navbar } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LinkContainer } from "react-router-bootstrap";
import PatientPreview from "../Progress/PatientPreview";
import { SyncLoader } from "react-spinners";
import Pagination from "../Utilities/Pagination";
import Spinner from "../Utilities/Spinner";
import { faAngleLeft, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function ShowPatients() {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [progress, setProgress] = useState(true);
  const patientsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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

          for (const uid of userPazienti) {
            const patientDocRef = doc(db, "users", uid, "anagrafica", uid);
            setCurrentPage(1);

            try {
              const patientDocSnapshot = await getDoc(patientDocRef);

              if (patientDocSnapshot.exists()) {
                const patientData = patientDocSnapshot.data();
                patientsData.push(patientData);
              }
            } catch (error) {
              console.error("Errore durante la query del paziente:", error.message);
            }
          }

          setPatients(patientsData);
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

  const filtered = patients.filter(
    (patient) =>
      searchInput.toLowerCase() === "" ||
      patient.nome.toLowerCase().includes(searchInput.toLowerCase()) ||
      patient.cognome.toLowerCase().includes(searchInput.toLowerCase()) ||
      patient.cf.toLowerCase().includes(searchInput.toLowerCase())
  );

  if (progress) {
    return <Spinner />;
  }

  return (
    <>
      <Container className={"modal-fullscreen"} style={{ background: "linear-gradient(123deg, rgba(247,209,98,1) 30%, rgba(251,149,96,1) 50%, rgba(254,88,94,1) 70%)", backgroundSize: "cover", minHeight: "inherit", padding: 0 }}>
        <Container className={"modal-fullscreen text-center"}>
          <Container className={"d-flex flex-column mx-auto my-auto"} style={{ minHeight: 450, marginTop: 20 }}>
            <Card className={"col-12 col-md-10 mx-auto"} style={{ marginTop: 20, marginBottom: 20, borderRadius: 16, boxShadow: "10px 10px 10px rgba(30,30,30,0.5)", borderLeft: "solid 1px rgba(255,255,255,0.8)", borderTop: "solid 1px rgba(255,255,255,0.8)" }}>
              <h2 style={{ fontFamily: "Arial", marginTop: 10 }}>I tuoi pazienti</h2>
              <div className={"d-flex my-auto col-12"}>
                <div className={"col-12"}>
                  <div className={"float-start"} style={{ marginTop: 10, marginLeft: 20 }}>
                    <LinkContainer to="/dashboard" className={"my-auto"}>
                      <Button style={{ height: 40, width: 100 }} variant={"warning"}><FontAwesomeIcon icon={faAngleLeft} color={"black"} /></Button>
                    </LinkContainer>
                  </div>
                </div>
              </div>
              {error && !patients && <Alert variant="danger">{error}</Alert>}
              {success && <Alert style={{ margin: 20 }} variant="primary" onClose={() => setSuccess("")} dismissible>{success}</Alert>}
              <SyncLoader color="#eb6164" loading={progress} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1 }} />
              <Container style={{ minHeight: 500 }}>
                <ListGroup className={"d-flex col-12 col-md-12 mx-auto"} style={{ marginBottom: 20 }}>
                  <Navbar expand="lg" className={"justify-content-evenly"}>
                    <Container className={"col-12"}>
                      <Container className={"col-12 col-md-6"} style={{ marginBottom: 10 }}>
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
                      <Container className={"col-6 col-md-3 d-inline-block"} style={{ marginBottom: 10, padding: 0 }}>
                        <Button variant="outline-danger" className={"flex-wrap"} onClick={() => navigate("/inserisci-paziente", { replace: true })}><FontAwesomeIcon icon={faPlus} style={{ marginRight: 5 }} />Inserisci paziente</Button>
                      </Container>
                    </Container>
                  </Navbar>
                  {filtered.map((patient) => (
                    <PatientPreview
                      key={patient.email}
                      id={patient.uid}
                      nomePaziente={patient.nome}
                      cognomePaziente={patient.cognome}
                      codiceFiscalePaziente={patient.cf}
                    />
                  ))}
                  {patients.length === 0 && !progress && <Alert variant={"warning"}>Non hai inserito ancora nessun paziente</Alert>}
                  {filtered.length === 0 && patients.length > 0 && !progress && (
                    <Alert variant={"warning"}>Nessun paziente soddisfa i parametri di ricerca</Alert>
                  )}
                </ListGroup>
              </Container>
              <Container className={"d-flex flex-wrap justify-content-center mt-auto"}>
                {patients.length !== 0 && <Pagination itemsCount={filtered.length} itemsPerPage={patientsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} alwaysShown={true} />}
              </Container>
            </Card>
          </Container>
        </Container>
      </Container>
    </>
  );
}
