import {Badge, ListGroup} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {ReactComponent as ShowMeals} from "../../img/showMealsImg.svg";
import React from "react";

/*
 Componente che visualizza i dettagli di un singolo progresso (es. lettura peso giornaliero) in un ListGroup
 */
const DiaryPreview = ({diary}) => {
    const data = diary.timestamp.toDate().toLocaleDateString("it-IT");
    return (
        <ListGroup.Item className={"col-12"}
                        style={{padding: 0}}>
            <Container className={"d-flex flex-column mx-auto my-auto "}>
                <Container className={"d-flex flex-wrap text-start"}
                           style={{padding: 0}}>
                    <Container className={"d-flex flex-row justify-content-evenly my-auto gap-1"}
                               style={{padding: 0, marginTop: 20}}>
                        <Container style={{margin: 0}}
                                   className={"col-6 col-sm-2 mx-auto my-auto text-center"}>
                            <ShowMeals
                                style={{maxHeight: 50, margin: 10}}
                            />
                        </Container>
                        <Container className={"d-flex flex-wrap align-items-center col-7 col-sm-9"}
                                   style={{padding: 0}}>
                            <Container style={{padding: 0}}
                                       className={"col-12 col-sm-3 mb-2 mb-sm-0 mt-2 mt-lg-0"}>
                                <div className={"float-start"}
                                     style={{margin: 0}}>Data: <strong>{data}</strong></div>
                            </Container>
                            <Container style={{padding: 0, margin: 0}}
                                       className={"col-12 col-sm-3 my-auto"}>
                                <div style={{margin: 0}}>Sgarrato: <strong>
                                    {diary.sgarrato
                                        ?
                                        (<div className={"d-inline-block"}><Badge pill
                                                                                  bg="danger"
                                                                                  style={{marginLeft: 5}}
                                                                                  ><p style={{margin: 1}}>Si</p></Badge>
                                        </div>)
                                        :
                                        (<div className={"d-inline-block"}><Badge pill
                                                                                  bg="success"
                                                                                  style={{marginLeft: 5}}
                                                                                  ><p style={{margin: 1}}>No</p></Badge>
                                        </div>)
                                    }</strong></div>
                            </Container>
                            <Container style={{padding: 0}}
                                       className={"col-12 col-sm-3 mb-2 mb-sm-3 mb-lg-0"}>
                                <div style={{margin: 0}}>Pasto: <strong>{diary.categoria_pasto}</strong></div>
                            </Container>
                            <Container style={{padding: 0}}
                                       className={"col-12 col-md-10"}>
                                <div style={{margin: 0}}>Descrizione: <strong>{diary.descrizione}</strong></div>
                            </Container>
                        </Container>
                    </Container>
                </Container>
            </Container>
        </ListGroup.Item>
    );
};

export default DiaryPreview;