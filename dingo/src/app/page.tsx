"use client";
import { useState, useEffect } from "react";
import GoogleComponents from "./components/GoogleComponents";

export default function Home() {
    const [GoogleAPIKey, setGoogleAPIKey] = useState<string | null>(null);
    useEffect(() => {
        if (typeof window !== "undefined" && window.localStorage) {
            const storedAPIKey = localStorage.getItem("Google-API-Key");
            setGoogleAPIKey(storedAPIKey ?? "");
        }
    }, []);

    console.log(GoogleAPIKey);

    return (
        <div>
            {GoogleAPIKey !== null ? ( // We know here that we have fetched the API key from localstorage. If it exists.
                <GoogleComponents googleAPIKey={GoogleAPIKey} />
            ) : (
                <></>
            )}
        </div>
    );
}
