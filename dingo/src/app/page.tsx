"use client";
import { useRef, useState, useEffect } from "react";
import Locations from "./components/Locations";
import FilterComponent from "./components/Filters";
import GoogleMaps from "./components/GoogleMaps";
import Places from "./components/Places";
import { useLoadScript, Libraries } from "@react-google-maps/api";
import { GiPathDistance } from "react-icons/gi";
import { BiTimeFive } from "react-icons/bi";
import { SiGooglemaps } from "react-icons/si";
import mapUtil from "../../script/mapUtil";

const placesLibrary: Libraries = ["places"];

export default function Home() {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API ?? "",
        libraries: placesLibrary,
    });
    const [startLocation, setStartLocation] =
        useState<google.maps.places.Autocomplete | null>(null);
    const [endLocation, setEndLocation] =
        useState<google.maps.places.Autocomplete | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [startEndMarkers, setStartEndMarkers] = useState<
        google.maps.LatLngLiteral[]
    >([]);
    const [waypointMarkers, setWaypointMarkers] = useState<
        google.maps.LatLngLiteral[]
    >([]);
    const [waypointPlaces, setWaypointPlaces] = useState<any>([]);
    const [route, setRoute] = useState<any>(null);
    const [distance, setDistance] = useState<any>(null); // text and value
    const [duration, setDuration] = useState<any>(null); // text and value
    const [selectedMarker, setSelectedMarker] = useState<any>(null);
    const placesRef = useRef<any>(null);

    useEffect(() => {
        const getNearbyPlaces = async () => {
            if (distance && duration && route && map) {
                const { waypointMarkers, waypointPlaces } =
                    await mapUtil.getNearbyPlaces(route, map, 2000);
                setWaypointMarkers(waypointMarkers);
                setWaypointPlaces(waypointPlaces);
            }
        };
        getNearbyPlaces();
    }, [distance, duration, route]);

    useEffect(() => {
        if (placesRef && waypointPlaces.length > 0) {
            placesRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [waypointPlaces]);

    const handleLocations = async () => {
        if (!startLocation || !endLocation || !map) {
            return;
        }
        const startPlace = startLocation.getPlace();
        const endPlace = endLocation.getPlace();
        const startPlaceLat = startPlace.geometry?.location?.lat();
        const startPlaceLng = startPlace.geometry?.location?.lng();
        const endPlaceLat = endPlace.geometry?.location?.lat();
        const endPlaceLng = endPlace.geometry?.location?.lng();

        if (!startPlaceLat || !startPlaceLng || !endPlaceLat || !endPlaceLng) {
            return;
        }

        const route = await mapUtil.getRoute(startLocation, endLocation);
        const distance = route?.routes[0].legs[0].distance;
        const duration = route?.routes[0].legs[0].duration;
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: startPlaceLat, lng: startPlaceLng });
        bounds.extend({ lat: endPlaceLat, lng: endPlaceLng });
        map.fitBounds(bounds);
        setMap(map);
        setDistance(distance);
        setDuration(duration);
        setRoute(route);
        setStartEndMarkers([
            { lat: startPlaceLat, lng: startPlaceLng },
            { lat: endPlaceLat, lng: endPlaceLng },
        ]);
    };

    return (
        <main>
            {/* Greeting page */}
            <section className="flex min-h-screen flex-col items-center justify-between py-24">
                <div>
                    <h1 className="font-semibold text-7xl text-green-400">
                        Dingo
                    </h1>
                    <h2 className="font-semibold text-xs pl-1">
                        Dine on the go.
                    </h2>
                </div>
                <Locations
                    startLocation={startLocation}
                    endLocation={endLocation}
                    setStartLocation={setStartLocation}
                    setEndLocation={setEndLocation}
                    isLoaded={isLoaded}
                ></Locations>
                {/* <FilterComponent filters={["Asian", "Western"]}/> */}
                <div>
                    <button
                        className="bg-green-400 p-2 px-5 rounded-full animate-bounce text-xl font-semibold"
                        onClick={handleLocations}
                    >
                        Go!
                    </button>
                </div>
            </section>
            <section className="flex flex-col items-center justify-center">
                <section
                    className={`flex flex-col items-center justify-center max-h-[25vh] ${
                        startEndMarkers.length > 0 ? "" : "hidden"
                    }`}
                >
                    <GoogleMaps
                        isLoaded={isLoaded}
                        startEndMarkers={startEndMarkers}
                        setMap={setMap}
                        map={map}
                        route={route}
                        waypointMarkers={waypointMarkers}
                        selectedMarker={selectedMarker}
                    />
                </section>
                {waypointPlaces.length > 0 && (
                    <section
                        className="flex flex-col items-center justify-center max-h-[75vh]"
                        ref={placesRef}
                    >
                        {/* <div>{startLocation.getPlace().formatted_address}</div> */}
                        <div className="flex mt-4">
                            <div className="flex items-center text-xs">
                                <GiPathDistance size={20} className="mx-2" />
                                {distance.text}
                            </div>
                            <div className="flex items-center text-xs">
                                <BiTimeFive size={20} className="mx-2" />
                                {duration.text}
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <SiGooglemaps />
                            <div className="font-bold text-green-500 mx-2">
                                {waypointPlaces.length}
                            </div>
                            <div>locations found.</div>
                        </div>

                        {/* <div>{endLocation.getPlace().formatted_address}</div> */}
                        <Places
                            places={waypointPlaces}
                            map={map}
                            selectedMarker={selectedMarker}
                            setSelectedMarker={setSelectedMarker}
                        />
                    </section>
                )}
            </section>
        </main>
    );
}
