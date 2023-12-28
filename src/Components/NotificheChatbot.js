const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const settings = {/* your settings... */ timestampsInSnapshots: true};
const db = admin.firestore();
db.settings(settings);
const axios = require('axios');

const telegramBotToken = '5401938294:AAHUj33nix_Z9E0vZJ1VLudIcvvA8RFGyJ4';
const ERROR = 'Si è verificato un errore nell\'invio dell\'alert';


/*
 Funzione che si occupa di fornire al paziente un messaggio motivazionale giornaliero non disattivabile
 Offre al paziente la possibilità di richiamare, attraverso pulsanti, le funzioni:
 - UmoreBasso
 - Consiglio
 Viene richiamata ogni giorno alle 7:00
 */
exports.reminderMotivazionaleGiornaliero = functions.pubsub.schedule('0 7 * * *')
                                                    .timeZone('Europe/Rome')
                                                    .onRun((context) => {
                                                        //Calcolo la data di 3 giorni indietro alla data corrente
                                                        let currentDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                                                        function getNewRewardingMessage(nomePaziente, obiettivoRaggiunto, trendPositive, nessunPeso) {
                                                            //Set di possibili messaggi da inviare quando l'utente ha già effettuato l'aggiornamento del peso nei giorni precedenti
                                                            const dailyWelcomeMessage = [
                                                                `Buongiorno ${nomePaziente}! ☀️`,
                                                                `Buondì ${nomePaziente}! ☀️`,
                                                                `Buona giornata ${nomePaziente}! ☀️`,
                                                                `Felice giornata ${nomePaziente}! ☀️`,
                                                                `Buon mattino ${nomePaziente}! ☀️`,
                                                            ];

                                                            const motivationalMessageTrendPositive = [
                                                                "dagli ultimi pesi giornalieri inseriti vedo che stai facendo davvero un ottimo lavoro con la dieta 💪",
                                                                "dagli ultimi pesi giornalieri inseriti noto che stai facendo ottimi progressi 💪",
                                                                "dagli ultimi pesi giornalieri inseriti vedo che stai facendo progressi e che presto raggiungerai tutti i tuoi obiettivi  💪",
                                                                "dagli ultimi pesi giornalieri inseriti noto che stai facendo davvero un ottimo lavoro con la dieta 💪",
                                                                "dagli ultimi pesi giornalieri inseriti vedo che stai facendo progressi 💪",
                                                                "ho visto gli ultimi pesi giornalieri inseriti e devo dire che sono soddisfatto dei tuoi progressi 💪",
                                                                "ho visto gli ultimi pesi giornalieri inseriti e devo dire che sono orgoglioso dei progressi che stai facendo 💪",
                                                            ];

                                                            const negativeUseMessage = [
                                                                "ho notato che negli ultimi giorni non hai inserito il peso giornaliero ⚖️",
                                                                "vedo che negli ultimi giorni non hai inserito il peso giornaliero ⚖️",
                                                                "noto che non hai registrato il peso negli ultimi giorni ⚖️",
                                                                "non hai aggiornato il peso giornaliero in questi ultimi giorni ⚖️",
                                                            ];

                                                            const negativeWeightMessage = [
                                                                "dagli ultimi pesi giornalieri inseriti vedo che non stai facendo grandi progressi ⚖️",
                                                                "dagli ultimi pesi giornalieri inseriti noto che non ti stai impegnando al 100% con la dieta ⚖️",
                                                                "dagli ultimi pesi giornalieri inseriti noto che non stai facendo progressi ⚖️",
                                                                "dagli ultimi pesi giornalieri inseriti edo che il tuo peso fatica a scendere ⚖️",
                                                                "ho visto gli ultimi pesi giornalieri inseriti e devo dire che il tuo peso fatica a scendere ⚖️",
                                                                "ho visto gli ultimi pesi giornalieri inseriti e devo dire che non stai facendo progressi ⚖️",
                                                                "ho visto gli ultimi pesi giornalieri inseriti e devo dire che non ti stai impegnando al 100% con la dieta ⚖️",

                                                            ];

                                                            const motivationalMessageGoalAchieved = [
                                                                "devo farti i miei complimenti! hai raggiunto il tuo obiettivo peso 🥳",
                                                                "dopo tanti sacrifici hai finalmente raggiunto il tuo obiettivo peso 🥳",
                                                                "sono così fiero di te! Hai finalmente raggiunto il tuo obiettivo peso 🥳",
                                                                "dobbiamo festeggiare! Dopo tanti sacrifici hai finalmente raggiunto il tuo obiettivo peso 🥳",
                                                                "obiettivo peso raggiunto! Sono così felice per te 🥳",
                                                                "sono felice di comunicarti che hai raggiunto il tuo obiettivo peso 🥳",
                                                            ];

                                                            const dailyMotivationalMessage = [
                                                                "Ricorda che il successo è la somma di tanti piccoli sforzi, ottenuti giorno dopo giorno 🧗 🏆",
                                                                "Ricorda che non è solo una dieta, è un cambiamento di stile di vita  🧘‍",
                                                                "Ricorda che impegnandoti oggi genererai la forza di cui avrai bisogno domani 🦁 🤩",
                                                                "Sii la versione migliore di te stesso e vedrai che i risultati non tarderanno ad arrivare 🥇",
                                                                "Il tuo impegno deve servirti a migliorare, non a raggiungere la perfezione 📈 😉",
                                                                "Voglio che tu sappia che che niente è davvero difficile se lo si divide in tanti piccoli pezzettini  🧩 😉",
                                                                "Voglio che tu sappia che che non è mai troppo tardi per essere ciò che vorresti essere ⌛ 😉",
                                                                "Voglio che tu sappia che la vita è fatta per il 10% da cosa ti accade e per il 90% da come reagisci. 🏆 🦁",
                                                                "Il segreto per andare avanti è iniziare, non scoraggiarti mai 🔝 🤩",
                                                                "Voglio che tu sappia che uno dei più grandi piaceri della vita è portare a termine ciò che gli altri dicevano che non saresti riuscito a fare 🔚 😉",
                                                                "Quando hai voglia di rinunciare, pensa al motivo per cui hai iniziato 🏋️‍♀️ 🔝",
                                                                "Non aspettare di raggiungere il tuo obiettivo per provare soddisfazione. Sii felice per ogni passo che fai per raggiungere quell’obiettivo 📈 😉",
                                                                "Ricorda che il fallimento non avrà mai il sopravvento su di te se la tua determinazione a raggiungere nuovi obiettivi è abbastanza forte 🧗 🏆",
                                                                "Voglio che tu sappia che il tuo corpo può fare qualsiasi cosa, non smettere mai di crederci! 🚀 😉",
                                                                "Non scoraggiarti se non noti subito progressi, i migliori sono spesso nascosti 🧗 😉"
                                                            ];
                                                            //Obiettivo peso raggiunto
                                                            if(obiettivoRaggiunto){
                                                                //Seleziono randomicamente una risposta nell'array
                                                                return dailyWelcomeMessage[Math.floor(Math.random()*dailyWelcomeMessage.length)] + ",\n" + motivationalMessageGoalAchieved[Math.floor(Math.random()*motivationalMessageGoalAchieved.length)] + "\n" + dailyMotivationalMessage[Math.floor(Math.random()*dailyMotivationalMessage.length)];
                                                            }else{
                                                                //Il paziente sta facendo progressi
                                                                if(trendPositive){
                                                                    //Seleziono randomicamente una risposta nell'array
                                                                    return dailyWelcomeMessage[Math.floor(Math.random()*dailyWelcomeMessage.length)] + ",\n" + motivationalMessageTrendPositive[Math.floor(Math.random()*motivationalMessageTrendPositive.length)] + "\n" + dailyMotivationalMessage[Math.floor(Math.random()*dailyMotivationalMessage.length)];
                                                                }
                                                                //Il paziente non sta facendo progressi
                                                                else {
                                                                    //Nessun peso inserito negli ultimi giorni
                                                                    if(nessunPeso){
                                                                        //Seleziono randomicamente una risposta nell'array
                                                                        return dailyWelcomeMessage[Math.floor(Math.random()*dailyWelcomeMessage.length)] + ",\n" + negativeUseMessage[Math.floor(Math.random()*negativeUseMessage.length)] + "\nProva ad impegnarti di più con la dieta e utilizzami per tracciare i tuoi progressi 💪 😉";
                                                                    }
                                                                    //Trend negativo
                                                                    else{
                                                                        //Seleziono randomicamente una risposta nell'array
                                                                        return dailyWelcomeMessage[Math.floor(Math.random()*dailyWelcomeMessage.length)] + ",\n" + negativeWeightMessage[Math.floor(Math.random()*negativeWeightMessage.length)] + "\nProva ad impegnarti di più con la dieta e vedrai che andrà meglio 💪 😉";
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        //Ottengo tutte le diete create
                                                        const dietRef = db.collection("diets");
                                                        dietRef.get().then(function (querySnapshot) {
                                                            querySnapshot.forEach(function (doc) {
                                                                let pesate = [];
                                                                let obiettivoRaggiunto = false;
                                                                let trendPositive = false;
                                                                let alreadyInserted = false;
                                                                //Controllo che l'utente abbia configurato l'accesso al bot telegram
                                                                if (doc.data().telegram_chat_id !== "") {
                                                                    //Controllo che l'utente non abbia già inserito il peso giornaliero
                                                                    //Ottengo le pesate uguali o successive alla data presa in riferimento
                                                                    const pesateRef = db.collection("diets").doc(doc.id).collection("pesate").where("timestamp", ">=", currentDate).orderBy("timestamp", "desc");
                                                                    pesateRef.get().then(function (pesateSnapshot) {
                                                                        //Il paziente ha già registrato il peso giornaliero negli ultimi 3 giorni
                                                                        if (!pesateSnapshot.empty) {
                                                                            alreadyInserted = true;
                                                                            pesateSnapshot.forEach(function (pesata){
                                                                                pesate.push(pesata.data());
                                                                            })
                                                                            console.log(pesate)
                                                                        }else{
                                                                            alreadyInserted = false;
                                                                        }
                                                                    }).then(() => {
                                                                        //Il paziente ha già inserito il peso giornaliero nei 3 giorni precedenti
                                                                        if (alreadyInserted) {
                                                                            //Ultimo peso registrato
                                                                            let peso = pesate[0].peso;

                                                                            //Se presente, peso precedente all'ultimo peso registrato
                                                                            let pesoPrecedente = pesate.length >= 2 ? pesate[1].peso : 0;

                                                                            //Recupero l'ultimo peso registrato e valuto se ha raggiunto l'obiettivo peso
                                                                            if(peso <= doc.data().obiettivo_peso){
                                                                                obiettivoRaggiunto = true;
                                                                            }else {
                                                                                obiettivoRaggiunto = false;
                                                                            }
                                                                            //Se unico, lo valuto con il peso del paziente registrato in fase di creazione dieta
                                                                            if(pesate.length === 1 && peso <= doc.data().peso_paziente){
                                                                                trendPositive = true;
                                                                            }else {
                                                                                trendPositive = false;
                                                                            }
                                                                            //Se l'utente ha registrato almeno due pesi giornalieri
                                                                            //Valuto se sta facendo progressi positivi o negativi rispetto al peso precedente
                                                                            if(pesate.length >= 2 && peso < pesoPrecedente){
                                                                                trendPositive = true;
                                                                            }else if (pesate.length >= 2 && peso >= pesoPrecedente){
                                                                                trendPositive = false;
                                                                            }
                                                                            if(obiettivoRaggiunto){
                                                                                const MESSAGE = getNewRewardingMessage(doc.data().nome_paziente, obiettivoRaggiunto, trendPositive, false);
                                                                                const body = { "reply_markup": { "inline_keyboard": [
                                                                                            [{ "text": "🤩 Sono carico", "callback_data": "sono carico" }],
                                                                                            [{ "text": "🩺 Contatta nutrizionista", "callback_data": "contatta nutrizionista" }]
                                                                                        ]}};
                                                                                if ( doc.data().telegram_chat_id !== '' ) {
                                                                                    console.log("MESSAGGIO INVIATO: OBIETTIVO RAGG.",doc.data().telegram_chat_id);
                                                                                    axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                                                }
                                                                            }else {
                                                                                const MESSAGE = getNewRewardingMessage(doc.data().nome_paziente, obiettivoRaggiunto, trendPositive, false);
                                                                                const body = { "reply_markup": { "inline_keyboard": [
                                                                                            [{ "text": "😔 Mi sento giù", "callback_data": "umore basso" },{ "text": "🤩 Sono carico", "callback_data": "sono carico" }],
                                                                                            [{ "text": "⚖️ Aggiorna Peso", "callback_data": "Voglio aggiornare il peso" }, { "text": "💬 Ottieni Consigli", "callback_data": "voglio un consiglio" }]
                                                                                        ]}};
                                                                                if ( doc.data().telegram_chat_id !== '' ) {
                                                                                    console.log("MESSAGGIO INVIATO: OBIETT. NON RAGG CON ANALISI TREND",doc.data().telegram_chat_id);
                                                                                    axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                                                }
                                                                            }
                                                                        }
                                                                        //Il paziente non ha ancora inserito il peso giornaliero nei 4 giorni precedenti
                                                                        else {
                                                                            const MESSAGE = getNewRewardingMessage(doc.data().nome_paziente, obiettivoRaggiunto, false, true);
                                                                            const body = { "reply_markup": { "inline_keyboard": [
                                                                                        [{ "text": "😔 Mi sento giù", "callback_data": "umore basso" },{ "text": "🤩 Sono carico", "callback_data": "sono carico" }],
                                                                                        [{ "text": "⚖️ Aggiorna Peso", "callback_data": "Voglio aggiornare il peso" }, { "text": "💬 Ottieni Consigli", "callback_data": "voglio un consiglio" }]
                                                                                    ]}};
                                                                            if ( doc.data().telegram_chat_id !== '' ) {
                                                                                console.log("MESSAGGIO INVIATO: PESO NON INSERITO NEI 4 GG",doc.data().telegram_chat_id);
                                                                                axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }).then(() => {
                                                            return Promise.resolve("Read complete");
                                                        }).catch(err => {
                                                            console.log(ERROR + ": => " + err);
                                                        });
                                                    });

/*
 Funzione che si occupa di favorire l'inserimento del peso giornaliero
 Viene richiamata ogni Lunedì, Giovedì e Sabato alle 10.30
 Controlla che l'utente non abbia già inserito il peso giornaliero nei tre giorni precedenti:
 Se si, gratifica il paziente con un messaggio motivazionale
 Se no, suggerisce all'utente di effettuare l'inserimento del peso giornaliero
 Offre al paziente la possibilità di richiamare, attraverso pulsanti, le funzioni:
 - AggiornaPeso
 - AggiornaPeso.NonOra
 - Notifiche.Disattiva
 */
exports.reminderPesoGiornaliero = functions.pubsub.schedule('30 10 * * 1,4,6')
                                           .timeZone('Europe/Rome')
                                           .onRun((context) => {

                                               function getNewRewardingMessage(nomePaziente) {
                                                   //Set di possibili messaggi da inviare quando l'utente ha già effettuato l'aggiornamento del peso nei giorni precedenti
                                                   const rewardingMessage = [
                                                       `Complimenti ${nomePaziente}! 😃\nStai memorizzando il peso giornaliero con costanza e stai facendo davvero un ottimo lavoro! 😃\nContinua così! 💪`,
                                                       `Ben fatto ${nomePaziente}! 😃\nMemorizzare con costanza il peso giornaliero ti consentirà di raggiungere presto i tuoi obiettivi! 😃\nVai avanti così! 💪`,
                                                       `Vai avanti così ${nomePaziente}! 😃\nSono davvero felice che tu stia aggiornando con costanza il tuo peso giornaliero, il tuo traguardo si sta avvicinando sempre più 💪`,
                                                       `Sono fiero di te ${nomePaziente}! 😃\nAggiornare il tuo peso giornalmente ti consentirà di valutare meglio i progressi finora effettuati seguendo la dieta! 😃\nVai avanti così! 💪`,
                                                       `Stai facendo un ottimo lavoro ${nomePaziente}! 😃\nDagli aggiornamenti del peso che hai inserito noto che stai facendo grandi progressi! 😃\nContinua così! 💪`,
                                                       `Ben fatto ${nomePaziente}! 😃\nDagli aggiornamenti del peso che hai inserito noto che stai seguendo alla lettera la tua dieta! 😃\nContinua pure così! 💪`,
                                                   ];
                                                   //Seleziono randomicamente una risposta nell'array
                                                   return rewardingMessage[Math.floor(Math.random()*rewardingMessage.length)];
                                               }

                                               function getNewSetPesoMessage(nomePaziente) {
                                                   //Set di possibili messaggi da inviare quando l'utente ha già effettuato l'aggiornamento del peso nei giorni precedenti
                                                   const setPesoMessage = [
                                                       `Hey ${nomePaziente}! 😊\nHo visto che negli ultimi giorni non hai inserito il tuo peso giornaliero.\nVuoi farlo ora? 💪`,
                                                       `Ciao ${nomePaziente}! 😊\nHo notato che non hai inserito il tuo peso giornaliero ultimamente.\nVuoi farlo ora? 💪`,
                                                       `Hey ${nomePaziente}! 😃\nSolo registrando con costanza il tuo peso giornaliero potrai valutare al meglio i progressi effettuati con la dieta 💪\nVuoi farlo ora?`,
                                                       `Ciao ${nomePaziente}! 😊\nNegli ultimi giorni non hai inserito il tuo peso giornaliero.\nVuoi farlo ora? 💪`,
                                                   ];
                                                   //Seleziono randomicamente una risposta nell'array
                                                   return setPesoMessage[Math.floor(Math.random()*setPesoMessage.length)];
                                               }

                                               let alreadyInserted = false;
                                               //Calcolo la data di 3 giorni indietro alla data corrente
                                               let currentDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                                               console.log(currentDate.toUTCString());

                                               //Ottengo tutte le diete create
                                               const dietRef = db.collection('diets');
                                               dietRef.get().then(function(querySnapshot) {
                                                   querySnapshot.forEach(function(doc) {
                                                       //Controllo che l'utente abbia configurato l'accesso al bot telegram e voglia ricevere notifiche
                                                       if (doc.data().telegram_chat_id !== "" && doc.data().telegram_alerts === true) {
                                                           //Controllo che l'utente non abbia già inserito il peso giornaliero
                                                           //Ottengo le pesate uguali o successive al giorno corrente
                                                           const pesateRef = db.collection('diets').doc(doc.id).collection('pesate').where('timestamp', '>=', currentDate);
                                                           pesateRef.get().then(function (pesateSnapshot) {
                                                               //Il paziente ha già registrato il peso giornaliero negli ultimi 3 giorni
                                                               if(!pesateSnapshot.empty){
                                                                   alreadyInserted = true;
                                                               }
                                                           }).then(()=>{
                                                               //Il paziente ha già inserito il peso giornaliero
                                                               if(alreadyInserted){
                                                                   const MESSAGE = getNewRewardingMessage(doc.data().nome_paziente);
                                                                   if ( doc.data().telegram_chat_id !== '') {
                                                                       axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`);
                                                                   }
                                                               }
                                                               //Il paziente non ha ancora inserito il peso giornaliero
                                                               else {
                                                                   const MESSAGE = getNewSetPesoMessage(doc.data().nome_paziente);
                                                                   const body = { "reply_markup": { "inline_keyboard": [
                                                                               [{ "text": "⚖️ Registra Peso", "callback_data": "Voglio aggiornare il peso" }],
                                                                               [{ "text": "🕑 Non ora", "callback_data": "non posso aggiornare il peso ora" }],
                                                                               [{ "text": "🔕 Disattiva Consigli", "callback_data": "disattiva notifiche" }]
                                                                           ]}};
                                                                   if ( doc.data().telegram_chat_id !== '') {
                                                                       console.log("MESSAGGIO INVIATO:",doc.data().telegram_chat_id);
                                                                       axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                                   }
                                                               }
                                                           })
                                                       }
                                                   });
                                               }).then(() => {
                                                   return Promise.resolve('Read complete');
                                               }).catch(err => {
                                                   console.log(ERROR + ": => " + err);
                                               });
                                           });

/*
 Funzione che si occupa di raccogliere informazioni relative all'orario del pranzo dei pazienti
 Viene richiamata ogni Lunedì, Mercoledì e Venerdì alle 15
 Offre al paziente la possibilità di richiamare, attraverso pulsanti, le funzioni:
 - Set di fasce orarie
 - Non saprei
 - Non voglio dirlo
 */
exports.reminderOrarioPranzo = functions.pubsub.schedule('0 15 * * 1,3,5')
                                        .timeZone('Europe/Rome')
                                        .onRun((context) => {

                                            function getQuestionMealMessage(nomePaziente, pasto) {
                                                const dailyWelcomeMessage = [
                                                    `Ciao ${nomePaziente}! ☀️`,
                                                    `Hei ${nomePaziente}! ☀️`,
                                                    `Buongiorno ${nomePaziente}! ☀️`,
                                                    `Salve ${nomePaziente}! ☀️`,
                                                ];
                                                //Set di possibili domande da fare all'utente
                                                const questionMessage = [
                                                    `di solito a che ora ${pasto}?`,
                                                    `normalmente a che ora ${pasto}?`,
                                                    `puoi dirmi a che ora ${pasto} di solito?`,
                                                    `ti andrebbe di dirmi a che ora ${pasto} di solito?`,
                                                    `potresti dirmi a che ora ${pasto} di solito?`,
                                                ];
                                                //Seleziono randomicamente una risposta nell'array
                                                return dailyWelcomeMessage[Math.floor(Math.random()*dailyWelcomeMessage.length)] + ",\n" + questionMessage[Math.floor(Math.random()*questionMessage.length)];
                                            }

                                            //Ottengo tutte le diete create
                                            const dietRef = db.collection('diets');
                                            dietRef.get().then(function(querySnapshot) {
                                                querySnapshot.forEach(function(doc) {
                                                    //Controllo che l'utente abbia configurato l'accesso al bot telegram
                                                    if (doc.data().telegram_chat_id !== "") {
                                                        //Controllo che l'utente non abbia già registrato la fascia oraria in precedenza
                                                        if(doc.data().fascia_oraria_pranzo === ""){
                                                            const MESSAGE = getQuestionMealMessage(doc.data().nome_paziente, "pranzi") + "\nQuesta informazione mi consentirà di aiutarti al meglio con la tua dieta 😉";
                                                            const body = { "reply_markup": { "inline_keyboard":
                                                                        [
                                                                            [{"text": "🕙 11:00 - 12:00", "callback_data": "La fascia oraria per il pranzo è 11/12"}, {"text": "🕛 12:00 - 13:00", "callback_data": "La fascia oraria per il pranzo è 12/13"}],
                                                                            [{"text": "🕐 13:00 - 14:00", "callback_data": "La fascia oraria per il pranzo è 13/14"}, {"text": "🕒 14:00 - 15:00", "callback_data": "La fascia oraria per il pranzo è 14/15"}],
                                                                            [{"text": "🤔 Non saprei dirti", "callback_data": "Non saprei dirti la fascia oraria al momento"}],
                                                                            [{"text": "🤐 Non voglio dirtelo", "callback_data": "La fascia oraria per il pranzo è 0/0"}],

                                                                        ]}};
                                                            if ( doc.data().telegram_chat_id !== '') {
                                                                console.log("MESSAGGIO INVIATO:",doc.data().telegram_chat_id);
                                                                axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                            }
                                                        }
                                                    }
                                                });
                                            }).then(() => {
                                                return Promise.resolve('Read complete');
                                            }).catch(err => {
                                                console.log(ERROR + ": => " + err);
                                            });
                                        });

/*
 Funzione che si occupa di ricordare al paziente l'incombenza del pranzo così da spronarlo a non sgarrare
 Viene richiamata ogni giorno alle 10.42, 11.42, 12.42, 13.42
 Offre al paziente la possibilità di richiamare, attraverso pulsanti, le funzioni:
 - Dieta.Visualizza.Giorno
 - Sostituzione
 - Dieta.Pasto.Preparazione
 - Notifiche.Disattiva
 */
exports.reminderPastoPranzo = functions.pubsub.schedule('42 10,11,12,13 * * *')
                                       .timeZone('Europe/Rome')
                                       .onRun((context) => {

                                           function getReminderLaunchMessage() {
                                               const reminderLaunchMessage = [
                                                   `È quasi l'ora del pranzo! 🍝 Non mollare proprio adesso 💪`,
                                                   `L'ora del pranzo si avvicina 🍝, non mollare proprio adesso 💪`,
                                                   `Si avvicina l'ora del pranzo 🍝, non mollare proprio adesso 💪`,
                                               ];

                                               //Seleziono randomicamente una risposta nell'array
                                               return reminderLaunchMessage[Math.floor(Math.random()*reminderLaunchMessage.length)];
                                           }
                                           const d = new Date();
                                           //Determino l'ora corrente aumentata di un'ora
                                           //getHours() determina l'ora corrente - 1
                                           let oraCorrente = d.getHours() + 2;
                                           let fasciaOraria = oraCorrente + "/" + (oraCorrente + 1)

                                           //Ottengo tutte le diete create
                                           const dietRef = db.collection('diets');
                                           dietRef.get().then(function(querySnapshot) {
                                               querySnapshot.forEach(function(doc) {
                                                   //Controllo che l'utente abbia configurato l'accesso al bot telegram e voglia ricevere notifiche
                                                   if (doc.data().telegram_chat_id !== "" && doc.data().telegram_alerts === true) {
                                                       //Controllo che l'utente abbia già registrato la fascia oraria e che sia la fascia oraria selezionata
                                                       if(doc.data().fascia_oraria_pranzo !== "" && doc.data().fascia_oraria_pranzo === fasciaOraria){
                                                           const MESSAGE = getReminderLaunchMessage();
                                                           const body = { "reply_markup": { "inline_keyboard":
                                                                       [
                                                                           [{"text": "🍝 Consulta Pranzo", "callback_data": "cosa mangio oggi a pranzo"},{"text": "🍽️ Consulta Dieta", "callback_data": "Consulta dieta completa" }],
                                                                           [{"text": "⏲ Preparazione Pranzo", "callback_data": "non so come preparare il pranzo di oggi"}],
                                                                       ]}};
                                                           if ( doc.data().telegram_chat_id !== '') {
                                                               console.log("MESSAGGIO INVIATO:",doc.data().telegram_chat_id);
                                                               axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                           }
                                                       }
                                                   }
                                               });
                                           }).then(() => {
                                               return Promise.resolve('Read complete');
                                           }).catch(err => {
                                               console.log(ERROR + ": => " + err);
                                           });
                                       });

/*
 Funzione che si occupa di raccogliere informazioni relative all'orario del pranzo dei pazienti
 Viene richiamata ogni Martedì, Giovedì alle 19
 Offre al paziente la possibilità di richiamare, attraverso pulsanti, le funzioni:
 - Set di fasce orarie
 - Non saprei
 - Non voglio dirlo
 */
exports.reminderOrarioCena = functions.pubsub.schedule('0 19 * * 2,4')
                                      .timeZone('Europe/Rome')
                                      .onRun((context) => {

                                          function getQuestionMealMessage(nomePaziente, pasto) {
                                              const dailyWelcomeMessage = [
                                                  `Ciao ${nomePaziente}!`,
                                                  `Hei ${nomePaziente}!`,
                                                  `Buonasera ${nomePaziente}!`,
                                                  `Salve ${nomePaziente}!`,
                                              ];
                                              //Set di possibili domande da fare all'utente
                                              const questionMessage = [
                                                  `di solito a che ora ${pasto}? 🍽️`,
                                                  `normalmente a che ora ${pasto}? 🍽️`,
                                                  `puoi dirmi a che ora ${pasto} di solito? 🍽️`,
                                                  `ti andrebbe di dirmi a che ora ${pasto} di solito? 🍽️`,
                                                  `potresti dirmi a che ora ${pasto} di solito? 🍽️`,
                                              ];
                                              //Seleziono randomicamente una risposta nell'array
                                              return dailyWelcomeMessage[Math.floor(Math.random()*dailyWelcomeMessage.length)] + ",\n" + questionMessage[Math.floor(Math.random()*questionMessage.length)];
                                          }

                                          //Ottengo tutte le diete create
                                          const dietRef = db.collection('diets');
                                          dietRef.get().then(function(querySnapshot) {
                                              querySnapshot.forEach(function(doc) {
                                                  //Controllo che l'utente abbia configurato l'accesso al bot telegram
                                                  if (doc.data().telegram_chat_id !== "") {
                                                      //Controllo che l'utente non abbia già registrato la fascia oraria in precedenza
                                                      if(doc.data().fascia_oraria_cena === ""){
                                                          const MESSAGE = getQuestionMealMessage(doc.data().nome_paziente, "ceni") + "\nQuesta informazione mi consentirà di aiutarti al meglio con la tua dieta 😉";
                                                          const body = { "reply_markup": { "inline_keyboard":
                                                                      [
                                                                          [{"text": "🕙 19:00 - 20:00", "callback_data": "La fascia oraria per la cena è 19/20"}, {"text": "🕛 20:00 - 21:00", "callback_data": "La fascia oraria per la cena è 20/21"}],
                                                                          [{"text": "🕐 21:00 - 22:00", "callback_data": "La fascia oraria per la cena è 21/22"}, {"text": "🕒 22:00 - 23:00", "callback_data": "La fascia oraria per la cena è 22/23"}],
                                                                          [{"text": "🤔 Non saprei dirti", "callback_data": "Non saprei dirti la fascia oraria al momento"}],
                                                                          [{"text": "🤐 Non voglio dirtelo", "callback_data": "La fascia oraria per il pranzo è 0/0"}],

                                                                      ]}};
                                                          if ( doc.data().telegram_chat_id !== '') {
                                                              console.log("MESSAGGIO INVIATO:",doc.data().telegram_chat_id);
                                                              axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                          }
                                                      }
                                                  }
                                              });
                                          }).then(() => {
                                              return Promise.resolve('Read complete');
                                          }).catch(err => {
                                              console.log(ERROR + ": => " + err);
                                          });
                                      });

/*
 Funzione che si occupa di ricordare al paziente l'incombenza della cena così da spronarlo a non sgarrare
 Viene richiamata ogni giorno alle 18.42, 19.42, 20.42, 21.42
 Offre al paziente la possibilità di richiamare, attraverso pulsanti, le funzioni:
 - Dieta.Visualizza.Giorno
 - Sostituzione
 - Dieta.Pasto.Preparazione
 - Notifiche.Disattiva
 */
exports.reminderPastoCena = functions.pubsub.schedule('42 18,19,20,21 * * *')
                                     .timeZone('Europe/Rome')
                                     .onRun((context) => {

                                         function getReminderDinnerMessage() {
                                             const reminderDinnerMessage = [
                                                 `È quasi l'ora della cena! 🍽️ Non mollare proprio adesso 💪`,
                                                 `L'ora della cena si avvicina 🍽️, non mollare proprio adesso 💪`,
                                                 `Si avvicina l'ora della cena 🍽️, non mollare proprio adesso 💪`,
                                             ];

                                             //Seleziono randomicamente una risposta nell'array
                                             return reminderDinnerMessage[Math.floor(Math.random()*reminderDinnerMessage.length)];
                                         }
                                         const d = new Date();
                                         //Determino l'ora corrente aumentata di un'ora
                                         //getHours() determina l'ora corrente - 1
                                         let oraCorrente = d.getHours() + 2;
                                         let fasciaOraria = oraCorrente + "/" + (oraCorrente + 1);

                                         //Ottengo tutte le diete create
                                         const dietRef = db.collection('diets');
                                         dietRef.get().then(function(querySnapshot) {
                                             querySnapshot.forEach(function(doc) {
                                                 //Controllo che l'utente abbia configurato l'accesso al bot telegram e voglia ricevere notifiche
                                                 if (doc.data().telegram_chat_id !== "" && doc.data().telegram_alerts === true) {
                                                     //Controllo che l'utente abbia già registrato la fascia oraria e che sia la fascia oraria selezionata
                                                     if(doc.data().fascia_oraria_cena !== "" && doc.data().fascia_oraria_cena === fasciaOraria){
                                                         const MESSAGE = getReminderDinnerMessage();
                                                         const body = { "reply_markup": { "inline_keyboard":
                                                                     [
                                                                         [{"text": "🍳 Consulta Cena", "callback_data": "cosa mangio oggi a cena"},{"text": "🍽️ Consulta Dieta", "callback_data": "Consulta dieta completa" }],
                                                                         [{"text": "⏲ Preparazione Cena", "callback_data": "non so come preparare la cena di oggi"}],
                                                                     ]}};
                                                         if ( doc.data().telegram_chat_id !== '') {
                                                             console.log("MESSAGGIO INVIATO:",doc.data().telegram_chat_id);
                                                             axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                         }
                                                     }
                                                 }
                                             });
                                         }).then(() => {
                                             return Promise.resolve('Read complete');
                                         }).catch(err => {
                                             console.log(ERROR + ": => " + err);
                                         });
                                     });

/*
 Funzione che si occupa di fornire al paziente un messaggio motivazionale e d'incentivare la segnalazione di problemi/migliorie (feedback utente)
 Viene richiamata ogni Lunedì, Venerdì alle 17:00
 Offre al paziente la possibilità di richiamare, attraverso pulsanti, le funzioni:
 - RegistraFeedback.Problema
 - TuttoBene
 - Notifiche.Disattiva
 */
exports.reminderMotivazionaleFeedback = functions.pubsub.schedule('0 17 * * 1,5')
                                                 .timeZone('Europe/Rome')
                                                 .onRun((context) => {
                                                     //Ottengo tutte le diete create
                                                     const dietRef = db.collection('diets');
                                                     dietRef.get().then(function(querySnapshot) {
                                                         querySnapshot.forEach(function(doc) {
                                                             //Controllo che l'utente abbia configurato l'accesso al bot telegram e voglia ricevere notifiche
                                                             if (doc.data().telegram_chat_id !== "" && doc.data().telegram_alerts === true) {
                                                                 const MESSAGE = `Stai facendo un ottimo lavoro ${doc.data().nome_paziente}! 😊, continuando così raggiungerai presto i tuoi obiettivi 💪.\nRicordati che sono sempre qui pronto ad offrirti supporto e sentiti sempre libero di suggerirmi qualcosa o di segnalarmi un problema con la tua dieta 🆘`;
                                                                 const body = { "reply_markup": { "inline_keyboard": [
                                                                             [{ "text": "🆘 Segnala Problema o Suggerimento", "callback_data": "Voglio segnalare un problema o un suggerimento" }],
                                                                             [{ "text": "👌 Va tutto bene", "callback_data": "nessun problema da segnalare" }],
                                                                             [{ "text": "🔕 Disattiva Consigli", "callback_data": "disattiva notifiche" }]
                                                                         ]}};
                                                                 if ( doc.data().telegram_chat_id !== '') {
                                                                     console.log("MESSAGGIO INVIATO:",doc.data().telegram_chat_id);
                                                                     axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                                 }
                                                             }
                                                         });
                                                     }).then(() => {
                                                         return Promise.resolve('Read complete');
                                                     }).catch(err => {
                                                         console.log(ERROR + ": => " + err);
                                                     });
                                                 });


/*
 Funzione che si occupa di fornire al paziente un messaggio motivazionale in vista del weekend con lo
 scopo di mantenere l'umore dell'utente sempre alto
 Viene richiamata ogni Sabato alle 12:00
 Offre al paziente la possibilità di richiamare, attraverso pulsanti, le funzioni:
 - UmoreBasso
 - TuttoBene
 - Notifiche.Disattiva
 */
exports.reminderMotivazionaleWeekend =
    functions.pubsub.schedule('0 12 * * 6')
             .timeZone('Europe/Rome')
             .onRun((context) => {
                 //Ottengo tutte le diete create
                 const dietRef = db.collection('diets');
                 dietRef.get().then(function(querySnapshot) {
                     querySnapshot.forEach(function(doc) {
                         //Controllo che l'utente abbia configurato l'accesso al chatbot telegram e voglia ricevere notifiche
                         if (doc.data().telegram_chat_id !== "" && doc.data().telegram_alerts === true) {
                             const MESSAGE = `Un'altra settimana sta giungendo al termine ${doc.data().nome_paziente} 😊, tieni duro e non mollare 💪.\n
                             Approfitta per recuperare un po' le energie dato che Lunedì bisognerà ripartire più carichi che mai!\n
                             Ricordati che faccio sempre il tifo per te 🏆`;
                             const body = { "reply_markup": { "inline_keyboard": [
                                         [{ "text": "😔 Mi sento un po' giù", "callback_data": "umore basso" }],
                                         [{ "text": "🤩 Non vedo l'ora", "callback_data": "va alla grande" }],
                                         [{ "text": "🔕 Disattiva Consigli", "callback_data": "disattiva notifiche" }]
                                     ]}};
                             if ( doc.data().telegram_chat_id !== '') {
                                 console.log("MESSAGGIO INVIATO:",doc.data().telegram_chat_id);
                                 axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=
                                 ${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                             }
                         }
                     });
                 }).then(() => {
                     return Promise.resolve('Read complete');
                 }).catch(err => {
                     console.log(ERROR + ": => " + err);
                 });
             });

/*
 Funzione che si occupa di fornire al paziente curiosità o spunti di approfondimento riguardo ciò
 che dovrebbe rappresentare una corretta e sana alimentazione
 Viene richiamata ogni Domenica alle 17:00
 Offre al paziente la possibilità di richiamare, attraverso pulsanti, le funzioni:
 - Approfondisci
 */
exports.reminderCuriosita = functions.pubsub.schedule('0 17 * * 0')
                                     .timeZone('Europe/Rome')
                                     .onRun((context) => {
                                         const curiosita = [
                                             {text:"Secondo il trend ‘Breakslow’ mangiare bene, lentamente e in compagnia aiuta ad essere felici. 😃", website:"https://www.starbene.it/alimentazione/mangiare-sano/breakslow-colazione-felicita/"},
                                             {text:"Lo sapevi che le arance non sono i cibi con più vitamina C? 🍊 In realtà, contengono bassi livelli di vitamina C, soprattutto se paragonate ad altri tipi di frutta e verdura. 🥦", website:"https://www.finedininglovers.it/articolo/arance-vitamina-c"},
                                             {text:"I latticini, oltre a far parte di una dieta equilibrata, migliorano la salute dei denti aiutando a mineralizzare il loro smalto. 🥛", website:"https://www.lapecorella.it/2021/07/09/proteggere-i-denti-con-il-latte/"},
                                             {text:"Lo sapevi che i latticini non sono gli unici alimenti ricchi di calcio? 🥛 Tra questi ci sono spinaci, cipolle, broccoli, legumi, noci, yogurt, formaggio, uova, sardine e frutti di mare.", website:"https://www.melarossa.it/nutrizione/mangiare-sano/scopri-gli-alimenti-ricchi-di-calcio-da-assumere-se-non-bevi-latte/"},
                                             {text:"Lo sapevi che esistono grassi buoni? 🥑 Non tutti i grassi sono nocivi per il nostro fisico. I grassi insaturi sono sani e riducono il colesterolo cattivo, quindi il loro consumo è altamente raccomandato. Sono presenti in alimenti come salmone, tonno, avocado, noci, mandorle, pistacchi, sesamo e olio d'oliva.", website:"https://www.my-personaltrainer.it/alimentazione/grassi-buoni-grassi-cattivi.html"},
                                             {text:"Lo sapevi che potresti utilizzare del cioccolato per svegliarti? 🍫 Anche se in una concentrazione inferiore rispetto al caffè o al tè nero, contiene caffeina, quindi può essere usato come perfetto stimolante e come deliziosa alternativa.", website:"https://www.my-personaltrainer.it/benessere/caffeina-alimenti.html"},
                                             {text:"Lo sapevi che non bisogna buttare via il liquido dello yogurt? 🥛 È composto da acqua e sali minerali ed è ricco di calcio e fosforo. Meglio mangiarlo tutto!", website:"https://www.bigodino.it/benessere/buttare-il-liquido-che-si-forma-sulla-superficie-dello-yogurt-e-un-grave-errore.html"},
                                             {text:"Lo sapevi che le spezie sono ricche di ferro? 🍃 Timo, cumino, aneto, origano, alloro, basilico, cannella in polvere... Aggiungili alle tue ricette!", website:"https://www.proiezionidiborsa.it/non-solo-carne-ma-anche-queste-spezie-e-aromi-insospettabili-contengono-tanto-ferro-e-chi-ha-lanemia-dovrebbe-provarli/"},
                                             {text:"Lo sapevi che il tè verde potrebbe aiutarti con la digestione? 🫖 Sono di grande aiuto per chi soffre di Ipertensione", website:"https://www.my-personaltrainer.it/alimentazione/ipertensione-10-erbe-aromatiche-e-spezie-che-abbassano-la-pressione.html"},
                                             {text:"Lo sapevi che è meglio consumare la frutta al naturale e intera? 🍎 Quando sbucciamo o tagliamo i frutti, cambiamo le loro proprietà. ", website:"https://www.olivierinutrizione.it/meglio-mangiare-la-frutta-intera/"},
                                             {text:"Lo sapevi che mandorle e nocciole aiutano ad illuminare la pelle? 🌰 Contengono vitamina E che è un grande alleato per prendersi cura della propria pelle.", website:"https://www.pepinoshop.com/blog/bellezza/gli-alimenti-per-una-pelle-sempre-giovane-e-luminosa-20"},
                                             {text:"Lo sapevi che molto spesso snack alla frutta in realtà non ne contengono neanche un po'? 🧃 Molto spesso l'unica traccia del frutto è solo il sapore che però è dato quasi esclusivamente da aromatizzanti artificiali.", website:"https://www.italiasalute.it/8750/Snack-alla-frutta-in-realtà-non-ne-contengono.html"},
                                             {text:"Lo sapevi che i semi di papavero aiutano a contrastare lo stress? 🥛 Prova a metterne un po' sul tuo yogurt. ", website:"https://blog.giallozafferano.it/amicoorsocafe/semi-di-papavero/"},
                                             {text:"Lo sapevi che l'avocado è un ottimo sostituto del burro? 🥑 Usa una piccola quantità e potrai preparare le tue ricette in modo più sano.", website:"https://www.innaturale.com/come-usare-avocado-al-posto-del-burro/"},
                                             {text:"Lo sapevi che mangiare lentamente aiuta ad essere felici? 🍽️ Oltre ad evitare una cattiva digestione, mangiare più lentamente aiuta a liberarsi dallo stress e permette di non mangire eccessivamente.", website:"https://www.nonsprecare.it/benefici-del-mangiare-lentamente"},
                                             {text:"Lo sapevi che il miele può riempirti di energia? 🍯 Se sei alla ricerca di una sana alternativa allo zucchero da tavola, il miele è un'ottima opzione. ", website:"https://www.gazzetta.it/alimentazione/news/30-05-2018/il-miele-una-ricarica-di-energia-per-il-giusto-sprint-42555/"},
                                         ];

                                         //Ottengo tutte le diete create
                                         const dietRef = db.collection('diets');
                                         dietRef.get().then(function(querySnapshot) {
                                             querySnapshot.forEach(function(doc) {
                                                 //Controllo che l'utente abbia configurato l'accesso al bot telegram e voglia ricevere notifiche
                                                 if (doc.data().telegram_chat_id !== "") {
                                                     const index = Math.floor(Math.random()*curiosita.length);
                                                     const MESSAGE = `Ti svelo una curiosità! 😉🎁\n` + curiosita[index].text + "\nTi andrebbe di approfondire l'argomento? 😊";
                                                     const body = { "reply_markup": { "inline_keyboard": [
                                                                 [{ "text": "Approfondisci 🔎", "url": curiosita[index].website }],
                                                                 [{ "text": "Lo sapevo! 🤩", "callback_data": "Lo sapevo già!" }],
                                                             ]}};
                                                     if ( doc.data().telegram_chat_id !== '') {
                                                         console.log("MESSAGGIO INVIATO:",doc.data().telegram_chat_id);
                                                         axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                     }
                                                 }
                                             });
                                         }).then(() => {
                                             return Promise.resolve('Read complete');
                                         }).catch(err => {
                                             console.log(ERROR + ": => " + err);
                                         });
                                     });

/*
 Funzione che si occupa di raccogliere informazioni relative al consumo giornaliero dell'acqua
 Viene richiamata ogni giorno alle 21.30
 Offre al paziente la possibilità di richiamare, attraverso pulsanti, le funzioni:
 - Set di Opzioni consumo acqua
 - Non saprei
 - Non voglio dirlo
 */
exports.reminderConsumoAcqua = functions.pubsub.schedule('30 21 * * *')
                                        .timeZone('Europe/Rome')
                                        .onRun((context) => {

                                            function getQuestionMealMessage(nomePaziente) {
                                                const dailyWelcomeMessage = [
                                                    `Ciao ${nomePaziente}! 😃`,
                                                    `Hei ${nomePaziente}! 😃`,
                                                    `Buonasera ${nomePaziente}! 😃`,
                                                    `Salve ${nomePaziente}! 😃`,
                                                ];
                                                //Set di frasi per il consumo di acqua
                                                const questionMessage = [
                                                    `Assumere regolarmente acqua è molto importante per il tuo corpo 💦\nQuanto pensi di aver bevuto oggi? 🚰`,
                                                ];
                                                //Seleziono randomicamente una risposta nell'array
                                                return dailyWelcomeMessage[Math.floor(Math.random()*dailyWelcomeMessage.length)] + ",\n" + questionMessage[Math.floor(Math.random()*questionMessage.length)];
                                            }

                                            //Calcolo la data corrente da mezzanotte
                                            let currentDate = new Date(Date.now());
                                            currentDate.setHours(0,0,0,0);
                                            //Ottengo tutte le diete create
                                            const dietRef = db.collection('diets');
                                            dietRef.get().then(function(querySnapshot) {
                                                querySnapshot.forEach(function(doc) {
                                                    //Controllo che l'utente abbia configurato l'accesso al bot telegram
                                                    if (doc.data().telegram_chat_id !== "") {
                                                        //Controllo che l'utente voglia registrare il consumo d'acqua giornaliero
                                                        if(doc.data().telegram_alerts_acqua === true){
                                                            //Controllo che l'utente non abbia già registrato il consumo d'acqua giornaliero
                                                            //Ottengo i consumi d'acqua registrati il giorno corrente
                                                            let consumoAcquaRef = db.collection("diets").doc(doc.id).collection('consumoAcqua');
                                                            consumoAcquaRef.where('timestamp', '>=', currentDate).get().then(function (acquaSnapshot) {
                                                                if (acquaSnapshot.empty) {
                                                                    const MESSAGE = getQuestionMealMessage(doc.data().nome_paziente);
                                                                    const body = { "reply_markup": { "inline_keyboard":
                                                                                [
                                                                                    [{"text": "💧 0.5 Litri", "callback_data": "Il consumo giornaliero di acqua per oggi è stato di 0.5 litri"}, {"text": "💧 1 Litri", "callback_data": "Il consumo giornaliero di acqua per oggi è stato di 1 litri"}],
                                                                                    [{"text": "💧 1.5 Litri", "callback_data": "Il consumo giornaliero di acqua per oggi è stato di 1.5 litri"}, {"text": "💧 2 o più Litri", "callback_data": "Il consumo giornaliero di acqua per oggi è stato di 2 litri"}],
                                                                                    [{"text": "🤔 Non saprei", "callback_data": "non conosco la risposta al momento"}],
                                                                                    [{"text": "🤐 Non chiedermelo più", "callback_data": "disattiva avvisi consumo acqua giornaliero"}],
                                                                                ]}};
                                                                    if ( doc.data().telegram_chat_id !== '') {
                                                                        console.log("MESSAGGIO INVIATO:",doc.data().telegram_chat_id);
                                                                        axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                            }).then(() => {
                                                return Promise.resolve('Read complete');
                                            }).catch(err => {
                                                console.log(ERROR + ": => " + err);
                                            });
                                        });

/*
 Funzione che si occupa di raccogliere il feedback dell'utente a fine giornata (feedback utente)
 Viene richiamata ogni giorno alle 22:00
 */
exports.reminderAndamentoGiornata = functions.pubsub.schedule('0 22 * * *')
                                             .timeZone('Europe/Rome')
                                             .onRun((context) => {
                                                 function getQuestionMessage(nomePaziente) {
                                                     const dailyWelcomeMessage = [
                                                         `Ciao ${nomePaziente}! 😃`,
                                                         `Hei ${nomePaziente}! 😃`,
                                                         `Buonasera ${nomePaziente}! 😃`,
                                                         `Salve ${nomePaziente}! 😃`,
                                                     ];
                                                     //Set di frasi per il consumo di acqua
                                                     const questionMessage = [
                                                         "Com'è andata la tua giornata? 🫶🏻",
                                                         "Com'è stata la tua giornata? 🫶🏻",
                                                         "Hai avuto una buona giornata? 🫶🏻",
                                                         "Com'è stata la tua giornata in generale? 🫶🏻",
                                                         "Come ti sei sentito oggi? 🫶🏻",
                                                         "Com'è stato il tuo umore oggi? 🫶🏻",
                                                         "Ti sei sentito bene oggi? 🫶🏻",
                                                         "Com'è stato il tuo stato d'animo durante la giornata? 🫶🏻",
                                                         "Sei stato di buon umore oggi? 🫶🏻",
                                                     ];
                                                     //Seleziono randomicamente una risposta nell'array
                                                     return dailyWelcomeMessage[Math.floor(Math.random()*dailyWelcomeMessage.length)] + ",\n" + questionMessage[Math.floor(Math.random()*questionMessage.length)];
                                                 }
                                                 //Ottengo tutte le diete create
                                                 const dietRef = db.collection('diets');
                                                 dietRef.get().then(function(querySnapshot) {
                                                     querySnapshot.forEach(function(doc) {
                                                         //Controllo che l'utente abbia configurato l'accesso al bot telegram
                                                         if (doc.data().telegram_chat_id !== "") {
                                                             const MESSAGE = getQuestionMessage(doc.data().nome_paziente);
                                                             const body = { "reply_markup": { "inline_keyboard": [
                                                                         [{ "text": "👎", "callback_data": "La mia giornata non è andata molto bene, posso dirti il motivo?" },{ "text": "😐", "callback_data": "La mia giornata è andata normalmente" },{ "text": "👍", "callback_data": "la giornata è andata davvero bene" }],
                                                                     ]}};
                                                             if ( doc.data().telegram_chat_id !== '') {
                                                                 console.log("MESSAGGIO INVIATO:",doc.data().telegram_chat_id);
                                                                 axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data:body});
                                                             }
                                                         }
                                                     });
                                                 }).then(() => {
                                                     return Promise.resolve('Read complete');
                                                 }).catch(err => {
                                                     console.log(ERROR + ": => " + err);
                                                 });
                                             });



//Funzione che si occupa di aggiornare il bot
/*exports.aggiornamentoBot = functions.pubsub.schedule("43 9 * * *")
 .timeZone("Europe/Rome")
 .onRun((context) => {
 //Ottengo tutte le diete create
 const dietRef = db.collection("diets");
 dietRef.get().then(function (querySnapshot) {
 querySnapshot.forEach(function (doc) {
 //Controllo che l'utente abbia configurato l'accesso al bot telegram e voglia ricevere notifiche
 if (doc.data().telegram_chat_id !== "") {
 const MESSAGE = `Ciao ${doc.data().nome_paziente} 😊, ho applicato diversi miglioramenti al tracciamento del consumo d'acqua giornaliero ⚙️.\nDa oggi potrai:\n
 - Gestire la tua lista della spesa 🛒
 Prova a chiedermi "Mostrami la lista della spesa" `;
 const body = {
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
 if (doc.data().telegram_chat_id !== "") {
 axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${doc.data().telegram_chat_id}&text=${encodeURIComponent(MESSAGE)}`, {data: body});
 }
 }
 });
 }).then(() => {
 return Promise.resolve("Read complete");
 }).catch(err => {
 console.log(ERROR + ": => " + err);
 });
 });*/
