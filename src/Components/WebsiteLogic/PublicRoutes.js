import React from "react";
import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.js";

const PublicRoutes = () => {
    const {currentUser} = useAuth();
    return (
        //L'utente autenticato viene indirizzato alla dashboard se prova ad accedere a pagine
        //che non dovrebbero essere accessibili da un utente autenticato
        currentUser ? <Navigate to="/dashboard"/> : <Outlet/>
    );
};

export default PublicRoutes;