import {SyncLoader} from "react-spinners";

/*
 Componente che si occupa di mostrare uno spinner grafico durante l'elaborazione
 Indica all'utente che l'applicazione sta attendendo il completamento di un'operazione
 */
export default function Spinner() {
    return (
        <div className="modal-fullscreen"
             style={{minHeight: 600}}>
            <SyncLoader color="#eb6164"
                        loading={true}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 1
                        }}/>
        </div>
    );
}







