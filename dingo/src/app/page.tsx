"use client";
import { useState, useEffect } from "react";
import GoogleComponents from "./components/GoogleComponents";

export default function Home() {
    const [GoogleAPIKey, setGoogleAPIKey] = useState<string | null>(null);
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            window.localStorage &&
            !GoogleAPIKey
        ) {
            const storedAPIKey = localStorage.getItem("Google-API-Key");
            if (storedAPIKey) {
                console.log("FOUND STORED KEY:" + storedAPIKey);
                setGoogleAPIKey(storedAPIKey);
            }
        }
    }, []);

    return (
        <div>
            {GoogleAPIKey ? (
               <GoogleComponents GoogleAPIKey={GoogleAPIKey}/>
            ) : (
                <main>hi hi hi hi hi</main>
            )}
        </div>
    );
}
