import {useEffect, useState} from "react";

/*
 Componente che si occupa di calcolare dinamicamente le dimensioni della pagina web a
 seconda del dispositivo utilizzato
 */
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            function handleResize() {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }

            // Aggiungo Listner evento
            window.addEventListener("resize", handleResize);

            handleResize();

            //Rimuovo il listner
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);
    return windowSize;
};

export default useWindowSize;