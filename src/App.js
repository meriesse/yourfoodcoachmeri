import React, {lazy, Suspense, useEffect, useState} from "react";
import "./index.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import * as PropTypes from "prop-types";
import LandingPage from "./Components/WebsiteLogic/LandingPage";
import {Header} from "./Components/WebsiteLogic/Header.js";
import {Footer} from "./Components/WebsiteLogic/Footer.js";
import {AuthProvider} from "./context/AuthContext.js";
import PrivateRoutes from "./Components/WebsiteLogic/PrivateRoutes";
import PublicRoutes from "./Components/WebsiteLogic/PublicRoutes";
import useWindowSize from "./Components/Utilities/WindowDimensions";
import Spinner from "./Components/Utilities/Spinner";
import Dashboard from "./Components/WebsiteLogic/Dashboard";

const About = lazy(() => import("./Components/WebsiteLogic/About"));
const Login = lazy(() => import("./Components/Authentication/Login.js"));
const SignUp = lazy(() => import("./Components/Authentication/SignUp.js"));
const AccountRole = lazy(() => import("./Components/Authentication/AccountRole.js"));
const ForgotPassword = lazy(() => import("./Components/Authentication/ForgotPassword.js"));
const Account = lazy(() => import("./Components/Profile/Account"));
const UpdateProfile = lazy(() => import("./Components/Profile/UpdateProfile.js"));
const NewDiet = lazy(() => import("./Components/Diet/NewDiet"));
const ShowDiets = lazy(() => import("./Components/Diet/ShowDiets"));
const ShowDiet = lazy(() => import("./Components/Diet/ShowDiet"));
const ShowMeals = lazy(() => import("./Components/Meals/ShowMeals"));
const NewMeal = lazy(() => import("./Components/Meals/NewMeal"));
const ShowMeal = lazy(() => import("./Components/Meals/ShowMeal"));
const MealAnalysis = lazy(() => import("./Components/Meals/MealAnalysis"));
const ShowPatientsProgress = lazy(() => import("./Components/Progress/ShowPatients"));
const ShowProgress = lazy(() => import("./Components/Progress/ShowProgress"));
const ShowPatientsFeedback = lazy(() => import("./Components/Feedback/ShowPatients"));
const ShowFeedback = lazy(() => import("./Components/Feedback/ShowFeedback"));
const InformativaPrivacy = lazy(() => import("./Components/WebsiteLogic/PrivacyPolicy"));
const Diary = lazy(() => import("./Components/Diary/ShowDiary"));
const ShowPatients = lazy(() => import("./Components/Patient/ShowPatients"));
const NewPatient = lazy(() => import("./Components/Patient/NewPatient"));

Header.propTypes = {expand: PropTypes.string};

function App() {
    const size = useWindowSize();
    //Nome dell'utente loggato
    const [userName, setUserName] = useState("");
    const [height, setHeight] = useState("");

    useEffect(() => {
        //Controllo che ci sia un utente loggato nel localStorage
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            //Imposto il nome dell'utente così che possa essere visibile nell'header
            setUserName(loggedInUser);
        }
    }, []);

    //Determino l'height minima della pagina in base al dispositivo in uso
    useEffect(() => {
        const height = 380 * size.width / size.height;
        setHeight(height <= 820 ? 820 : height);
    }, [size]);

    return (
        <>
        <AuthProvider>
                <Suspense fallback={<Spinner/>}>
                    <BrowserRouter>
                        {/* Header*/}
                        {["md"].map((expand) => (
                            <Header key={expand}
                                    user={userName}
                                    expand={expand}/>
                        ))}
                        <div style={{minHeight: height}}>
                            <Routes>
                                {/* Rotte che devono essere accessibili da tutti gli utenti*/}
                                <Route path="/"
                                       element={<LandingPage/>}/>
                                <Route path="/chi-siamo"
                                       element={<About/>}/>
                                <Route path="/informativa-privacy"
                                       element={<InformativaPrivacy/>}/>
                                {/* Rotte che devono essere accessibili solo da utenti autenticati*/}
                                <Route element={<PrivateRoutes/>}>
                                    <Route path="/dashboard"
                                           element={<Dashboard/>}/>
                                    <Route path="/account"
                                           element={<Account/>}/>
                                    <Route path="/aggiorna-account"
                                           element={<UpdateProfile/>}/>
                                    <Route path="/nuova-dieta"
                                           element={<NewDiet/>}/>
                                    <Route path="/diete"
                                           element={<ShowDiets/>}/>
                                    <Route path="/dieta/:id"
                                           element={<ShowDiet/>}/>
                                    <Route path="/progressi-pazienti"
                                           element={<ShowPatientsProgress/>}/>
                                    <Route path="/progressi-paziente/:id"
                                           element={<ShowProgress/>}/>
                                    <Route path="/feedback-pazienti"
                                           element={<ShowPatientsFeedback/>}/>
                                    <Route path="/feedback-paziente/:id"
                                           element={<ShowFeedback/>}/>
                                    <Route path="/pasti"
                                           element={<ShowMeals/>}/>
                                    <Route path="/pasto/:id"
                                           element={<ShowMeal/>}/>
                                    <Route path="/crea-pasto"
                                           element={<NewMeal/>}/>
                                    <Route path="/analizza-pasto"
                                           element={<MealAnalysis/>}/>
                                    <Route path="/diario-alimentare/:id"
                                           element={<Diary/>}/>
                                   <Route path="/inserisci-paziente"
                                           element={<NewPatient/>}/> 
                                   <Route path="/tutti-pazienti"
                                           element={<ShowPatients/>}/>    
                                </Route>
                                {/* Rotte che non devono essere accessibili da utenti autenticati*/}
                                <Route element={<PublicRoutes/>}>
                                    <Route path="/signup"
                                           element={<AccountRole/>}/>
                                    <Route path="/signup/:ruolo"
                                           element={<SignUp/>}/>
                                    <Route path="/login"
                                           element={<Login/>}/>
                                    <Route path="/password-dimenticata"
                                           element={<ForgotPassword/>}/>
                                </Route>
                                <Route path={"*"}
                                       element={<LandingPage/>}/>
                            </Routes>
                        </div>
                        <Footer/>
                    </BrowserRouter>
                </Suspense>
            </AuthProvider>
        </>
    );
}

export default App;
