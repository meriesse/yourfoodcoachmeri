"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {WebhookClient, Payload, Image, Card, Suggestion} = require("dialogflow-fulfillment");
const moment = require("moment");
const ChartJsImage = require("chartjs-to-image");

process.env.DEBUG = "dialogflow:*"; // enables lib debugging statements

/*
 Inizializzazione libreria Firebase
 Utilizzo di Firestore Database per la lettura/scrittura dei dati
 */
admin.initializeApp();
//preferRest: true => Permette di utilizzare chiamate REST al posto del protocollo gRPC
//Questo cambiamento permette di limitare al minimo i tempi di avvio a freddo (Cold Starts) di Firebase
const settings = {timestampsInSnapshots: true, preferRest: true};
const db = admin.firestore();
db.settings(settings);

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({request, response});

    function getNewPossibleRequestMessage() {
        //Set di possibili risposte successive ai risultati di un intent
        //Hanno lo scopo d'invogliare il paziente a effettuare nuove richieste
        const newPossibleRequestMessage = [
            "Nel caso avessi bisogno di altro non esitare a chiedere! 😊",
            "Posso fare altro per te? 😊",
            "Posso fare altro per te oggi? 😊",
            "Posso esserti d'aiuto con altro? 😊",
            "Posso fare altro? 😊",
            "Posso aiutarti con altro? 😊",
            "Rimango qui a tua disposizione 😃",
            "Felice di esserti stato d'aiuto 😃, se hai bisogno di altro ricordati che mi troverai sempre qui! 😊",
            "Felice di esserti stato utile 😃 Posso fare altro?",
            "C'è altro che vorresti chiedermi? 😊",
            "Sentiti libero di chiedermi anche altro 😊",
            "In cos'altro posso esserti utile? 😊",
            "Non esitare a chiedermi altro! 😃"
        ];
        //Seleziono randomicamente una risposta nell'array
        return newPossibleRequestMessage[Math.floor(Math.random() * newPossibleRequestMessage.length)];
    }

    /*
     Stampa il messaggio di benvenuto
     */
    function benvenuto(agent) {
        const welcomeImage = "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/WelcomeBotImage.png?alt=media&token=40dd0200-bd3d-49af-a0f0-8d0ec7b89f6c";
        agent.add(new Card({
                title: "Ti do il benvenuto! 👋",
                text: "Ciao! Mi chiamo YourFoodCoachBot, sono un assistente virtuale creato per assisterti durante tutto il tuo percorso nutrizionale.",
                imageUrl: welcomeImage
            })
        );
        const payload = {
            "text": "Qui sotto trovi alcune delle funzioni principali che posso eseguire per te, altrimenti prova a farmi una domanda.",
            "reply_markup": {
                "keyboard": [
                    ["🍽️ Consulta dieta", "⚖️ Aggiorna peso"],
                    ["📘 Diario alimentare", "📊 Miei Progressi"],
                    ["🚰 Consumo Acqua", "🆘 Assistenza"]
                ],
                "resize_keyboard": true,
                "persistent": true
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
    }

    /*
     Stampa un saluto e, sfruttando il contesto, determina se l'utente vuole iniziare o terminare la conversazione
     Se autenticato, usa il nome del paziente ricavato dalla sua dieta
     */
    function saluto(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "SALUTO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        //Controllo attraverso il contesto se la conversazione è appena iniziata o no
        //L'utente vuole terminare la conversazione
        if (agent.context.get("conversation_context")) {
            const endConversationMessage = [
                "Bene 😊 Grazie per esserti connesso con me oggi 👋",
                "Va bene 😊 Ricordati che per qualsiasi richiesta mi trovi qui! 👋"
            ];
            agent.add(endConversationMessage[Math.floor(Math.random() * endConversationMessage.length)]);
            //Termino la conversazione
            if (agent.context.get("conversation_context")) {
                agent.context.delete("conversation_context");
            }
        }
        //L'utente vuole iniziare la conversazione
        else {
            let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
            return dietRef.get().then(function (querySnapshot) {
                //L'utente non è autenticato
                if (querySnapshot.empty) {
                    const payload = {
                        "text": "Ciao! 😊, è sempre un piacere rivederti.\nIn cosa posso aiutarti questa volta?"
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                }
                //L'utente è autenticato
                else {
                    querySnapshot.forEach(function (doc) {
                        const payload = {
                            "text": "Ciao " + doc.data().nome_paziente + "! 😊, è sempre un piacere rivederti.\nIn cosa posso aiutarti questa volta?"
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    });
                }
            }).then(() => {
                return Promise.resolve("Read complete");
            }).catch(err => {
                console.log(err);
                agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
            });
        }
    }

    /*
     Stampa un saluto mattutino e, sfruttando il contesto, determina se l'utente vuole iniziare o terminare la conversazione
     Se autenticato, usa il nome del paziente ricavato dalla sua dieta
     */
    function salutoMattina(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "SALUTO MATTINA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        //Controllo attraverso il contesto se la conversazione è appena iniziata o no
        //L'utente vuole terminare la conversazione
        if (agent.context.get("conversation_context")) {
            const endConversationMessage = [
                "Ti auguro una buona giornata! 😊 Grazie per esserti connesso con noi oggi 👋",
                "Ti auguro una buona giornata! 👋 Ricordati che per qualsiasi richiesta mi trovi qui 😊",
                "Buona giornata anche a te 😊 Ricordati che per qualsiasi richiesta mi trovi qui! 👋",
                "Buona giornata a te 😊 Grazie per esserti connesso con noi oggi 👋"
            ];
            agent.add(endConversationMessage[Math.floor(Math.random() * endConversationMessage.length)]);
            //Termino la conversazione
            if (agent.context.get("conversation_context")) {
                agent.context.delete("conversation_context");
            }
        }
        //L'utente vuole iniziare la conversazione
        else {
            let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
            return dietRef.get().then(function (querySnapshot) {
                //L'utente non è autenticato
                if (querySnapshot.empty) {
                    const payload = {
                        "text": "Buongiorno! ☀️, è sempre un piacere rivederti.\nIn cosa posso aiutarti oggi? 😊"
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                }
                //L'utente è autenticato
                else {
                    querySnapshot.forEach(function (doc) {
                        const payload = {
                            "text": "Buongiorno " + doc.data().nome_paziente + "! ☀️, è sempre un piacere rivederti.\nIn cosa posso aiutarti oggi?"
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    });
                }
            }).then(() => {
                return Promise.resolve("Read complete");
            }).catch(err => {
                console.log(err);
                agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
            });
        }
    }

    /*
     Stampa un saluto pomeridiano e, sfruttando il contesto, determina se l'utente vuole iniziare o terminare la conversazione
     Se autenticato, usa il nome del paziente ricavato dalla sua dieta
     */
    function salutoPomeriggio(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "SALUTO POMERIGGIO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        //Controllo attraverso il contesto se la conversazione è appena iniziata o no
        //L'utente vuole terminare la conversazione
        if (agent.context.get("conversation_context")) {
            const endConversationMessage = [
                "Ti auguro un buon pomeriggio! 😊 Grazie per esserti connesso con noi oggi 👋",
                "Ti auguro un buon pomeriggio! 👋 Ricordati che per qualsiasi richiesta mi trovi qui 😊",
                "Buon pomeriggio anche a te 😊 Ricordati che per qualsiasi richiesta mi trovi qui! 👋",
                "Buon pomeriggio a te 😊 Grazie per esserti connesso con noi oggi 👋"
            ];
            agent.add(endConversationMessage[Math.floor(Math.random() * endConversationMessage.length)]);
            //Termino la conversazione
            if (agent.context.get("conversation_context")) {
                agent.context.delete("conversation_context");
            }
        }
        //L'utente vuole iniziare la conversazione
        else {
            let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
            return dietRef.get().then(function (querySnapshot) {
                //L'utente non è autenticato
                if (querySnapshot.empty) {
                    const payload = {
                        "text": "Buon pomeriggio! 😃️, è sempre un piacere rivederti.\nIn cosa posso aiutarti oggi?"
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                }
                //L'utente è autenticato
                else {
                    querySnapshot.forEach(function (doc) {
                        const payload = {
                            "text": "Buon pomeriggio " + doc.data().nome_paziente + "! 😃, è sempre un piacere rivederti.\nIn cosa posso aiutarti oggi?"
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    });
                }
            }).then(() => {
                return Promise.resolve("Read complete");
            }).catch(err => {
                console.log(err);
                agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
            });
        }
    }

    /*
     Stampa un saluto serale e, sfruttando il contesto, determina se l'utente vuole iniziare o terminare la conversazione
     Se autenticato, usa il nome del paziente ricavato dalla sua dieta
     */
    function salutoSera(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "SALUTO SERA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        //Controllo attraverso il contesto se la conversazione è appena iniziata o no
        //L'utente vuole terminare la conversazione
        if (agent.context.get("conversation_context")) {
            const endConversationMessage = [
                "Ti auguro una buona serata! 😊 Grazie per esserti connesso con noi oggi 👋",
                "Ti auguro una buona serata! 👋 Ricordati che per qualsiasi richiesta mi trovi qui 😊",
                "Buona serata anche a te 😊 Ricordati che per qualsiasi richiesta mi trovi qui! 👋",
                "Buona serata a te 😊 Grazie per esserti connesso con noi oggi 👋"
            ];
            agent.add(endConversationMessage[Math.floor(Math.random() * endConversationMessage.length)]);
            //Termino la conversazione
            if (agent.context.get("conversation_context")) {
                agent.context.delete("conversation_context");
            }
        }
        //L'utente vuole iniziare la conversazione
        else {
            let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
            return dietRef.get().then(function (querySnapshot) {
                //L'utente non è autenticato
                if (querySnapshot.empty) {
                    const payload = {
                        "text": "Buonasera! 🌙, è sempre un piacere rivederti.\nIn cosa posso esserti utile? 😊"
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                }
                //L'utente è autenticato
                else {
                    querySnapshot.forEach(function (doc) {
                        const payload = {
                            "text": "Buonasera " + doc.data().nome_paziente + "! 🌙, è sempre un piacere rivederti.\nIn cosa posso esserti utile? 😊"
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    });
                }
            }).then(() => {
                return Promise.resolve("Read complete");
            }).catch(err => {
                console.log(err);
                agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
            });
        }
    }

    /*
     Stampa un messaggio informativo riguardo ai possibili consigli che il chatbot può gestire
     */
    function consiglio(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "CONSIGLIO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Sei nel posto giusto! 😊\nPosso consigliare buone pratiche o degli alimenti per:",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🛌 Rilassarti",
                                "callback_data": "Rilassarti"
                            },
                            {
                                "text": "😴 Sonnolenza",
                                "callback_data": "sonnolenza"
                            }
                        ],
                        [
                            {
                                "text": "🚫 Intolleranze",
                                "callback_data": "Intolleranze"
                            },
                            {
                                "text": "🎈Pancia gonfia",
                                "callback_data": "Gonfiore addominale"
                            }
                        ],
                        [
                            {
                                "text": "🧲 Carenze di ferro",
                                "callback_data": "Carenze di ferro"
                            },
                            {
                                "text": "🆙 Colesterolo alto",
                                "callback_data": "Colesterolo alto"
                            }
                        ],
                        [
                            {
                                "text": "😮‍💨 Stanchezza",
                                "callback_data": "Mi sento stanco"
                            },
                            {
                                "text": "💦 Disidratazione",
                                "callback_data": "bevo poca acqua"
                            }
                        ],
                        [
                            {
                                "text": "💨 Gas intestinali",
                                "callback_data": "Gas intestinali"
                            },
                            {
                                "text": "👦 Acne",
                                "callback_data": "Acne"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Altrimenti prova a farmi una domanda 😊");

    }

    /*
     Stampa un messaggio informativo riguardo alle possibili intolleranze che il chatbot può gestire
     */
    function intolleranze(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "INTOLLERANZE" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Posso offrirti aiuto per le seguenti intolleranze:",
            "reply_markup": {
                "inline_keyboard": [
                    [{"text": "🥛 Intolleranza al lattosio", "callback_data": "Intolleranti al lattosio"}],
                    [{"text": "🌾 Intolleranza al glutine", "callback_data": "Intolleranti al glutine"}],
                    [{"text": "🆘 Segnala Problema", "callback_data": "Voglio segnalare un problema o un suggerimento"}]
                ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Altrimenti prova a farmi una domanda 😊");
    }

    /*
     Stampa un messaggio informativo riguardo alle possibili sostituzioni che il chatbot può gestire
     */
    function sostituzioni(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "SOSTITUZIONI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Effettuare una sostituzione è semplicissimo, basta chiedermi ad esempio:\n\"Con cosa posso sostituire il pollo?\".\n" +
                "Di seguito troverai alcune delle categorie alimentari più comuni, per le quali posso suggerirti delle alternative 🙂",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🥒 Verdure",
                                "callback_data": "sostituzione verdure"
                            },
                            {
                                "text": "🥩 Carni",
                                "callback_data": "sostituzione carne"
                            }
                        ],
                        [
                            {
                                "text": "🐟 Pesci",
                                "callback_data": "sostituzione pesce"
                            },
                            {
                                "text": "🌾 Cereali",
                                "callback_data": "sostituzione cereali"
                            }
                        ],
                        [
                            {
                                "text": "🍖 Salumi",
                                "callback_data": "sostituzione salumi"
                            },
                            {
                                "text": "🫘 Legumi",
                                "callback_data": "sostituzione legumi"
                            }
                        ],
                        [
                            {
                                "text": "🍎 Frutta",
                                "callback_data": "sostituzione frutta"
                            },
                            {
                                "text": "🥛 Latticini",
                                "callback_data": "sostituzione latticini"
                            }
                        ],
                        [
                            {
                                "text": "🔍 Altro",
                                "callback_data": "voglio sostituire altro e non conosco la categoria"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Se non trovi quello che cerchi prova a chiedermelo e ti sorprenderò! 😉");
    }

    /*
     Stampa un messaggio informativo riguardo alle possibili sostituzioni che il chatbot può gestire nella categoria "verdure"
     */
    function sostituzioniVerdure(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "VERDURE" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Posso sostituire le seguenti Verdure: 😊",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🥒 Zucchine",
                                "callback_data": "ho finito le zucchine"
                            },
                            {
                                "text": "🥬 Barbabietole",
                                "callback_data": "ho finito le barbabietole"
                            }
                        ],
                        [
                            {
                                "text": "🍃 Spinaci",
                                "callback_data": "ho finito gli spinaci"
                            },
                            {
                                "text": "🍆 Melanzane",
                                "callback_data": "ho finito le melanzane"
                            }
                        ],
                        [
                            {
                                "text": "🍅 Pomodori",
                                "callback_data": "ho finito i pomodori"
                            },
                            {
                                "text": "🥬 Bieta",
                                "callback_data": "ho finito la bieta"
                            }
                        ],
                        [
                            {
                                "text": "🥦 Asparagi",
                                "callback_data": "ho finito gli asparagi"
                            },
                            {
                                "text": "🥗 Lattuga",
                                "callback_data": "ho finito la lattuga"
                            }
                        ],
                        [
                            {
                                "text": "🥬 Finocchi",
                                "callback_data": "ho finito i finocchi"
                            },
                            {
                                "text": "🫘 Ceci",
                                "callback_data": "ho finito i ceci"
                            }
                        ],
                        [
                            {
                                "text": "🔄 Richiedi nuova sostituzione",
                                "callback_data": "voglio richiedere una sostituzione per un nuovo pasto"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Vuoi effettuare una sostituzione ora? 😊");
    }

    /*
     Stampa un messaggio informativo riguardo alle possibili sostituzioni che il chatbot può gestire nella categoria "carni"
     */
    function sostituzioniCarni(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "CARNI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Posso sostituire le seguenti Carni: 😊",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🐔 Pollo",
                                "callback_data": "ho finito il pollo"
                            },
                            {
                                "text": "🦃 Tacchino",
                                "callback_data": "ho finito il tacchino"
                            }
                        ],
                        [
                            {
                                "text": "🥩 Vitello",
                                "callback_data": "ho finito il vitello"
                            }
                        ],
                        [
                            {
                                "text": "🔄 Richiedi nuova sostituzione",
                                "callback_data": "voglio richiedere una sostituzione per un nuovo pasto"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Vuoi effettuare una sostituzione ora? 😊");
    }

    /*
     Stampa un messaggio informativo riguardo alle possibili sostituzioni che il chatbot può gestire nella categoria "pesci"
     */
    function sostituzioniPesci(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "PESCI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Posso sostituire i seguenti Pesci: 😊",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🐠 Tonno in scatola",
                                "callback_data": "ho finito il tonno in scatola"
                            },
                            {
                                "text": "🐟 Merluzzo",
                                "callback_data": "ho finito il merluzzo"
                            }
                        ],
                        [
                            {
                                "text": "🦐 Gamberi",
                                "callback_data": "ho finito i gamberi"
                            },
                            {
                                "text": "🎣 Sogliola",
                                "callback_data": "ho finito la sogliola"
                            }
                        ],
                        [
                            {
                                "text": "🍣 Salmone",
                                "callback_data": "ho finito il salmone"
                            },
                            {
                                "text": "🐠 Orata",
                                "callback_data": "ho finito l'orata"
                            }
                        ],
                        [
                            {
                                "text": "🎣 Cernia",
                                "callback_data": "ho finito la cernia"
                            },
                            {
                                "text": "🐟 Spigola",
                                "callback_data": "ho finito la spigola"
                            }
                        ],
                        [
                            {
                                "text": "🔄 Richiedi nuova sostituzione",
                                "callback_data": "voglio richiedere una sostituzione per un nuovo pasto"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Vuoi effettuare una sostituzione ora? 😊");
    }

    /*
     Stampa un messaggio informativo riguardo alle possibili sostituzioni che il chatbot può gestire nella categoria "cereali"
     */
    function sostituzioniCereali(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "CEREALI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Posso sostituire i seguenti Cereali: 😊",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🌾 Orzo",
                                "callback_data": "ho finito l'orzo"
                            },
                            {
                                "text": "🥣 Muesli",
                                "callback_data": "ho finito il muesli"
                            }
                        ],
                        [
                            {
                                "text": "🍝 Pasta",
                                "callback_data": "ho finito la pasta"
                            },
                            {
                                "text": "🍚 Riso",
                                "callback_data": "ho finito il riso"
                            }
                        ],
                        [
                            {
                                "text": "🍞 Pane",
                                "callback_data": "ho finito il pane"
                            },
                            {
                                "text": "🍚 Gallette riso",
                                "callback_data": "ho finito le gallette di riso"
                            }
                        ],
                        [
                            {
                                "text": "🥪 Fette biscottate integrali",
                                "callback_data": "ho finito le fette biscottate integrali"
                            }
                        ],
                        [
                            {
                                "text": "🔄 Richiedi nuova sostituzione",
                                "callback_data": "voglio richiedere una sostituzione per un nuovo pasto"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Vuoi effettuare una sostituzione ora? 😊");
    }

    /*
     Stampa un messaggio informativo riguardo alle possibili sostituzioni che il chatbot può gestire nella categoria "salumi"
     */
    function sostituzioniSalumi(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "SALUMI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Posso sostituire i seguenti Salumi: 😊",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🍖 Bresaola",
                                "callback_data": "ho finito la bresaola"
                            },
                            {
                                "text": "🐖 Prosciutto crudo",
                                "callback_data": "ho finito il prosciutto crudo"
                            }
                        ],
                        [
                            {
                                "text": "🦃 Fesa di tacchino",
                                "callback_data": "ho finito la fesa di tacchino"
                            }
                        ],
                        [
                            {
                                "text": "🔄 Richiedi nuova sostituzione",
                                "callback_data": "voglio richiedere una sostituzione per un nuovo pasto"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Vuoi effettuare una sostituzione ora? 😊");
    }

    /*
     Stampa un messaggio informativo riguardo alle possibili sostituzioni che il chatbot può gestire nella categoria "legumi"
     */
    function sostituzioniLegumi(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "LEGUMI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Posso sostituire i seguenti Legumi: 😊",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🧆 Lenticchie",
                                "callback_data": "ho finito le lenticchie"
                            },
                            {
                                "text": "🫘 Ceci",
                                "callback_data": "ho finito i ceci"
                            }
                        ],
                        [
                            {
                                "text": "🌾 Fave",
                                "callback_data": "ho finito le fave"
                            },
                            {
                                "text": "🫘 Fagiolini",
                                "callback_data": "ho finito i fagiolini"
                            }
                        ],
                        [
                            {
                                "text": "🔄 Richiedi nuova sostituzione",
                                "callback_data": "voglio richiedere una sostituzione per un nuovo pasto"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Vuoi effettuare una sostituzione ora? 😊");
    }

    /*
     Stampa un messaggio informativo riguardo alle possibili sostituzioni che il chatbot può gestire nella categoria "latticini"
     */
    function sostituzioniLatticini(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "LATTICINI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Posso sostituire i seguenti Latticini: 😊",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🥛 Latte",
                                "callback_data": "ho finito il latte"
                            },
                            {
                                "text": "🥄 Yogurt",
                                "callback_data": "ho finito lo yogurt"
                            }
                        ],
                        [
                            {
                                "text": "🐄 Mozzarella",
                                "callback_data": "ho finito la mozzarella"
                            },
                            {
                                "text": "🧀 Parmigiano",
                                "callback_data": "ho finito il parmigiano"
                            }
                        ],
                        [
                            {
                                "text": "🧈 Formaggio cremoso",
                                "callback_data": "ho finito il formaggio cremoso"
                            }
                        ],
                        [
                            {
                                "text": "🔄 Richiedi nuova sostituzione",
                                "callback_data": "voglio richiedere una sostituzione per un nuovo pasto"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Vuoi effettuare una sostituzione ora? 😊");
    }

    /*
     Stampa un messaggio informativo riguardo alle possibili sostituzioni che il chatbot può gestire nella categoria "frutti"
     */
    function sostituzioniFrutti(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "FRUTTI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Posso sostituire i seguenti Frutti: 😊",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🍎 Mela",
                                "callback_data": "ho finito le mele"
                            },
                            {
                                "text": "🥝 Kiwi",
                                "callback_data": "ho finito i kiwi"
                            }
                        ],
                        [
                            {
                                "text": "🍑 Albicocche",
                                "callback_data": "ho finito le albicocche"
                            },
                            {
                                "text": "🧃 Spremuta",
                                "callback_data": "ho finito la spremuta"
                            }
                        ],
                        [
                            {
                                "text": "🥜 Mandorle",
                                "callback_data": "ho finito le mandorle"
                            },
                            {
                                "text": "🫙 Marmellata di frutta",
                                "callback_data": "ho finito la marmellata"
                            }
                        ],
                        [
                            {
                                "text": "🌰 Noci",
                                "callback_data": "ho finito le noci"
                            }
                        ],
                        [
                            {
                                "text": "🔄 Richiedi nuova sostituzione",
                                "callback_data": "voglio richiedere una sostituzione per un nuovo pasto"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Vuoi effettuare una sostituzione ora? 😊");
    }

    /*
     Stampa un messaggio informativo riguardo alle possibili sostituzioni che il chatbot può gestire nella categoria "altro"
     */
    function sostituzioniAltro(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "ALTRO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const payload = {
            "text": "Non è sempre facile trovare una categoria per ogni alimento 🤭\nEcco altre sostituzioni che posso effettuare: 😊",
            "reply_markup": {
                "inline_keyboard":
                    [
                        [
                            {
                                "text": "🧋 Caffè",
                                "callback_data": "ho finito il caffè"
                            },
                            {
                                "text": "🍪 Biscotti",
                                "callback_data": "ho finito i biscotti"
                            }
                        ],
                        [
                            {
                                "text": "🫖 Tisana",
                                "callback_data": "ho finito la tisana"
                            },
                            {
                                "text": "🍫 Cioccolato",
                                "callback_data": "ho finito il cioccolato fondente"
                            }
                        ],
                        [
                            {
                                "text": "🥨 Crackers",
                                "callback_data": "ho finito i crackers"
                            },
                            {
                                "text": "🍳 Uova",
                                "callback_data": "ho finito le uova"
                            }
                        ],
                        [
                            {
                                "text": "🫒 Olio extra vergine",
                                "callback_data": "ho finito l'olio extra vergine"
                            }
                        ],
                        [
                            {
                                "text": "🔄 Richiedi nuova sostituzione",
                                "callback_data": "voglio richiedere una sostituzione per un nuovo pasto"
                            }
                        ]
                    ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
        agent.add("Vuoi effettuare una sostituzione ora? 😊");
    }

    /*
     Stampa un messaggio di soddisfazione insieme ad una sua rappresentazione grafica
     */
    function umoreAlto(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "UMORE ALTO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        //Set di possibili risposte visive
        const highMoodMessage = [
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_1.png?alt=media&token=ddc2c90b-e712-41ce-b652-4e036d2e1c28",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_2.png?alt=media&token=d9859c9c-6eae-4998-a8ca-93392ab1aaca",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_3.png?alt=media&token=54d39272-3672-40a2-a93b-112df9003c96",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_4.png?alt=media&token=a53a3661-73f5-478d-9140-8c64e784dd9e",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_5.png?alt=media&token=12cc4dc3-870d-4a69-b4aa-253b2c9a5b86",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_6.png?alt=media&token=1422c1c4-4a37-40e1-928c-d228a948c186",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_7.png?alt=media&token=a420b8b1-de0f-4d2b-86e8-75528491bb19"
        ];

        agent.add(new Card({
                title: "Sentiti sempre al 🔝",
                text: "Non c'è nulla di meglio che iniziare una nuova giornata con la giusta grinta.\nVedrai che con il giusto atteggiamento anche il più grande dei problemi si trasformerà subito in un piccolo ostacolo!",
                imageUrl: highMoodMessage[Math.floor(Math.random() * highMoodMessage.length)]
            })
        );
    }

    /*
     Stampa cosa prevede la dieta in un determinato giorno (inclusi: ieri, oggi e domani) e/o per un determinato pasto
     */
    function getGiornoDieta(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "VISUALIZZA GIORNO DIETA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let categoriaPasto = agent.parameters.categoriaPasto;
        let giorno = agent.parameters.giorno;
        let giornoPrecedente;
        let giornoSuccessivo;
        let giorni = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
        const d = new Date();
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "DIETA_VISUALIZZA_GIORNO",
                        "giorno": giorno,
                        "categoriaPasto": categoriaPasto
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    if (giorno === "oggi") {
                        giorno = giorni[d.getDay()];
                        //Ottengo il giorno precedente
                        giornoPrecedente = giorni[(d.getDay() + 6) % 7];
                        //Ottengo il giorno successivo
                        giornoSuccessivo = giorni[(d.getDay() + 1) % 7];
                    } else if (giorno === "domani") {
                        giorno = giorni[(d.getDay() + 1) % 7];
                        //Ottengo il giorno precedente
                        giornoPrecedente = giorni[(d.getDay() + 7) % 7];
                        //Ottengo il giorno successivo
                        giornoSuccessivo = giorni[(d.getDay() + 2) % 7];
                    } else if (giorno === "ieri") {
                        giorno = giorni[(d.getDay() + 6) % 7];
                        //Ottengo il giorno precedente
                        giornoPrecedente = giorni[(d.getDay() + 12) % 7];
                        //Ottengo il giorno successivo
                        giornoSuccessivo = giorni[(d.getDay() + 7) % 7];
                    } else {
                        switch (giorno) {
                            case "lunedi":
                                //Ottengo il giorno precedente
                                giornoPrecedente = giorni[0];
                                //Ottengo il giorno successivo
                                giornoSuccessivo = giorni[2];
                                break;
                            case "martedi":
                                //Ottengo il giorno precedente
                                giornoPrecedente = giorni[1];
                                //Ottengo il giorno successivo
                                giornoSuccessivo = giorni[3];
                                break;
                            case "mercoledi":
                                //Ottengo il giorno precedente
                                giornoPrecedente = giorni[2];
                                //Ottengo il giorno successivo
                                giornoSuccessivo = giorni[4];
                                break;
                            case "giovedi":
                                //Ottengo il giorno precedente
                                giornoPrecedente = giorni[3];
                                //Ottengo il giorno successivo
                                giornoSuccessivo = giorni[5];
                                break;
                            case "venerdi":
                                //Ottengo il giorno precedente
                                giornoPrecedente = giorni[4];
                                //Ottengo il giorno successivo
                                giornoSuccessivo = giorni[6];
                                break;
                            case "sabato":
                                //Ottengo il giorno precedente
                                giornoPrecedente = giorni[5];
                                //Ottengo il giorno successivo
                                giornoSuccessivo = giorni[0];
                                break;
                            case "domenica":
                                //Ottengo il giorno precedente
                                giornoPrecedente = giorni[6];
                                //Ottengo il giorno successivo
                                giornoSuccessivo = giorni[1];
                                break;
                        }
                    }

                    if (categoriaPasto) {
                        let emoji_1 = "";
                        let emoji_2 = "";
                        switch (categoriaPasto) {
                            case "colazione":
                                emoji_1 = "🥐";
                                break;
                            case "pranzo":
                                emoji_1 = "🍝";
                                break;
                            case "spuntino":
                                emoji_1 = "🍎";
                                emoji_2 = "🧃";
                                break;
                            case "cena":
                                emoji_1 = "🍖";
                                break;
                        }
                        if (categoriaPasto === "spuntino") {
                            const pasto_1 = doc.data()[categoriaPasto + "_" + giorno + "_mattina"].label;
                            const pasto_2 = doc.data()[categoriaPasto + "_" + giorno + "_pomeriggio"].label;
                            const payload = {
                                "text": "Per " + giorno.toUpperCase() + " la tua dieta prevede come SPUNTINI :" +
                                    "\n\n" + emoji_1 + " SPUNTINO MATTUTINO: " + pasto_1 + "\n\n" + emoji_2 + " SPUNTINO POMERIDIANO: " + " " + pasto_2
                            };
                            agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                        } else {
                            const pasto = doc.data()[categoriaPasto + "_" + giorno].label;
                            const payload = {
                                "text": "Per " + giorno.toUpperCase() + " la tua dieta prevede come " + categoriaPasto.toUpperCase() + " :" +
                                    "\n\n" + emoji_1 + " " + pasto
                            };
                            agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                        }
                    } else {
                        const colazione = doc.data()["colazione_" + giorno].label;
                        const spuntinoMattutino = doc.data()["spuntino_" + giorno + "_mattina"].label;
                        const pranzo = doc.data()["pranzo_" + giorno].label;
                        const spuntinoPomeridiano = doc.data()["spuntino_" + giorno + "_pomeriggio"].label;
                        const cena = doc.data()["cena_" + giorno].label;
                        const payload = {
                            "text": "Per " + giorno.toUpperCase() + " la tua dieta prevede:" +
                                "\n\n🥐 COLAZIONE:  " + colazione + "\n\n🍎 SPUNTINO MATTUTINO:  " + spuntinoMattutino + "\n\n🍝 PRANZO:  " + pranzo + "\n\n🧃 SPUNTINO POMERIDIANO:  " + spuntinoPomeridiano + "\n\n🍖 CENA:  " + cena,
                            "reply_markup": {
                                "inline_keyboard": [
                                    [{
                                        "text": "Giorno Successivo ⏩",
                                        "callback_data": "Cosa mangio " + giornoSuccessivo
                                    }],
                                    [{
                                        "text": "⏪ Giorno Precedente",
                                        "callback_data": "Cosa mangio " + giornoPrecedente
                                    }],
                                    [{
                                        "text": "⏲️ Preparazione Pasto",
                                        "callback_data": "voglio la preparazione per " + giorno + "?"
                                    }],
                                    [{
                                        "text": "🍎 Sostituisci cibo",
                                        "callback_data": "mostrami l'elenco delle possibili sostituzioni"
                                    }]
                                ]
                            }
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    }
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Stampa cosa prevede la dieta in un determinato giorno (inclusi: ieri, oggi e domani) e/o per un determinato pasto
     */
    function getDietaCompleta(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "VISUALIZZA DIETA COMPLETA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let giorni = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
        const d = new Date();
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "DIETA_VISUALIZZA_COMPLETA"
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    //Ottengo il giorno odierno
                    let giorno = giorni[d.getDay()];
                    //Ottengo il giorno precedente
                    let giornoPrecedente = giorni[(d.getDay() + 6) % 7];
                    //Ottengo il giorno successivo
                    let giornoSuccessivo = giorni[(d.getDay() + 1) % 7];

                    const colazione = doc.data()["colazione_" + giorno].label;
                    const spuntinoMattutino = doc.data()["spuntino_" + giorno + "_mattina"].label;
                    const pranzo = doc.data()["pranzo_" + giorno].label;
                    const spuntinoPomeridiano = doc.data()["spuntino_" + giorno + "_pomeriggio"].label;
                    const cena = doc.data()["cena_" + giorno].label;

                    const payload = {
                        "text": "Per " + giorno.toUpperCase() + " la tua dieta prevede:" +
                            "\n\n🥐 COLAZIONE:  " + colazione + "\n\n🍎 SPUNTINO MATTUTINO:  " + spuntinoMattutino + "\n\n🍝 PRANZO:  " + pranzo + "\n\n🧃 SPUNTINO POMERIDIANO:  " + spuntinoPomeridiano + "\n\n🍖 CENA:  " + cena,
                        "reply_markup": {
                            "inline_keyboard": [
                                [{"text": "Giorno Successivo ⏩", "callback_data": "Cosa mangio " + giornoSuccessivo}],
                                [{"text": "⏪ Giorno Precedente", "callback_data": "Cosa mangio " + giornoPrecedente}],
                                [{"text": "⏲️ Preparazione Pasto", "callback_data": "voglio la preparazione per " + giorno + "?"}],
                                [{"text": "🍎 Sostituisci cibo", "callback_data": "mostrami l'elenco delle possibili sostituzioni"}]
                            ]
                        }
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));

                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }


    /*
     Determina l'id del pasto per la successiva stampa della preparazione
     Il pasto è determinato dal giorno di riferimento e dalla sua categoria (Colazione, Pranzo, Spuntino o Cena)
     */
    function getIdPasto(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "PREPARAZIONE PASTO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let categoriaPasto = agent.parameters.categoriaPasto;
        let giorno = agent.parameters.giorno;
        let giorni = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
        const d = new Date();
        if (giorno === "oggi") {
            giorno = giorni[d.getDay()];
        } else if (giorno === "domani") {
            giorno = giorni[(d.getDay() + 1) % 7];
        } else if (giorno === "ieri") {
            giorno = giorni[(d.getDay() + 6) % 7];
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "PREPARAZIONE_PASTO",
                        "giorno": giorno,
                        "categoriaPasto": categoriaPasto
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    const pastoId = doc.data()[categoriaPasto + "_" + giorno].value;
                    console.log(pastoId);
                    agent.context.set({
                        "name": "pasto_context",
                        "lifespan": 10,
                        "parameters": {
                            "intent": "PREPARAZIONE_PASTO",
                            "pastoId": pastoId,
                            "giorno": giorno,
                            "categoriaPasto": categoriaPasto
                        }
                    });
                    agent.add("Procedo nell'eseguire la richiesta");
                    agent.setFollowupEvent("PREPARAZIONE_PASTO_STAMPA");
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     FollowUp di getIdPasto che Stampa la preparazione di un pasto passato l'id attraverso il contesto
     */
    function getPreparazionePasto(agent) {
        if (agent.context.get("pasto_context")) {
            let categoriaPasto = agent.parameters.categoriaPasto;
            let giorno = agent.parameters.giorno;
            let pastoId = agent.parameters.pastoId;
            let pastoRef = db.collection("pasti").doc(pastoId);
            return pastoRef.get().then((pasto) => {
                let preparazione = pasto.data().preparazione;
                if (preparazione != "") {
                    const payload = {
                        "text": "⏲ Ecco la preparazione del pasto che la tua dieta prevede per " + giorno.toUpperCase() + " a " + categoriaPasto.toUpperCase() + "️:\n\n" + pasto.data().preparazione
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                } else {
                    agent.add("Al momento non è presente una preparazione per il pasto da te indicato, verrà certamente aggiunta in futuro 😊");
                }
                //Frase di apertura ad una possibile nuova richiesta
                agent.add(getNewPossibleRequestMessage());
                agent.context.delete("pasto_context");
            }).then(() => {
                return Promise.resolve("Read complete");
            }).catch(err => {
                console.log(err);
                agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
            });
        }
    }

    /*
     Permette di dare una valutazione dell'indice di massa corporea (IMC) dato in input
     */
    function valutaImc(imc) {
        let imcValutation;
        if (imc < 18.5) {
            imcValutation = "Questo significa che ti trovi nella fascia: SOTTOPESO (minore di 18.5)";
        } else if (imc >= 18.5 && imc <= 24.9) {
            imcValutation = "Questo significa che ti trovi nella fascia: NORMOPESO (da 18.5 a 24.9)";
        } else if (imc >= 25 && imc < 29.9) {
            imcValutation = "Questo significa che ti trovi nella fascia: SOVRAPPESO (da 25.0 a 29.9)";
        } else if (imc >= 30 && imc < 34.9) {
            imcValutation = "Questo significa che ti trovi nella fascia: OBESITÀ di 1° GRADO (da 30.0 a 34.9)";
        } else if (imc >= 35 && imc < 39.9) {
            imcValutation = "Questo significa che ti trovi nella fascia: OBESITÀ di 2° GRADO (da 35.0 a 39.9)";
        } else if (imc >= 40) {
            imcValutation = "Questo significa che ti trovi nella fascia: OBESITÀ di 3° GRADO (da 40.0 a 49.9)";
        }
        return imcValutation;
    }

    /*
     Determina l'immagine da associare all'indice di massa corporea corrispondente
     */
    function getImcImage(imc) {
        let imageUrl;
        if (imc < 18.5) {
            imageUrl = "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/Imc%2FSenza%20Titolo%2018.png?alt=media&token=9718a27c-dd46-4fd6-b841-7d9c14952790";
        } else if (imc >= 18.5 && imc <= 24.9) {
            imageUrl = "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/Imc%2FSenza%20Titolo%2019.png?alt=media&token=78e09187-86f9-4a91-a0f4-662844b1cad4";
        } else if (imc >= 25 && imc < 29.9) {
            imageUrl = "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/Imc%2FSenza%20Titolo%2020.png?alt=media&token=9c686afa-0e07-437b-81c2-25d5bcde1de7";
        } else if (imc >= 30 && imc < 34.9) {
            imageUrl = "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/Imc%2FSenza%20Titolo%2021.png?alt=media&token=629fa268-03a5-4d40-8920-9316a85c8a49";
        } else if (imc >= 35 && imc < 39.9) {
            imageUrl = "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/Imc%2FSenza%20Titolo%2022.png?alt=media&token=eaf93f4f-98b7-4603-b2d6-8258fdcee28b";
        } else if (imc >= 40) {
            imageUrl = "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/Imc%2FSenza%20Titolo%2023.png?alt=media&token=4f384aa1-3876-417b-b745-3a20c5d366fb";
        }
        return imageUrl;
    }

    /*
     Permette all'utente di salvare il peso giornaliero nel database
     Stampa l'indice di massa corporea (IMC) e valuta la sua fascia d'appartenenza
     */
    function setPeso(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "REGISTRA PESO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let peso = agent.parameters.peso;
        const day = new Date().getDay();
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "REGISTRA_PESO",
                        "peso": peso
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let imc = (peso * 10000 / (Math.pow(doc.data().altezza_paziente, 2))).toPrecision(4);
                    let pesateRef = db.collection("diets").doc(doc.id).collection("pesate");
                    pesateRef.doc().set({
                        peso: peso,
                        imc: imc,
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                    agent.add("Peso registrato correttamente! 😊");
                    //IL paziente ha raggiunto l'obiettivo peso impostato dal nutrizionista
                    if (peso <= doc.data().obiettivo_peso) {
                        if(doc.data().tipologia_dieta === "Utente"){
                            agent.add(new Card({
                                title: "Obiettivo Raggiunto! 🏆 🎉",
                                text: getNewRewardingMessage(true, true),
                                imageUrl: "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/FestaObiettivoRaggiunto_2.png?alt=media&token=0a84ee59-7f20-4bd9-bc9c-b71564d79341"
                            }));
                        }else if(doc.data().tipologia_dieta === "Nutrizionista"){
                            agent.add(new Card({
                                title: "Obiettivo Raggiunto! 🏆 🎉",
                                text: getNewRewardingMessage(true, true),
                                imageUrl: "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/FestaObiettivoRaggiunto_2.png?alt=media&token=0a84ee59-7f20-4bd9-bc9c-b71564d79341"
                            }));
                            const payload = {
                                "text": "Prenota subito un appuntamento dal tuo nutrizionista! 🥳",
                                "reply_markup": {
                                    "inline_keyboard": [
                                        [{"text": "🩺 Contatta Nutrizionista", "callback_data": "contatta nutrizionista"}],
                                        [{"text": "🤩 Sono Carico", "callback_data": "sono carico"}]
                                    ]
                                }
                            };
                            agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                        }
                    } else {
                        const payload = {
                            "text": "Vorresti consultare l'andamento del peso negli ultimi 7 giorni o calcolare il tuo indice di massa corporea? 🗓️\nCiò ti permetterà di avere maggiore consapevolezza dei risultati che hai raggiunto e di ciò che puoi fare per migliorarli ancora 💪 😉",
                            "reply_markup": {
                                "inline_keyboard": [
                                    [{"text": "📊 Consulta Andamento Peso", "callback_data": "andamento peso"}],
                                    [{"text": "💪 Calcola IMC", "callback_data": "il mio peso è di" + peso + ", calcola l'indice di massa corporea"}],
                                    [{"text": "🕑 Non Ora", "callback_data": "non voglio farlo ora"}]
                                ]
                            }
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    }
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add("Sentiti libero di chiedermi anche altro 😊");
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Set di possibili messaggi da inviare quando l'utente ha già effettuato o no l'aggiornamento del peso nei giorni precedenti
     Tiene conto del trend del peso e dell'obiettivo peso indicato dal nutrizionista
     */
    function getNewRewardingMessage(obiettivoRaggiunto, trendPositive) {
        const motivationalMessageTrendPositive = [
            "Stai facendo davvero un ottimo lavoro con la dieta 💪 😊",
            "Stai facendo ottimi progressi, continua così! 💪 😊",
            "Grazie al tuo impegno raggiungerai presto tutti i tuoi obiettivi, continua così!  💪 😊",
            "Stai facendo davvero un ottimo lavoro con la dieta, continua così! 💪 😊",
            "Continua così! Sono certo che presto raggiungerai il tuo obiettivo 💪 😊",
            "Il tuo impegno ti condurrà a grandi risultati, continua così! 💪 😊",
            "Vedo che stai facendo progressi, continua così! 💪 😊",
            "Sono soddisfatto dei tuoi progressi, continua così! 💪 😊",
            "Sono orgoglioso dei progressi che stai facendo, continua così! 💪 😊"
        ];

        const motivationalMessageTrendNegative = [
            "Prova ad impegnarti di più con la dieta, sono sicuro che la prossima volta andrà meglio 💪 😊",
            "Vedo che non stai facendo grandi progressi ultimamente, prova a fare del tuo meglio 💪 😊",
            "noto che non ti stai impegnando al 100% con la dieta, sono sicuro che la prossima volta andrà meglio 💪 😊",
            "Prova ad impegnarti di più, prova a fare del tuo meglio 💪 😊",
            "Se ti impegnerai di più vedrai che raggiungerai grandi risultati 💪 😊",
            "Noto che non stai facendo progressi, prova a fare del tuo meglio 💪 😊",
            "È arrivata l'ora di impegnarsi di più con la dieta, sono sicuro che la prossima volta andrà meglio 💪 😊",
            "Vedo che il tuo peso fatica a scendere, sono sicuro che la prossima volta andrà meglio 💪 😊"
        ];

        const motivationalMessageGoalAchieved = [
            "Devo farti i miei complimenti! hai raggiunto il tuo obiettivo peso 🥳",
            "Dopo tanti sacrifici hai finalmente raggiunto il tuo obiettivo peso 🥳",
            "Sono così fiero di te! Hai finalmente raggiunto il tuo obiettivo peso 🥳",
            "Dobbiamo festeggiare! Dopo tanti sacrifici hai finalmente raggiunto il tuo obiettivo peso 🥳",
            "Obiettivo peso raggiunto! Sono così felice per te 🥳",
            "Sono felice di comunicarti che hai raggiunto il tuo obiettivo peso 🥳"
        ];

        //Obiettivo peso raggiunto
        if (obiettivoRaggiunto) {
            //Seleziono randomicamente una risposta nell'array
            return motivationalMessageGoalAchieved[Math.floor(Math.random() * motivationalMessageGoalAchieved.length)];
        } else {
            //Il paziente sta facendo progressi
            if (trendPositive) {
                //Seleziono randomicamente una risposta nell'array
                return motivationalMessageTrendPositive[Math.floor(Math.random() * motivationalMessageTrendPositive.length)];
            }
            //Il paziente non sta facendo progressi
            else {
                //Seleziono randomicamente una risposta nell'array
                return motivationalMessageTrendNegative[Math.floor(Math.random() * motivationalMessageTrendNegative.length)];
            }
        }
    }

    /*
     Determina l'id della dieta per la successiva stampa dell'andamento del peso
     */
    function getIdDieta(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "ANDAMENTO PESO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "ANDAMENTO_PESO"
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    agent.context.set({
                        "name": "pesate_context",
                        "lifespan": 10,
                        "parameters": {
                            "intent": "ANDAMENTO_PESO",
                            "dietaId": doc.id,
                            "obiettivoPeso": doc.data().obiettivo_peso,
                            "pesoPaziente": doc.data().peso_paziente
                        }
                    });
                    agent.add("Procedo nell'eseguire la richiesta");
                    agent.setFollowupEvent("ANDAMENTO_PESO_STAMPA");
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di ricevere un report sull'andamento del peso
     Considera uno storico massimo di 7 giorni
     */
    function getAndamentoPeso(agent) {
        let dietaId = agent.parameters.dietaId;
        let obiettivoPeso = agent.parameters.obiettivoPeso;
        let pesoPaziente = agent.parameters.pesoPaziente;
        //Calcolo la data di 7 giorni indietro alla data corrente
        let currentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        let pesateArr = [];
        let pesate = "";
        //Memorizzo il peso più vecchio dallo storico delle pesate
        let pesataIniziale = 0;
        let obiettivoRaggiunto = false;
        let trendPositive = false;
        let labels = [];
        let data = [];
        //Ottengo le pesate uguali o successive alla data presa in riferimento
        const pesateRef = db.collection("diets").doc(dietaId).collection("pesate").where("timestamp", ">=", currentDate).orderBy("timestamp", "desc");
        return pesateRef.get().then(function (pesateSnapshot) {
            if (pesateSnapshot.empty) {
                const payload = {
                    "text": "Non hai effettuato aggiornamenti del peso negli ultimi 7 giorni.\nVuoi farlo ora? 😊",
                    "reply_markup": {
                        "inline_keyboard": [
                            [{"text": "⚖️ Registra Peso", "callback_data": "Voglio aggiornare il peso"}],
                            [{"text": "🕑 Non Ora", "callback_data": "non posso aggiornare il peso ora"}]
                        ]
                    }
                };
                agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
            } else {
                //Formattazione data
                var options = {"weekday": "long", "month": "2-digit", "day": "2-digit"};
                pesateSnapshot.forEach(function (pesata) {
                    pesateArr.push(pesata.data(), pesata.id);
                    pesataIniziale = pesata.data().peso;
                    moment.locale("it");
                    const date = moment(pesata.data().timestamp.toDate()).format("ll");
                    labels.unshift(date);
                    data.unshift(pesata.data().peso);
                    pesate += "  ⚖️  " + date + ":   " + pesata.data().peso + " Kg\n";
                });
                //Recupero l'ultimo peso registrato e valuto se ha raggiunto l'obiettivo peso
                if (pesateArr[0].peso <= obiettivoPeso) {
                    obiettivoRaggiunto = true;
                } else {
                    obiettivoRaggiunto = false;
                }
                //Se unico, lo valuto con il peso del paziente registrato in fase di creazione dieta
                if (pesateArr.length === 1 && pesateArr[0].peso <= pesoPaziente) {
                    trendPositive = true;
                } else {
                    trendPositive = false;
                }
                //Se l'utente ha registrato almeno due pesi giornalieri, recupero l'ultimo peso registrato e valuto se il paziente sta facendo progressi positivi o
                //negativi rispetto al primo peso dello storico
                if (pesateArr.length >= 2 && pesateArr[0].peso < pesataIniziale) {
                    trendPositive = true;
                } else if (pesateArr.length >= 2 && pesateArr[0].peso >= pesataIniziale) {
                    trendPositive = false;
                }
                //Determino il grafico con l'andamento del peso
                //Calcolo minimo e massimo per l'asse y per meglio visualizzare i dati
                let minY = Math.min(...data, parseFloat(obiettivoPeso));
                let maxY = Math.max(...data, parseFloat(obiettivoPeso));
                Math.min(data, parseFloat(obiettivoPeso));
                const myChart = new ChartJsImage();
                myChart.setConfig({
                    type: "bar",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Peso giornaliero",
                            data: data,
                            fill: false,
                            borderColor: "orange",
                            backgroundColor: "orange"
                        }]
                    },
                    options: {
                        title: {
                            display: true,
                            text: "📊 Andamento del Peso (Ultimi 7 gg.)"
                        },
                        scales: {
                            xAxes: [
                                {
                                    scaleLabel: {
                                        display: true,
                                        fontColor: "#000000",
                                        fontSize: 14,
                                        fontStyle: "bold",
                                        labelString: "Pesi Giornalieri Registrati"
                                    }
                                }
                            ],
                            yAxes: [{
                                ticks: {
                                    min: minY - 1,
                                    max: maxY + 1
                                }
                            }]
                        },
                        annotation: {
                            annotations: [{
                                type: "line",
                                mode: "horizontal",
                                scaleID: "y-axis-0",
                                value: parseFloat(obiettivoPeso),
                                borderColor: "red",
                                label: {
                                    enabled: true,
                                    position: "right",
                                    content: "Obiettivo Peso"
                                },
                                borderDash: [5, 5],
                                borderWidth: 2,
                                spanGaps: true
                            }]
                        }
                    }
                });
                const dataUrl = myChart.getUrl();
                agent.add("📊 Ecco a te l'andamento del peso negli ultimi 7 giorni:");
                //grafico andamento del peso
                agent.add(new Image(dataUrl));
                console.log(dataUrl);

                if (obiettivoRaggiunto) {
                    agent.add(new Card({
                        title: "Obiettivo Raggiunto! 🏆 🎉",
                        text: getNewRewardingMessage(obiettivoRaggiunto, trendPositive),
                        imageUrl: "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/FestaObiettivoRaggiunto_2.png?alt=media&token=0a84ee59-7f20-4bd9-bc9c-b71564d79341"
                    }));
                    const payload = {
                        "text": "In vista della fine del tuo percorso dietetico, ho pensato potesse esserti d'aiuto fissare un appuntamento con il tuo nutrizionista 🤩",
                        "reply_markup": {
                            "inline_keyboard": [
                                [{"text": "🩺 Contatta Nutrizionista", "callback_data": "contatta nutrizionista"}],
                                [{"text": "🤩 Sono Carico", "callback_data": "sono carico"}]
                            ]
                        }
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                } else {
                    const payload = {
                        "text": getNewRewardingMessage(obiettivoRaggiunto, trendPositive),
                        "reply_markup": {
                            "inline_keyboard": [
                                [{"text": "😔 Mi sento un po' giù", "callback_data": "umore basso"}],
                                [{"text": "💬 Ottieni Consigli", "callback_data": "voglio un consiglio"}]
                            ]
                        }
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                }
                //Frase di apertura ad una possibile nuova richiesta
                agent.add(getNewPossibleRequestMessage());
                if (agent.context.get("private_context")) {
                    agent.context.delete("private_context");
                }
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di salvare un feedback di tipologia 'PROBLEMA' nel database
     */
    function setFeedbackProblem(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "REGISTRA PROBLEMA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let feedbackProblem = agent.parameters.feedbackProblem;
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "REGISTRA_FEEDBACK_PROBLEMA",
                        "feedbackProblem": feedbackProblem
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let feedbackRef = db.collection("diets").doc(doc.id).collection("feedback");
                    feedbackRef.doc().set({
                        testo: feedbackProblem,
                        tipologia: "PROBLEMA",
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                    const payload = {
                        "text": "Problema registrato correttamente!😊" +
                            "\nNoi di YourFoodCoach prendiamo molto seriamente il tuo feedback e risolveremo il problema il prima possibile 💪"
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }


    /*
     Permette all'utente di salvare un feedback di tipologia 'RICHIESTA_SOSTITUZIONE_PASTO' nel database
     */
    function setFeedbackFoodSubstitution(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "RICHIESTA NUOVA SOSTITUZIONE" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let feedbackFoodSubstitution = agent.parameters.feedbackFoodSubstitution;
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "REGISTRA_FEEDBACK_SOSTITUZIONE_PASTO",
                        "feedbackFoodSubstitution": feedbackFoodSubstitution
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let feedbackRef = db.collection("diets").doc(doc.id).collection("feedback");
                    feedbackRef.doc().set({
                        testo: feedbackFoodSubstitution,
                        tipologia: "RICHIESTA_SOSTITUZIONE_PASTO",
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                    const payload = {
                        "text": "Richiesta registrata correttamente!😊" +
                            "\nIl pasto inserito è stato segnalato al tuo nutrizionista e in futuro sarà certamente disponibile tra quelli della tua dieta 😃"
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di disattivare i consigli/notifiche che il chatbot invia
     giornalmente all'utente a scopo motivazionale (es. inserimento peso giornaliero)
     */
    function disattivaNotifiche(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "DISATTIVA NOTIFICHE" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "DISATTIVA_NOTIFICHE"
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    db.collection("diets").doc(doc.id).update({
                        telegram_alerts: false,
                        telegram_alerts_acqua: false
                    });
                    agent.add("Non riceverai più notifiche relative a suggerimenti, ricorda che potrai chiedermi sempre di riattivarle in qualsiasi momento!");
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di attivare i consigli/notifiche che il chatbot invia
     giornalmente all'utente a scopo motivazionale (es. inserimento peso giornaliero)
     */
    function attivaNotifiche(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "ATTIVA NOTIFICHE" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "ATTIVA_NOTIFICHE"
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    db.collection("diets").doc(doc.id).update({
                        telegram_alerts: true,
                        telegram_alerts_acqua: true
                    });
                    agent.add("Notifiche relative a suggerimenti riattivate con successo, ricorda che potrai chiedermi sempre di disattivarle in qualsiasi momento!");
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di accedere ai dati a lui associati nel database per mezzo di email
     e un codice fornito dal nutrizionista in fase di creazione della dieta.
     Una volta autorizzato il sistema memorizzerà solo lo user_id fornito da telegram
     e utilizzerà lo stesso per richieste future, così facendo l'utente non dovrà più
     inserire email e codice per autenticarsi
     */
    function authorizeUser(agent) {
        let telegram_user_id;
        let telegram_chat_id;
        let telegram_user_username;
        telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
        telegram_chat_id = request.body.originalDetectIntentRequest.payload.data.chat.id;
        telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        let passcode = agent.parameters.passcode;
        let email = agent.parameters.email.toLowerCase();
        let parent_intent = agent.context.get("private_context").parameters.intent;
        if (!parent_intent) {
            parent_intent = "RICHIESTA_COMPLETATA";
        }
        let credenzialiCheck = false;
        let dietRef = db.collection("diets").where("telegram_bot_passcode", "==", passcode)
                        .where("email_paziente", "==", email).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                console.log("Credenziali errate");
                credenzialiCheck = false;
            } else {
                querySnapshot.forEach(function (doc) {
                    if (doc.data().telegram_bot_passcode === passcode) {
                        //Credenziali corrette
                        dietRef = db.collection("diets").doc(doc.id);
                        dietRef.update({
                            telegram_user_id: telegram_user_id,
                            telegram_chat_id: telegram_chat_id
                        });
                        credenzialiCheck = true;
                        agent.add("I dati inseriti sono corretti, procedo subito con la tua richiesta 😊");
                        agent.setFollowupEvent(parent_intent);
                    } else {
                        console.log("Il codice inserito dal paziente è errato");
                        credenzialiCheck = false;
                    }
                });
            }
        }).then(() => {
            //Credenziali errate
            if (!credenzialiCheck) {
                agent.add("I dati da te inseriti non sono corretti, " +
                    "prova a ricontrollare meglio o rivolgiti al tuo nutrizionista per ricevere supporto ☺️");
                //Eliminazione del contesto
                if (agent.context.get("private_context")) {
                    agent.context.delete("private_context");
                }
            }
            return Promise.resolve("Write complete");
        }).catch(err => {
            //Dieta mancante
            agent.add("Non è presente alcuna dieta corrispondente ai dati da te inseriti");
        });
    }

    /*
     Permette all'utente di eseguire il login alla dieta inserendo le credenziali
     */
    function login(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_chat_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_chat_id = request.body.originalDetectIntentRequest.payload.data.chat.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_chat_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "LOGIN" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_chat_id", "==", telegram_chat_id)
                        .where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("eseguo subito la richiesta");
                agent.setFollowupEvent("AUTENTICAZIONE");
                if (!agent.context.get("private_context")) {
                    agent.context.set({
                        "name": "private_context",
                        "lifespan": 10,
                        "parameters": {
                            "intent": "RICHIESTA_COMPLETATA"
                        }
                    });
                }
            } else {
                agent.add("eseguo subito la richiesta");
                agent.setFollowupEvent("CAMBIA_CREDENZIALI");
            }
        }).then(() => {
            return Promise.resolve("Write complete");
        }).catch(err => {
            console.log(err);
            agent.add("ERRORE! Non è presente alcuna dieta corrispondente ai dati da te inseriti");
        });
    }

    /*
     Permette all'utente di eseguire la disconnessione dalla dieta di cui aveva precedentemente inserito le credenziali
     */
    function logout(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_chat_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_chat_id = request.body.originalDetectIntentRequest.payload.data.chat.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_chat_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "LOGOUT" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let loginCheck = false;
        let dietRef = db.collection("diets").where("telegram_chat_id", "==", telegram_chat_id)
                        .where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                console.log("Login non ancora eseguito");
                loginCheck = false;
            } else {
                querySnapshot.forEach(function (doc) {
                    dietRef = db.collection("diets").doc(doc.id);
                    dietRef.update({
                        telegram_user_id: "",
                        telegram_chat_id: ""
                    });
                    loginCheck = true;
                    agent.add("Disconnessione avvenuta con successo! 😊\nNel caso volessi accedere nuovamente alla dieta non esitare a chiedermelo 😉");
                });
            }
        }).then(() => {
            //L'utente non ha effettuato l'autenticazione a nessuna dieta
            if (!loginCheck) {
                agent.add("Non è necessario, al momento non hai eseguito l'accesso a nessuna dieta ☺️");
                //Elimino il contesto se esistente
                if (agent.context.get("private_context")) {
                    agent.context.delete("private_context");
                }
            }
            return Promise.resolve("Write complete");
        }).catch(err => {
            console.log(err);
            agent.add("ERRORE! Non è presente alcuna dieta corrispondente ai dati da te inseriti");
        });
    }

    /*
     Permette all'utente di rieseguire l'autenticazione
     */
    function changeCredentials(agent) {
        agent.context.set({
            "name": "private_context",
            "lifespan": 10,
            "parameters": {
                "intent": "RICHIESTA_COMPLETATA"
            }
        });
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_chat_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_chat_id = request.body.originalDetectIntentRequest.payload.data.chat.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_chat_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "CAMBIA CREDENZIALI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let loginCheck = false;
        let dietRef = db.collection("diets").where("telegram_chat_id", "==", telegram_chat_id)
                        .where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                console.log("Login non ancora eseguito");
                agent.add("Al momento non hai ancora effettuato l'autenticazione con nessuna dieta, aspetterò che tu lo faccia 😉");
                loginCheck = false;
            } else {
                querySnapshot.forEach(function (doc) {
                    dietRef = db.collection("diets").doc(doc.id);
                    dietRef.update({
                        telegram_user_id: "",
                        telegram_chat_id: ""
                    });
                    loginCheck = true;
                    agent.add("Procedo nell'eseguire la richiesta");
                    agent.setFollowupEvent("AUTENTICAZIONE");
                });
            }
        }).then(() => {
            //L'utente non ha effettuato l'autenticazione a nessuna dieta
            if (!loginCheck) {
                const payload = {
                    "text": "Al momento non hai ancora effettuato l'autenticazione con nessuna dieta 😊\nVuoi farlo ora?",
                    "reply_markup": {
                        "inline_keyboard": [
                            [{
                                "text": "🔐 Accedi alla dieta️",
                                "callback_data": "voglio accedere alla mia dieta"
                            }]
                        ]
                    }
                };
                agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                //Elimino il contesto se esistente
                if (agent.context.get("private_context")) {
                    agent.context.delete("private_context");
                }
            }
            return Promise.resolve("Write complete");
        }).catch(err => {
            console.log(err);
            agent.add("ERRORE! Non è presente alcuna dieta corrispondente ai dati da te inseriti");
        });
    }

    /*
     Permette all'utente di accedere a particolari funzioni, normalmente riservate ad utenti autenticati, in modalità ospite
     All'utente verranno richieste informazioni aggiuntive per poter ottenere il risultato della funzione richiesta
     */
    function getFunzioneOspite(agent) {
        let parent_intent = agent.context.get("private_context").parameters.intent;
        agent.add("Procedo nell'eseguire la richiesta");
        switch (parent_intent) {
            case "CALCOLA_IMC":
                let peso = agent.context.get("private_context").parameters.peso;
                agent.context.set({
                    "name": "imc_ospite_context",
                    "lifespan": 10,
                    "parameters": {
                        "peso": peso
                    }
                });
                agent.setFollowupEvent("CALCOLA_IMC_OSPITE");
                break;
            default:
                const payload = {
                    "text": "Mi dispiace, ma per poter accedere a questa funzione è necessario avere una dieta all'interno della piattaforma 'YourFoodCoach' 🍎\n Non preoccuparti, puoi ottenere la tua dieta seguendo le indicazioni che troverai cliccando sul pulsante qui sotto, che tu sia seguito da un nutrizionista o meno. Appena avrai la tua dieta registrata, potrai accedere a tutte le mie funzioni 😉",
                    "reply_markup": {
                        "inline_keyboard": [
                            [{
                                "text": "Come posso ottenerla? 👩‍⚕️👨‍⚕️",
                                "callback_data": "come posso richiedere una dieta"
                            }]
                        ]
                    }
                };
                agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                break;
        }
        //Elimino il contesto se esistente
        if (agent.context.get("private_context")) {
            agent.context.delete("private_context");
        }
    }

    /*
     Permette all'utente di calcolare l'indice di massa corporea (IMC) richiedendo il peso giornaliero
     Stampa l'indice di massa corporea (IMC) e valuta la sua fascia d'appartenenza
     */
    function getImc(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "CALCOLA IMC" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let peso = agent.parameters.peso;
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "CALCOLA_IMC",
                        "peso": peso
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let imc = (peso * 10000 / (Math.pow(doc.data().altezza_paziente, 2))).toPrecision(4);
                    let imcValutation = valutaImc(imc);
                    let imageUrl = getImcImage(imc);
                    agent.add(new Card({
                            title: "Analisi IMC",
                            text: "Il tuo IMC (Indice di Massa Corporea) è ora di " + imc + "\n" + imcValutation,
                            imageUrl: imageUrl
                        })
                    );
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente, in modalità ospite, di calcolare l'indice di massa corporea (IMC) richiedendo il peso giornaliero e l'altezza in cm
     Stampa l'indice di massa corporea (IMC) e valuta la sua fascia d'appartenenza
     */
    function getImcOspite(agent) {
        let altezza = agent.parameters.altezza;
        let peso = agent.parameters.peso;
        let imc = (peso * 10000 / (Math.pow(altezza, 2))).toPrecision(4);
        let imcValutation = valutaImc(imc);
        let imageUrl = getImcImage(imc);
        agent.add(new Card({
                title: "Analisi IMC",
                text: "Il tuo IMC (Indice di Massa Corporea) è ora di " + imc + "\n" + imcValutation,
                imageUrl: imageUrl
            })
        );
        //Frase di apertura ad una possibile nuova richiesta
        agent.add(getNewPossibleRequestMessage());
        if (agent.context.get("imc_ospite_context")) {
            agent.context.delete("imc_ospite_context");
        }
    }

    /*
     Stampa i contatti del nutrizionista che ha prodotto la dieta dell'utente: email e telefono
     */
    function getNutrizionista(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "OTTIENI DATI NUTRIZIONISTA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "CONTATTA_NUTRIZIONISTA"
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let email_nutrizionista = doc.data().email_nutrizionista;
                    let telefono_nutrizionista = doc.data().numero_telefono_nutrizionista;
                    if(doc.data().tipologia_dieta === "Nutrizionista"){
                        const payload = {
                            "text": "Puoi contattare il tuo nutrizionista e fissare un appuntamento sfruttando i seguenti recapiti:" +
                                "\n\n" + "📩  " + email_nutrizionista + "\n\n📞  " + telefono_nutrizionista
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    }else if(doc.data().tipologia_dieta === "Utente"){
                        const payload = {
                            "text": "Mi dispiace, hai creato tu la dieta attraverso il portale '🍎 YourFoodCoach', senza l'assistenza di un nutrizionista, quindi la dieta non è stata associata ad un professionista del settore alimentare",
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    }
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Stampa l'obiettivo peso del paziente impostato dal nutrizionista all'interno della dieta
     */
    function getObiettivoPeso(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "OTTIENI OBIETTIVO PESO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "OBIETTIVO_PESO"
                    }
                });

                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let obiettivoPeso = doc.data().obiettivo_peso;
                    const payload = {
                        "text": "L'obiettivo peso che il tuo nutrizionista ha indicato nella tua dieta è di:\n\n        ⚖️   " + obiettivoPeso + " kg" +
                            "\n\nNon preoccuparti! Seguendo i miei consigli raggiungerai presto i tuoi obiettivi 😉"
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));

                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Imposta la fascia oraria in cui il paziente pranza/cena di solito
     Le fasce orarie per il pranzo sono 4: 11-12, 12-13, 13-14, 14-15
     Le fasce orarie per la cena sono 4: 19-20, 20-21, 21-22, 22-23
     */
    function setFasciaOrariaPasti(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "IMPOSTA FASCIA ORARIA PASTI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let fasciaOraria = agent.parameters.fasciaOraria;
        let categoriaPasto = agent.parameters.categoriaPasto;
        const day = new Date().getDay();
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "REGISTRA_ORARIO_PASTO",
                        "fasciaOraria": fasciaOraria,
                        "categoriaPasto": categoriaPasto
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let dietaRef = db.collection("diets").doc(doc.id);
                    let categoriaFasciaOraria = "fascia_oraria_" + categoriaPasto;
                    dietaRef.update({
                        [categoriaFasciaOraria]: fasciaOraria
                    });
                    if (fasciaOraria === "0/0") {
                        agent.add("Nessun problema! 😉\nContinuerò lo stesso ad aiutarti con la tua dieta al meglio delle mie capacità 😃💪");
                    } else {
                        agent.add("Ti ringrazio! 😉\nQuesto mi permetterà di adattarmi alle tue abitudini in modo tale da poterti aiutare meglio con la tua dieta 💪😃");
                    }
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Stampa la fascia oraria del pasto selezionato dal paziente
     */
    function getFasciaOrariaPasti(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "OTTIENI FASCIA ORARIA PRANZI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let categoriaPasto = agent.parameters.categoriaPasto;
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "OTTIENI_FASCIA_ORARIA",
                        "categoriaPasto": categoriaPasto
                    }
                });

                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    if (categoriaPasto === "pranzo" || categoriaPasto === "cena") {
                        let categoriaFasciaOraria = "fascia_oraria_" + categoriaPasto;
                        let fasciaOraria = doc.data()[categoriaFasciaOraria];
                        console.log(fasciaOraria);
                        let fasciaOrariaFormatted = "";
                        switch (fasciaOraria) {
                            case "11/12":
                                fasciaOrariaFormatted = "11:00 - 12:00";
                                break;
                            case "12/13":
                                fasciaOrariaFormatted = "12:00 - 13:00";
                                break;
                            case "13/14":
                                fasciaOrariaFormatted = "13:00 - 14:00";
                                break;
                            case "14/15":
                                fasciaOrariaFormatted = "14:00 - 15:00";
                                break;
                            case "19/20":
                                fasciaOrariaFormatted = "19:00 - 20:00";
                                break;
                            case "20/21":
                                fasciaOrariaFormatted = "20:00 - 21:00";
                                break;
                            case "21/22":
                                fasciaOrariaFormatted = "21:00 - 22:00";
                                break;
                            case "22/23":
                                fasciaOrariaFormatted = "22:00 - 23:00";
                                break;
                            case "0/0":
                                fasciaOrariaFormatted = "Hai preferito non impostarla per il momento";
                                break;
                        }
                        if (fasciaOraria === "0/0") {
                            const payload = {
                                "text": "🕐 " + fasciaOrariaFormatted,
                                "reply_markup": {
                                    "inline_keyboard": [
                                        [{
                                            "text": "🕙 Voglio Impostarla Ora",
                                            "callback_data": "voglio impostare la fascia oraria per il " + categoriaPasto
                                        }]
                                    ]
                                }
                            };
                            agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                        } else {
                            const payload = {
                                "text": "La fascia oraria che hai selezionato per " + categoriaPasto + " è:\n\n" + "     🕐    " + fasciaOrariaFormatted +
                                    "\n\nNon preoccuparti! Ti avviserò per tempo 😉"
                            };
                            agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                        }
                    }
                    //l'utente ha selezionato un pasto per cui non è possibile impostare una fascia oraria
                    else {
                        const payload = {
                            "text": "Mi dispiace, ma al momento è possibile impostare una fascia oraria solo per il Pranzo e per la Cena! 😔"
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    }
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette di cambiare la fascia oraria, in cui il paziente pranza/cena di solito, precedentemente impostata
     Le fasce orarie per il pranzo sono 4: 11-12, 12-13, 13-14, 14-15
     Le fasce orarie per la cena sono 4: 19-20, 20-21, 21-22, 22-23
     */
    function changeFasciaOrariaPasti(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "CAMBIA FASCIA ORARIA PRANZI" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let categoriaPasto = agent.parameters.categoriaPasto;
        const day = new Date().getDay();
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "CAMBIA_FASCIA_ORARIA_PASTO",
                        "categoriaPasto": categoriaPasto
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    if (categoriaPasto === "pranzo") {
                        const payload = {
                            "text": "Quale fascia oraria vorresti impostare per " + categoriaPasto + "? 😊",
                            "reply_markup": {
                                "inline_keyboard":
                                    [
                                        [{
                                            "text": "🕙 11:00 - 12:00",
                                            "callback_data": "La fascia oraria per il pranzo è 11/12"
                                        }, {
                                            "text": "🕛 12:00 - 13:00",
                                            "callback_data": "La fascia oraria per il pranzo è 12/13"
                                        }],
                                        [{
                                            "text": "🕐 13:00 - 14:00",
                                            "callback_data": "La fascia oraria per il pranzo è 13/14"
                                        }, {
                                            "text": "🕒 14:00 - 15:00",
                                            "callback_data": "La fascia oraria per il pranzo è 14/15"
                                        }],
                                        [{
                                            "text": "🤔 Non saprei dirti",
                                            "callback_data": "Non saprei dirti la fascia oraria al momento"
                                        }],
                                        [{
                                            "text": "🤐 Non voglio dirtelo",
                                            "callback_data": "La fascia oraria per il pranzo è 0/0"
                                        }]

                                    ]
                            }
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    } else if (categoriaPasto === "cena") {
                        const payload = {
                            "text": "Quale fascia oraria vorresti impostare per " + categoriaPasto + "? 😊",
                            "reply_markup": {
                                "inline_keyboard":
                                    [
                                        [{
                                            "text": "🕙 19:00 - 20:00",
                                            "callback_data": "La fascia oraria per la cena è 19/20"
                                        }, {
                                            "text": "🕛 20:00 - 21:00",
                                            "callback_data": "La fascia oraria per la cena è 20/21"
                                        }],
                                        [{
                                            "text": "🕐 21:00 - 22:00",
                                            "callback_data": "La fascia oraria per la cena è 21/22"
                                        }, {
                                            "text": "🕒 22:00 - 23:00",
                                            "callback_data": "La fascia oraria per la cena è 22/23"
                                        }],
                                        [{
                                            "text": "🤔 Non saprei dirti",
                                            "callback_data": "Non saprei dirti la fascia oraria al momento"
                                        }],
                                        [{
                                            "text": "🤐 Non voglio dirtelo",
                                            "callback_data": "La fascia oraria per il pranzo è 0/0"
                                        }]

                                    ]
                            }
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    } else {
                        agent.add("Mi dispiace, ma al momento è possibile impostare una fascia oraria solo per il Pranzo e per la Cena! 😔");
                    }
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }


    /*
     Stampa al paziente una curiosità sul cibo
     La curiosità stampata può servire come spunto di approfondimento o per sfatare false credenze su alcuni cibi
     */
    function getCuriosita(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "OTTIENI CURIOSITA' SUL CIBO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const curiosita = [
            {
                text: "Secondo il trend ‘Breakslow’ mangiare bene, lentamente e in compagnia aiuta ad essere felici. 😃",
                website: "https://www.starbene.it/alimentazione/mangiare-sano/breakslow-colazione-felicita/"
            },
            {
                text: "Lo sapevi che le arance non sono i cibi con più vitamina C? 🍊 In realtà, contengono bassi livelli di vitamina C, soprattutto se paragonate ad altri tipi di frutta e verdura. 🥦",
                website: "https://www.finedininglovers.it/articolo/arance-vitamina-c"
            },
            {
                text: "I latticini, oltre a far parte di una dieta equilibrata, migliorano la salute dei denti aiutando a mineralizzare il loro smalto. 🥛",
                website: "https://www.lapecorella.it/2021/07/09/proteggere-i-denti-con-il-latte/"
            },
            {
                text: "Lo sapevi che i latticini non sono gli unici alimenti ricchi di calcio? 🥛 Tra questi ci sono spinaci, cipolle, broccoli, legumi, noci, yogurt, formaggio, uova, sardine e frutti di mare.",
                website: "https://www.melarossa.it/nutrizione/mangiare-sano/scopri-gli-alimenti-ricchi-di-calcio-da-assumere-se-non-bevi-latte/"
            },
            {
                text: "Lo sapevi che esistono grassi buoni? 🥑 Non tutti i grassi sono nocivi per il nostro fisico. I grassi insaturi sono sani e riducono il colesterolo cattivo, quindi il loro consumo è altamente raccomandato. Sono presenti in alimenti come salmone, tonno, avocado, noci, mandorle, pistacchi, sesamo e olio d'oliva.",
                website: "https://www.my-personaltrainer.it/alimentazione/grassi-buoni-grassi-cattivi.html"
            },
            {
                text: "Lo sapevi che potresti utilizzare del cioccolato per svegliarti? 🍫 Anche se in una concentrazione inferiore rispetto al caffè o al tè nero, contiene caffeina, quindi può essere usato come perfetto stimolante e come deliziosa alternativa.",
                website: "https://www.my-personaltrainer.it/benessere/caffeina-alimenti.html"
            },
            {
                text: "Lo sapevi che non bisogna buttare via il liquido dello yogurt? 🥛 È composto da acqua e sali minerali ed è ricco di calcio e fosforo. Meglio mangiarlo tutto!",
                website: "https://www.bigodino.it/benessere/buttare-il-liquido-che-si-forma-sulla-superficie-dello-yogurt-e-un-grave-errore.html"
            },
            {
                text: "Lo sapevi che le spezie sono ricche di ferro? 🍃 Timo, cumino, aneto, origano, alloro, basilico, cannella in polvere... Aggiungili alle tue ricette!",
                website: "https://www.proiezionidiborsa.it/non-solo-carne-ma-anche-queste-spezie-e-aromi-insospettabili-contengono-tanto-ferro-e-chi-ha-lanemia-dovrebbe-provarli/"
            },
            {
                text: "Lo sapevi che il tè verde potrebbe aiutarti con la digestione? 🫖 Sono di grande aiuto per chi soffre di Ipertensione",
                website: "https://www.my-personaltrainer.it/alimentazione/ipertensione-10-erbe-aromatiche-e-spezie-che-abbassano-la-pressione.html"
            },
            {
                text: "Lo sapevi che è meglio consumare la frutta al naturale e intera? 🍎 Quando sbucciamo o tagliamo i frutti, cambiamo le loro proprietà. ",
                website: "https://www.olivierinutrizione.it/meglio-mangiare-la-frutta-intera/"
            },
            {
                text: "Lo sapevi che mandorle e nocciole aiutano ad illuminare la pelle? 🌰 Contengono vitamina E che è un grande alleato per prendersi cura della propria pelle.",
                website: "https://www.pepinoshop.com/blog/bellezza/gli-alimenti-per-una-pelle-sempre-giovane-e-luminosa-20"
            },
            {
                text: "Lo sapevi che molto spesso snack alla frutta in realtà non ne contengono neanche un po'? 🧃 Molto spesso l'unica traccia del frutto è solo il sapore che però è dato quasi esclusivamente da aromatizzanti artificiali.",
                website: "https://www.italiasalute.it/8750/Snack-alla-frutta-in-realtà-non-ne-contengono.html"
            },
            {
                text: "Lo sapevi che i semi di papavero aiutano a contrastare lo stress? 🥛 Prova a metterne un po' sul tuo yogurt. ",
                website: "https://blog.giallozafferano.it/amicoorsocafe/semi-di-papavero/"
            },
            {
                text: "Lo sapevi che l'avocado è un ottimo sostituto del burro? 🥑 Usa una piccola quantità e potrai preparare le tue ricette in modo più sano.",
                website: "https://www.innaturale.com/come-usare-avocado-al-posto-del-burro/"
            },
            {
                text: "Lo sapevi che mangiare lentamente aiuta ad essere felici? 🍽️ Oltre ad evitare una cattiva digestione, mangiare più lentamente aiuta a liberarsi dallo stress e permette di non mangire eccessivamente.",
                website: "https://www.nonsprecare.it/benefici-del-mangiare-lentamente"
            },
            {
                text: "Lo sapevi che il miele può riempirti di energia? 🍯 Se sei alla ricerca di una sana alternativa allo zucchero da tavola, il miele è un'ottima opzione. ",
                website: "https://www.gazzetta.it/alimentazione/news/30-05-2018/il-miele-una-ricarica-di-energia-per-il-giusto-sprint-42555/"
            },
            {
                text: "Lo sapevi che due porzioni di frutta e tre di verdura al giorno riducono la probabilità di sviluppare i tumori dell'apparato digerente? 📚 😊",
                website: "https://www.educazionenutrizionale.granapadano.it/it/alimentazione/articoli/alimentazione-e-salute/frutta-e-vedura-alimenti-per-la-salute/"
            },
            {
                text: "Lo sapevi che le farine integrali contengono un'elevata quantità di fibra, componente dietetica non digeribile dal nostro organismo, capace di favorire il senso di sazietà e la perdita di peso? 📚 😊",
                website: "https://www.my-personaltrainer.it/integrale-raffinato.htm"
            },
            {
                text: "Lo sapevi che l'eccessivo consumo di sale determina un aumento della pressione arteriosa? 🧂 😊",
                website: "https://siia.it/per-il-pubblico/prevenzione-dellipertensione/poco-sale/"
            },
            {
                text: "Lo sapevi che bere molta acqua al giorno aiuta a dimagrire? 💦 😊",
                website: "https://www.melarossa.it/dieta/dimagrire/bere-tanta-acqua-fa-bene-alla-dieta/"
            }
        ];
        const index = Math.floor(Math.random() * curiosita.length);
        const payload = {
            "text": "Ti svelo una curiosità! 😉🎁\n" + curiosita[index].text + "\nTi andrebbe di approfondire l'argomento? 😊",
            "reply_markup": {
                "inline_keyboard": [
                    [{"text": "Approfondisci 🔎", "url": curiosita[index].website}],
                    [{"text": "Lo sapevo! 🤩", "callback_data": "Lo sapevo già!"}]
                ]
            }
        };
        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
    }

    /*
     Fornisce all'utente un messaggio per sopperire alla fame impaziente
     */
    function fameImpaziente(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "HO MOLTA FAME" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        const fameImpazienteMessage = [
            {
                text: "Prova a placare la fame con un frutto, è ricco di fibre che saziano e non appesantiscono 🍎 Fragole, lamponi, mirtilli sono ottimi alleati per la linea in quanto contengono poche calorie e sono ricchi di antiossidanti. Anche le mele sono apprezzate per il loro potere saziante",
                urlImmagine: "https://www.uvadatavola.com/wp-content/uploads/2017/05/k2_items_src_43c64cd6991f13e859e760792e964750.jpg"
            },
            {
                text: "Prova a placare la fame con 10 mandorle 🥜, soddisfano il senso di sazietà. Ricche di vitamina E, di vitamine del gruppo B e di sali minerali, sono vere e proprie alleate della salute. Ignora questo consiglio se sie allergico 😉",
                urlImmagine: "https://www.donnamoderna.com/content/uploads/2020/11/Mandorle-1-2.jpg"
            },
            {
                text: "Prova a placare la fame con uno yogurt 🥛, è ricco di proteine e, se scelto nella versione 0% di grassi, dal ridotto impatto calorico",
                urlImmagine: "https://www.tuttogreen.it/wp-content/uploads/2018/05/shutterstock_161872427-500x332.jpg"
            },
            {
                text: "Prova a placare la fame con un frullato 🍊, sono ricchi di fibre e hanno un grande potere saziante. Puoi scegliere tra frutti ipocalorici come fragole, frutti rossi, kiwi, pesche e melone",
                urlImmagine: "https://insanelygoodrecipes.com/wp-content/uploads/2021/09/Healthy-Colorful-Smoothies-on-Jars.jpg"
            }
        ];
        const index = Math.floor(Math.random() * fameImpazienteMessage.length);
        agent.add(new Card({
            title: "Stringi i denti! 😁💪",
            text: fameImpazienteMessage[index].text,
            imageUrl: fameImpazienteMessage[index].urlImmagine
        }));
    }

    /*
     Imposta il consumo d'acqua del paziente
     */
    function setConsumoAcqua(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "REGISTRO CONSUMO D'ACQUA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let acqua = agent.parameters.acqua;
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "REGISTRA_CONSUMO_ACQUA",
                        "acqua": acqua,
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    agent.context.set({
                        "name": "acqua_context",
                        "lifespan": 10,
                        "parameters": {
                            "intent": "REGISTRA_CONSUMO_ACQUA",
                            "dietaId": doc.id,
                            "acqua": acqua,
                        }
                    });
                    agent.add("Procedo nell'eseguire la richiesta");
                    agent.setFollowupEvent("INSERIMENTO_CONSUMO_ACQUA");
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }


    /*
     FollowUp di setConsumoAcqua che scrive nel db il consumo di acqua giornaliero controllando
     che non sia stato inserito precedentemente
     */
    function writeConsumoAcqua(agent) {
        let acqua = agent.parameters.acqua;
        let dietaId = agent.parameters.dietaId;
        let currentHour = new Date().getHours() + 1;
        //Calcolo la data corrente da mezzanotte
        let currentDate = new Date(Date.now());
        currentDate.setHours(0,0,0,0);
        //Ottengo i consumi d'acqua registrati il giorno corrente
        let consumoAcquaRef = db.collection("diets").doc(dietaId).collection('consumoAcqua');
        return consumoAcquaRef.where('timestamp', '>=', currentDate).get().then(function (acquaSnapshot) {
            consumoAcquaRef.doc().set({
                consumo_acqua_giornaliero: acqua,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            if(acqua < 2){
                agent.add(new Card({
                        title: "Prova a bere di più! 🚰",
                        text: "La quantità ottimale di acqua che deve assumere una persona adulta e sana ogni giorno è di 2 litri complessivi, per recuperare i liquidi persi con le urine e distribuire nel corpo la quantità di acqua necessaria alla vita delle cellule.",
                        imageUrl: "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/ConsumoAcqua%2FobiettivoAcquaNonRaggiunto.png?alt=media&token=135c56ef-0de6-41f4-b9ef-17411621c509",
                        buttonText: 'Approfondisci 🔎',
                        buttonUrl: 'https://www.fondazioneveronesi.it/magazine/articoli/lesperto-risponde/e-vero-che-bisogna-bere-2-litri-di-acqua-al-giorno-stare-bene'
                    })
                );
            }else{
                agent.add(new Card({
                        title: "Obiettivo Acqua raggiunto! 💦",
                        text: "Il tuo corpo ti ringrazierà 😉 Hai bevuto abbastanza acqua per consentire al tuo organismo di eliminare le sostanze tossiche e favorire lo sviluppo muscolare, il che è ottimo per chi vuole perdere peso 🤩",
                        imageUrl: "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/ConsumoAcqua%2FobiettivoAcquaRaggiunto.png?alt=media&token=2dbf18f1-6f68-429c-8ccd-7d295e7306d3"
                    })
                );
            }
            //Controllo inserimento consumo acqua già fatto
            /*if (acquaSnapshot.empty) {
                //Il paziente può inserire il dato solo dopo le 17 giorno corrente e prima del nuovo giorno
                if(currentHour > 17 && currentHour <= 23){
                    consumoAcquaRef.doc().set({
                        consumo_acqua_giornaliero: acqua,
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                    if(acqua < 2){
                        agent.add(new Card({
                                title: "Prova a bere di più! 🚰",
                                text: "La quantità ottimale di acqua che deve assumere una persona adulta e sana ogni giorno è di 2 litri complessivi, per recuperare i liquidi persi con le urine e distribuire nel corpo la quantità di acqua necessaria alla vita delle cellule.",
                                imageUrl: "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/ConsumoAcqua%2FobiettivoAcquaNonRaggiunto.png?alt=media&token=135c56ef-0de6-41f4-b9ef-17411621c509",
                                buttonText: 'Approfondisci 🔎',
                                buttonUrl: 'https://www.fondazioneveronesi.it/magazine/articoli/lesperto-risponde/e-vero-che-bisogna-bere-2-litri-di-acqua-al-giorno-stare-bene'
                            })
                        );
                    }else{
                        agent.add(new Card({
                                title: "Obiettivo Acqua raggiunto! 💦",
                                text: "Il tuo corpo ti ringrazierà 😉 Hai bevuto abbastanza acqua per consentire al tuo organismo di eliminare le sostanze tossiche e favorire lo sviluppo muscolare, il che è ottimo per chi vuole perdere peso 🤩",
                                imageUrl: "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/ConsumoAcqua%2FobiettivoAcquaRaggiunto.png?alt=media&token=2dbf18f1-6f68-429c-8ccd-7d295e7306d3"
                            })
                        );
                    }
               /!* }else{
                    //La richiesta proviene da un messaggio inviato direttamento dall'utente
                    if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
                        if(currentHour > 0 && currentHour <= 12){
                            agent.add("E' ancora troppo presto! Torna dopo aver consumato i pasti principali per tenere traccia del tuo consumo d'acqua giornaliero in modo più preciso, altrimenti te lo chiederò dopo cena 😊 😊");
                        }else if (currentHour > 12 && currentHour <= 15){
                            agent.add("Sei a metà della tua giornata e registrare ora il tuo consumo d'acqua giornaliero potrebbe essere impreciso 🚰\nTorna dopo aver consumato i pasti principali per avere una misurazione più accurata, altrimenti te lo ricorderò dopo cena 😊");
                        }else if (currentHour > 15 && currentHour <= 17){
                            agent.add("Aspetta ancora un po', hai ancora del tempo per bere più acqua e raggiungere il tuo obiettivo giornaliero di oltre 2 litri 🚰. Torna dopo aver consumato i pasti principali per una misurazione più precisa del tuo consumo d'acqua giornaliero, altrimenti ti ricorderò di farlo dopo cena 😊");
                        }
                    }
                    //La richiesta proviene da un messaggio di callback_data
                    else {
                        //Anche se in ritardo, salvo il consumo d'acqua del giorno precedente se entro le 13
                        if(currentHour > 0 && currentHour <= 13){
                            agent.add("Vedo che sei un po' in ritardo 🤭\nNon ti preoccupare, ho correttamente registrato il tuo consumo d'acqua per ieri 😊\nRicorda di tornare dopo cena per registrare quello di oggi 😉 🚰");
                            const dayOldTimestamp = admin.firestore.Timestamp.fromMillis(Date.now() - 86400000);
                            consumoAcquaRef.doc().set({
                                consumo_acqua_giornaliero: acqua,
                                timestamp: dayOldTimestamp
                            });
                        } else {
                            agent.add("Vedo che sei un po' in ritardo 🤭\nNon ti preoccupare, ricorda di tornare dopo cena per registrare quello di oggi 😉💦");
                        }
                    }
                }*!/
            }else{
                agent.add("Hai già registrato il tuo consumo di acqua per oggi 😊 Te lo chiederò nuovamente domani 😉");
            }*/
            //Frase di apertura ad una possibile nuova richiesta
            agent.add(getNewPossibleRequestMessage());
            if (agent.context.get("private_context")) {
                agent.context.delete("private_context");
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di disattivare i consigli/notifiche che il chatbot invia
     giornalmente all'utente relativi al consumo d'acqua giornaliero
     */
    function disattivaNotificheAcqua(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "DISATTIVA NOTIFICHE ACQUA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "DISATTIVA_NOTIFICHE_ACQUA"
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    db.collection("diets").doc(doc.id).update({
                        telegram_alerts_acqua: false
                    });
                    agent.add("Non riceverai più notifiche relative al consumo giornaliero d'acqua, ricorda che potrai chiedermi sempre di riattivarle in qualsiasi momento!");
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di attivare i consigli/notifiche che il chatbot invia
     giornalmente all'utente relativi al consumo d'acqua giornaliero
     */
    function attivaNotificheAcqua(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "ATTIVA NOTIFICHE ACQUA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "ATTIVA_NOTIFICHE_ACQUA"
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    db.collection("diets").doc(doc.id).update({
                        telegram_alerts_acqua: true
                    });
                    agent.add("Notifiche relative al consumo giornaliero d'acqua riattivate con successo, ricorda che potrai chiedermi sempre di disattivarle in qualsiasi momento! ");
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Imposta il diario alimentare
     */
    function setDiarioAlimentare(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  " + "REGISTRO DIARIO ALIMENTARE" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username + "  ***");
        } catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let categoriaPasto = agent.parameters.categoriaPasto;
        const d = new Date();
        let giorni = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
        let giorno = "oggi";
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "DIETA_DIARIO_ALIMENTARE",
                        "categoriaPasto": categoriaPasto
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    giorno = giorni[d.getDay()];
                    let emoji = "";
                    let tipologiaSpuntino = "";
                    switch (categoriaPasto) {
                        case "colazione":
                            emoji = "🥐";
                            break;
                        case "spuntino mattutino":
                            emoji = "🍎";
                            tipologiaSpuntino = "mattina";
                            break;
                        case "pranzo":
                            emoji = "🍝";
                            break;
                        case "spuntino pomeridiano":
                            emoji = "🧃";
                            tipologiaSpuntino = "pomeriggio";
                            break;
                        case "cena":
                            emoji = "🍖";
                            break;
                    }

                    let pasto = "";
                    if (categoriaPasto === "spuntino mattutino" || categoriaPasto === "spuntino pomeridiano") {
                        pasto = doc.data()["spuntino_" + giorno + "_" + tipologiaSpuntino].label;
                    } else {
                        pasto = doc.data()[categoriaPasto + "_" + giorno].label;
                    }
                    const payload = {
                        "text": "Per " + giorno.toUpperCase() + " la tua dieta prevedeva come " + categoriaPasto.toUpperCase() + " :" +
                            "\n\n" + emoji + " " + pasto + "\n\nHai seguito la dieta? 😊",
                        "reply_markup": {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "✅ Si",
                                        "callback_data": "Si ho seguito correttamente " + categoriaPasto
                                    },
                                    {
                                        "text": "❌ No",
                                        "callback_data": "Non ce l'ho fatta a seguire " + categoriaPasto
                                    }
                                ]
                            ]
                        }
                    };
                    agent.context.set({
                        "name": "diario_alimentare_context",
                        "lifespan": 10,
                        "parameters": {
                            "dietaId": doc.id,
                            "categoriaPasto": categoriaPasto
                        }
                    });
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Stampa un messaggio di soddisfazione insieme ad una sua rappresentazione grafica
     */
    function dietaSeguita(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "DIETA SEGUITA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietaId = agent.parameters.dietaId;
        console.log(dietaId);
        let categoriaPasto = agent.parameters.categoriaPasto;
        //Set di possibili risposte visive
        const highMoodMessage = [
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_1.png?alt=media&token=ddc2c90b-e712-41ce-b652-4e036d2e1c28",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_2.png?alt=media&token=d9859c9c-6eae-4998-a8ca-93392ab1aaca",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_3.png?alt=media&token=54d39272-3672-40a2-a93b-112df9003c96",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_4.png?alt=media&token=a53a3661-73f5-478d-9140-8c64e784dd9e",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_5.png?alt=media&token=12cc4dc3-870d-4a69-b4aa-253b2c9a5b86",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_6.png?alt=media&token=1422c1c4-4a37-40e1-928c-d228a948c186",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_7.png?alt=media&token=a420b8b1-de0f-4d2b-86e8-75528491bb19"
        ];

        //Set di possibili risposte visive
        const dietaSeguitaMessage = [
            "Anche oggi hai effettuato un ulteriore passo lungo la strada che ti porterà ai tuoi obiettivi, continua cosi! 😉",
            "Sono contento che tu stia seguendo la dieta alla lettera! raggiungerai presto i tuoi obiettivi! 😉",
            "Stai facendo davvero un ottimo lavoro! raggiungerai presto i tuoi obiettivi! 😉",
            "Complimenti! solo rispettando la dieta potrai raggiungere presto i tuoi obiettivi 😉",
            "Complimenti! il traguardo è sempre più vicino 😉",
        ];

        let currentHour = new Date().getHours() + 1;
        //Calcolo la data corrente da mezzanotte
        let currentDate = new Date(Date.now());
        currentDate.setHours(0,0,0,0);
        //Ottengo i consumi d'acqua registrati il giorno corrente
        let diarioAlimentareRef = db.collection("diets").doc(dietaId).collection('diarioAlimentare');
        return diarioAlimentareRef.where('timestamp', '>=', currentDate).where('categoria_pasto', '==', categoriaPasto).get().then(function (diarioSnapshot) {
            if (diarioSnapshot.empty) {
                diarioAlimentareRef.doc().set({
                    categoria_pasto: categoriaPasto,
                    descrizione:"Pasto seguito come da dieta",
                    sgarrato: false,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
                agent.add(new Card({
                        title: "Sono fiero di te! 🔝",
                        text: "Ho registrato i dati nel tuo diario alimentare 📘 😉\n" + dietaSeguitaMessage[Math.floor(Math.random() * dietaSeguitaMessage.length)],
                        imageUrl: highMoodMessage[Math.floor(Math.random() * highMoodMessage.length)],
                        buttonText: "💬 Ottieni Consigli",
                        buttonUrl: "voglio un consiglio"
                    })
                );
            }else{
                agent.add("E' già stato inserito il pasto che hai indicato nel diario alimentare di oggi 😊");
            }
            //Frase di apertura ad una possibile nuova richiesta
            agent.add(getNewPossibleRequestMessage());
            if (agent.context.get("private_context")) {
                agent.context.delete("private_context");
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Stampa un messaggio di insoddisfazione insieme ad una sua rappresentazione grafica
     */
    function dietaNonSeguita(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "DIETA NON SEGUITA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietaId = agent.parameters.dietaId;
        console.log(dietaId);
        let categoriaPasto = agent.parameters.categoriaPasto;
        let descrizione = agent.parameters.descrizione;
        //Set di possibili risposte visive
        const LowMoodMessage = [
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/BotPuoiFarcela.png?alt=media&token=6df3c867-869b-4e77-81ec-44bf10532588",
            "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/BotProviamoci.png?alt=media&token=85a7f7e9-d8d0-41ab-a0b9-4f0569cf7849",
        ];

        /*//Set di possibili risposte visive
        const dietaNonSeguitaMessage = [
            "Anche se oggi non hai seguito la dieta, non demordere e promettimi che ti impegnerai da questo momento in poi 😉",
            "Non mollare proprio adesso! Solo seguendo la dieta potrai raggiungere i tuoi obiettivi😉",
            "Seguire la dieta ti permetterà di raggiungere preso i tuoi obiettivi, provaci e non te ne pentirai! 😉",
            "Non facciamone un dramma, promettimi che ti impegnerai da questo momento in poi 😉",
            "Non mollare proprio adesso! Sono sicuro che da questo momento ti impegnerai di più nel seguire la dieta 😉",
        ];*/

        let currentHour = new Date().getHours() + 1;
        //Calcolo la data corrente da mezzanotte
        let currentDate = new Date(Date.now());
        currentDate.setHours(0,0,0,0);
        //Ottengo i consumi d'acqua registrati il giorno corrente
        let diarioAlimentareRef = db.collection("diets").doc(dietaId).collection('diarioAlimentare');
        return diarioAlimentareRef.where('timestamp', '>=', currentDate).where('categoria_pasto', '==', categoriaPasto).get().then(function (diarioSnapshot) {
            if (diarioSnapshot.empty) {
                diarioAlimentareRef.doc().set({
                    categoria_pasto: categoriaPasto,
                    descrizione: descrizione,
                    sgarrato: true,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
                const payload = {
                    "text": "Va bene, Ho registrato i dati nel tuo diario alimentare 📘 😉\nRicordati che seguire la dieta è importante per raggiungere i risultati desiderati 😊",
                    "reply_markup": {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "Impara a gestire lo sgarro 🤩",
                                    "url": "https://www.projectinvictus.it/sgarro-dieta-bodybuilding/"
                                }
                            ]
                        ]
                    }
                };
                agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
            }else{
                agent.add("E' già stato inserito il pasto che hai indicato nel diario alimentare di oggi 😊");
            }
            //Frase di apertura ad una possibile nuova richiesta
            agent.add(getNewPossibleRequestMessage());
            if (agent.context.get("private_context")) {
                agent.context.delete("private_context");
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Stampa un messaggio d'assistenza
     */
    function assistenza(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "Assistenza" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "ASSISTENZA"
                    }
                });

                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let obiettivoPeso = doc.data().obiettivo_peso;
                    if(doc.data().tipologia_dieta === "Nutrizionista"){
                        const payload = {
                            "text": "Ecco una semplice panoramica delle mie funzioni principali che puoi attivare dal comodo menù o scrivendo un messaggio:\n" +
                                "\n" +
                                "🍽️ Aiutarti a seguire la tua dieta personale inserita dal tuo nutrizionista all'interno del portale YourFoodCoach         \n" +
                                "es. \"Cosa mangio oggi?\"             \n" +
                                "\n" +
                                "🥦 Fornirti delle alternative per cibi non desiderati all'interno della dieta      \n" +
                                "es. \"Con cosa posso sostituire le fave?\"    \n" +
                                "                                                                                                                                                             \n" +
                                "⚖️ Aggiornare il tuo peso                                \n" +
                                "es. \"Voglio aggiornare il mio peso\"    \n" +
                                "                                                                                                                                                             \n" +
                                "📘 Compilare il tuo diario alimentare                            \n" +
                                "es. \"Voglio compilare il diario alimentare\"            \n" +
                                "                                                                                                                                                             \n" +
                                "📊 Consulta i tuoi progressi                              \n" +
                                "es. \"Puoi mostrarmi l'andamento del peso?\"            \n" +
                                "                                                                                                                                                             \n" +
                                "💧 Monitorare il consumo d'acqua giornaliero                             \n" +
                                "es. \"Voglio registrare il consumo d'acqua giornaliero\"                 \n" +
                                "                                                                                                                                                             \n" +
                                "🛒 Gestire la tua lista della spesa                             \n" +
                                "es. \"Voglio vedere la lista della spesa\"            \n" +
                                "                                                                                                                                                                                                                                         \n" +
                                "💪🏻 Fornirti un'analisi della tua situazione calcolando il tuo IMC (indice di massa corporea)                                \n" +
                                "es. \"Voglio conoscere il mio imc\"    \n" +
                                "                                                                                                                                                             \n" +
                                "⏲️ Fornirti i passaggi per la preparazione di un pasto                                \n" +
                                "es. \"Mi serve la preparazione di un pasto\" \n" +
                                "\n" +
                                "❌ Darti consigli sugli alimenti da assumere in presenza di alcune patologie e di alcuni disturbi          \n" +
                                "es. \"Dimmi cosa posso fare contro il lattosio\"\n" +
                                "\n" +
                                "🩺 Posso metterti in contatto con il tuo nutrizionista            \n" +
                                "es. \"Voglio parlare con il mio nutrizionista\"\n" +
                                "\n" +
                                "🆘 Posso segnalare un problema al tuo nutrizionista            \n" +
                                "es. \"Voglio segnalare un problema\"\n" +
                                "\n" +
                                "🔄 Posso segnalare al tuo nutrizionista nuove sostituzioni o pasti          \n" +
                                "es. \"Voglio cambiare un pasto non presente\"    \n" +
                                "                                                                                                                                                             \n" +
                                "💬 Fornirti curiosità sul cibo che mangi                              \n" +
                                "es. \"Dimmi una curiosità sul cibo\"" +
                                "\n\nOppure seleziona una delle opzioni disponibili e provvederò ad informare subito il tuo nutrizionista 😉",
                            "reply_markup": {
                                "inline_keyboard": [
                                    [
                                        {
                                            "text": "🔄 Richiedi nuova sostituzione",
                                            "callback_data": "Richiedi nuova sostituzione al nutrizionista"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "🆘 Segnala problema",
                                            "callback_data": "Segnala problema al nutrizionista"
                                        }
                                    ],
                                    [
                                        {
                                            "callback_data": "Contatta nutrizionista",
                                            "text": "🩺 Contatta nutrizionista"
                                        }
                                    ]
                                ]
                            }
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));

                    }else if(doc.data().tipologia_dieta === "Utente"){
                        const payload = {
                            "text": "Ecco una semplice panoramica delle mie funzioni principali che puoi attivare dal comodo menù o scrivendo un messaggio:\n" +
                                "\n" +
                                "🍽️ Aiutarti a seguire la tua dieta personale inserita dal tuo nutrizionista all'interno del portale YourFoodCoach         \n" +
                                "es. \"Cosa mangio oggi?\"             \n" +
                                "\n" +
                                "🥦 Fornirti delle alternative per cibi non desiderati all'interno della dieta      \n" +
                                "es. \"Con cosa posso sostituire le fave?\"    \n" +
                                "                                                                                                                                                             \n" +
                                "⚖️ Aggiornare il tuo peso                                \n" +
                                "es. \"Voglio aggiornare il mio peso\"    \n" +
                                "                                                                                                                                                             \n" +
                                "📘 Compilare il tuo diario alimentare                            \n" +
                                "es. \"Voglio compilare il diario alimentare\"            \n" +
                                "                                                                                                                                                             \n" +
                                "📊 Consulta i tuoi progressi                              \n" +
                                "es. \"Puoi mostrarmi l'andamento del peso?\"            \n" +
                                "                                                                                                                                                             \n" +
                                "💧 Monitorare il consumo d'acqua giornaliero                             \n" +
                                "es. \"Voglio registrare il consumo d'acqua giornaliero\"                 \n" +
                                "                                                                                                                                                             \n" +
                                "🛒 Gestire la tua lista della spesa                             \n" +
                                "es. \"Voglio vedere la lista della spesa\"            \n" +
                                "                                                                                                                                                                                                                                         \n" +
                                "💪🏻 Fornirti un'analisi della tua situazione calcolando il tuo IMC (indice di massa corporea)                                \n" +
                                "es. \"Voglio conoscere il mio imc\"    \n" +
                                "                                                                                                                                                             \n" +
                                "⏲️ Fornirti i passaggi per la preparazione di un pasto                                \n" +
                                "es. \"Mi serve la preparazione di un pasto\" \n" +
                                "\n" +
                                "❌ Darti consigli sugli alimenti da assumere in presenza di alcune patologie e di alcuni disturbi          \n" +
                                "es. \"Dimmi cosa posso fare contro il lattosio\"\n" +
                                "\n" +
                                "🆘 Posso segnalare un problema            \n" +
                                "es. \"Voglio segnalare un problema\"\n" +
                                "\n" +
                                "🔄 Posso segnalare nuove sostituzioni o pasti          \n" +
                                "es. \"Voglio cambiare un pasto non presente\"    \n" +
                                "                                                                                                                                                             \n" +
                                "💬 Fornirti curiosità sul cibo che mangi                              \n" +
                                "es. \"Dimmi una curiosità sul cibo\"",
                        };
                        agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));

                    }
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di registrare la giornata positiva affrontata
     */
    function giornataPositiva(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "REGISTRA GIORNATA POSITIVA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "GIORNATA_POSITIVA",
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let feedbackRef = db.collection("diets").doc(doc.id).collection("feedback");
                    feedbackRef.doc().set({
                        testo: "Ho trascorso una buona giornata",
                        tipologia: "GIORNATA_POSITIVA",
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                    agent.add(new Card({
                            title: "Sono felice per te! 🔝🤩 ",
                            text: "Sono felice di sentire che hai passato una bella giornata! Spero che tu possa avere sempre giornate così piacevoli e che tu possa goderti al massimo ogni momento. Buona serata!",
                            imageUrl: "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/UmoreAlto%2FUmoreAlto_IMG_2.png?alt=media&token=d9859c9c-6eae-4998-a8ca-93392ab1aaca",
                        })
                    );
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di registrare le motivazioni della giornata negativa affrontata
     */
    function giornataNegativa(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "REGISTRA GIORNATA NEGATIVA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let feedbackGiornata = agent.parameters.feedbackGiornata;
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "GIORNATA_NEGATIVA",
                        "feedbackProblem": feedbackGiornata
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let feedbackRef = db.collection("diets").doc(doc.id).collection("feedback");
                    feedbackRef.doc().set({
                        testo: feedbackGiornata,
                        tipologia: "GIORNATA_NEGATIVA",
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                    agent.add(new Card({
                            title: "Mi dispiace molto! 😔💪",
                            text: "Non demordere, sono sicuro che presto andrà meglio 💪 Sappi che io sarò sempre qui a fare il tifo per te 😉",
                            imageUrl: "https://firebasestorage.googleapis.com/v0/b/yourdietcoach-2022.appspot.com/o/BotProviamoci.png?alt=media&token=85a7f7e9-d8d0-41ab-a0b9-4f0569cf7849"
                        })
                    );
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di registrare la giornata normale affrontata
     */
    function giornataNormale(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "REGISTRA GIORNATA NORMALE" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "GIORNATA_NORMALE",
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let feedbackRef = db.collection("diets").doc(doc.id).collection("feedback");
                    feedbackRef.doc().set({
                        testo: "Ho trascorso una giornata normale",
                        tipologia: "GIORNATA_NORMALE",
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                    agent.add("Ho registrato correttamente il tuo feedback! 😉 💪");
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add(getNewPossibleRequestMessage());
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Ottieni id dieta per la lista della spesa la lista della spesa
     */
    function getidListaSpesa(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "LISTA_SPESA VISUALIZZA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "LISTA_SPESA"
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    agent.context.set({
                        "name": "lista_spesa_context",
                        "lifespan": 10,
                        "parameters": {
                            "intent": "LISTA_SPESA",
                            "dietaId": doc.id,
                        }
                    });
                    agent.add("Procedo nell'eseguire la richiesta");
                    agent.setFollowupEvent("LISTA_SPESA_STAMPA");
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Stampa la lista della spesa
     */
    function getListaSpesa(agent) {
        let dietaId = agent.parameters.dietaId;
        let listaSpesa = "";
        //Ottengo la lista della spesa
        const pesateRef = db.collection("diets").doc(dietaId).collection("listaSpesa");
        return pesateRef.get().then(function (spesaSnapshot) {
            if (spesaSnapshot.empty) {
                const payload = {
                    "text": "Non hai ancora aggiunto nulla alla lista della spesa\nVuoi farlo ora? 😊",
                    "reply_markup": {
                        "inline_keyboard": [
                            [{"text": "🛒 Inserisci Alimento", "callback_data": "Voglio inserire un alimento nella lista della spesa"}],
                            [{"text": "🕑 Non Ora", "callback_data": "non voglio farlo ora"}]
                        ]
                    }
                };
                agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
            } else {
                spesaSnapshot.forEach(function (spesa) {
                    listaSpesa += "  🍽️  " + spesa.data().alimento +"\n";
                });
                const payload = {
                    "text": "🛒 Ecco a te la lista della spesa:\n\n"+ listaSpesa,
                    "reply_markup": {
                        "inline_keyboard": [
                            [{"text": "🛒 Inserisci Alimento", "callback_data": "Voglio inserire un alimento nella lista della spesa"}],
                            [{"text": "🚫 Elimina Lista", "callback_data": "voglio eliminare la lista della spesa"}]
                        ]
                    }
                };
                agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));

                //Frase di apertura ad una possibile nuova richiesta
                agent.add(getNewPossibleRequestMessage());
                if (agent.context.get("private_context")) {
                    agent.context.delete("private_context");
                }
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette all'utente di salvare un alimento nella lista della spesa
     */
    function setListaSpesa(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "LISTA SPESA INSERIMENTO" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let alimento = agent.parameters.alimento;
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "LISTA_SPESA_INSERIMENTO",
                        "alimento": alimento
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let pesateRef = db.collection("diets").doc(doc.id).collection("listaSpesa");
                    pesateRef.doc().set({
                        alimento: alimento,
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                    const payload = {
                        "text": "Ho aggiornato correttamente la lista della spesa! 🛒\nPotrai consultare la lista della dieta in qualsiasi momento semplicemente chiedendomi \"Puoi mostrarmi la lista della dieta?\" 😊",
                        "reply_markup": {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "🛒 Mostra la lista della spesa",
                                        "callback_data": "Puoi mostrarmi la lista della dieta?"
                                    }
                                ]
                            ]
                        }
                    };
                    agent.add(new Payload(agent.TELEGRAM, payload, {rawPayload: false, sendAsMessage: true}));
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add("Sentiti libero di chiedermi anche altro 😊");
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                    if (agent.context.get("lista_spesa_context")) {
                        agent.context.delete("lista_spesa_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }

    /*
     Permette di eliminare la lista della spesa
     */
    function deleteListaSpesa(agent) {
        //Recupero il telegram user_id dell'utente
        let telegram_user_id;
        let telegram_user_username;
        //La richiesta proviene da un messaggio inviato direttamento dall'utente
        if (request.body.originalDetectIntentRequest.payload.data.from != undefined) {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.from.username;
        }
        //La richiesta proviene da un messaggio di callback_data
        else {
            telegram_user_id = request.body.originalDetectIntentRequest.payload.data.callback_query.from.id;
            telegram_user_username = request.body.originalDetectIntentRequest.payload.data.callback_query.from.username;
        }
        console.log("***  "+ "LISTA SPESA ELIMINA" + "  ***");
        //Scrittura Log richiesta
        try {
            console.log("*** Richiesta da =>  id:  " + telegram_user_id + "   -     Username:  " + telegram_user_username  + "  ***");
        }catch (e) {
            console.log("Errore nella scrittura del log:  " + e);
        }
        let dietRef = db.collection("diets").where("telegram_user_id", "==", telegram_user_id).limit(1);
        return dietRef.get().then(function (querySnapshot) {
            if (querySnapshot.empty) {
                agent.add("Per accedere a questa funzione ho bisogno di alcune informazioni 😊");
                agent.context.set({
                    "name": "private_context",
                    "lifespan": 10,
                    "parameters": {
                        "intent": "LISTA_SPESA_ELIMINA",
                    }
                });
                agent.setFollowupEvent("RICHIESTA_AUTENTICAZIONE");
            } else {
                querySnapshot.forEach(function (doc) {
                    let listaSpesaRef = db.collection("diets").doc(doc.id).collection("listaSpesa");
                    listaSpesaRef.get().then(function(querySnapshot) {
                        querySnapshot.forEach(function(doc) {
                            doc.ref.delete();
                        });
                    });
                    agent.add("Lista della spesa eliminata correttamente! 😊 🛒");
                    //Frase di apertura ad una possibile nuova richiesta
                    agent.add("Sentiti libero di chiedermi anche altro 😊");
                    if (agent.context.get("private_context")) {
                        agent.context.delete("private_context");
                    }
                });
            }
        }).then(() => {
            return Promise.resolve("Read complete");
        }).catch(err => {
            console.log(err);
            agent.add("Non è stato possibile completare la richiesta a causa di un errore sconosciuto");
        });
    }


    let intentMap = new Map();
    intentMap.set("Start.Benvenuto", benvenuto);
    intentMap.set("Start.Saluto", saluto);
    intentMap.set("Start.Saluto.Mattina", salutoMattina);
    intentMap.set("Start.Saluto.Pomeriggio", salutoPomeriggio);
    intentMap.set("Start.Saluto.Sera", salutoSera);
    intentMap.set("Consiglio", consiglio);
    intentMap.set("Consiglio.Intolleranze", intolleranze);
    intentMap.set("Consiglio.UmoreAlto", umoreAlto);
    intentMap.set("Sostituzione", sostituzioni);
    intentMap.set("Sostituzione.Carni", sostituzioniCarni);
    intentMap.set("Sostituzione.Salumi", sostituzioniSalumi);
    intentMap.set("Sostituzione.Pesci", sostituzioniPesci);
    intentMap.set("Sostituzione.Legumi", sostituzioniLegumi);
    intentMap.set("Sostituzione.Latticini", sostituzioniLatticini);
    intentMap.set("Sostituzione.Cereali", sostituzioniCereali);
    intentMap.set("Sostituzione.Verdure", sostituzioniVerdure);
    intentMap.set("Sostituzione.Frutti", sostituzioniFrutti);
    intentMap.set("Sostituzione.Altro", sostituzioniAltro);
    intentMap.set("Dieta.Autenticazione", authorizeUser);
    intentMap.set("Dieta.Accesso", login);
    intentMap.set("Dieta.Disconnessione", logout);
    intentMap.set("Dieta.RichiestaAutenticazione.No", getFunzioneOspite);
    intentMap.set("Dieta.Autenticazione.CambiaCredenziali", changeCredentials);
    intentMap.set("Dieta.Visualizza.Completa", getDietaCompleta);
    intentMap.set("Dieta.Visualizza.Giorno", getGiornoDieta);
    intentMap.set("Dieta.Visualizza.ObiettivoPeso", getObiettivoPeso);
    intentMap.set("Dieta.Pasto.Preparazione", getIdPasto);
    intentMap.set("Dieta.Pasto.Preparazione.Stampa", getPreparazionePasto);
    intentMap.set("Dieta.Peso.Aggiorna", setPeso);
    intentMap.set("Dieta.Peso.Andamento", getIdDieta);
    intentMap.set("Dieta.Peso.Andamento.Stampa", getAndamentoPeso);
    intentMap.set("Dieta.RegistraFeedback.Problema", setFeedbackProblem);
    intentMap.set("Dieta.RegistraFeedback.SostituzionePasto", setFeedbackFoodSubstitution);
    intentMap.set("Dieta.CalcolaImc", getImc);
    intentMap.set("Dieta.CalcolaImc.Ospite", getImcOspite);
    intentMap.set("Dieta.Notifiche.Disattiva", disattivaNotifiche);
    intentMap.set("Dieta.Notifiche.Attiva", attivaNotifiche);
    intentMap.set("Dieta.ContattaNutrizionista", getNutrizionista);
    intentMap.set("Dieta.Informazioni.FasciaOrariaPasti", setFasciaOrariaPasti);
    intentMap.set("Dieta.Informazioni.FasciaOrariaPasti.Ottieni", getFasciaOrariaPasti);
    intentMap.set("Dieta.Informazioni.FasciaOrariaPasti.Cambia", changeFasciaOrariaPasti);
    intentMap.set("Dieta.Curiosita", getCuriosita);
    intentMap.set("Dieta.HoFame", fameImpaziente);
    intentMap.set("Dieta.RegistraConsumoAcqua", setConsumoAcqua);
    intentMap.set("Dieta.RegistraConsumoAcqua.Inserimento", writeConsumoAcqua);
    intentMap.set("Dieta.Notifiche.Acqua.Disattiva", disattivaNotificheAcqua);
    intentMap.set("Dieta.Notifiche.Acqua.Attiva", attivaNotificheAcqua);
    intentMap.set("Dieta.DiarioAlimentare.Inserimento", setDiarioAlimentare);
    intentMap.set("Dieta.DiarioAlimentare.Inserimento.Si", dietaSeguita);
    intentMap.set("Dieta.DiarioAlimentare.Inserimento.No", dietaNonSeguita);
    intentMap.set("Dieta.Supporto", assistenza);
    intentMap.set("Dieta.AndamentoGiornata.Positivo", giornataPositiva);
    intentMap.set("Dieta.AndamentoGiornata.Negativo", giornataNegativa);
    intentMap.set("Dieta.AndamentoGiornata.Normale", giornataNormale);
    intentMap.set("Dieta.ListaSpesa", getidListaSpesa);
    intentMap.set("Dieta.ListaSpesa.Stampa", getListaSpesa);
    intentMap.set("Dieta.ListaSpesa.Inserimento", setListaSpesa);
    intentMap.set("Dieta.ListaSpesa.Elimina", deleteListaSpesa);
    agent.handleRequest(intentMap);
});
