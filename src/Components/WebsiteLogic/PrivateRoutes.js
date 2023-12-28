import React from "react";
import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.js";

const PrivateRoutes = () => {
    const {currentUser} = useAuth();
    return (
        //L'utente viene indirizzato alla pagina che permette il login in corrispondenza di
        // pagine che prevedono l'autenticazione per essere visualizzate
        currentUser ? <Outlet/> : <Navigate to="/login"/>
    );
};

export default PrivateRoutes;