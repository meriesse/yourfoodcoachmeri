import React from "react";
import {Button, Modal} from "react-bootstrap";

/*
 Componente che si occupa di mostrare un Modal per richiedere la conferma dell'eliminazione
 */
const DeleteConfirmation = ({showModal, hideModal, confirmModal, id, type, message}) => {
    return (
        <Modal show={showModal}
               onHide={hideModal}
               className={"col-4 col-sm-5 "}
               style={{padding: 40}}>
            <Modal.Header closeButton>
                <Modal.Title>Conferma Eliminazione</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="alert alert-danger">{message}</div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="default"
                        onClick={hideModal}>
                    Annulla
                </Button>
                <Button variant="danger"
                        onClick={() => confirmModal(type, id)}>
                    Elimina
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteConfirmation;