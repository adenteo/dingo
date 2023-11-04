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

const placesLibrary: Libraries = ["places"];

const removeDuplicatePlaceIds = (array: any) => {
    const uniquePlaceIds = new Set<string>();
    const uniqueObjects = array.filter((place: any) => {
        if (!uniquePlaceIds.has(place.place_id)) {
            uniquePlaceIds.add(place.place_id);
            return true;
        }
        return false;
    });

    return Array.from(uniqueObjects);
};

export default function Home() {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API ?? "",
        libraries: placesLibrary,
    });
    const [startLocation, setStartLocation] = useState<any>("");
    const [endLocation, setEndLocation] = useState<any>("");
    const [map, setMap] = useState<any>(null);
    const [startEndMarkers, setStartEndMarkers] = useState<any>([]);
    const [waypointMarkers, setWaypointMarkers] = useState<any>([]);
    const [waypointPlaces, setWaypointPlaces] = useState<any>([]);
    const [route, setRoute] = useState<any>(null);
    const [distance, setDistance] = useState<any>(null); // text and value
    const [duration, setDuration] = useState<any>(null); // text and value
    const [selectedMarker, setSelectedMarker] = useState<any>(null);
    const placesRef = useRef<any>(null);

    useEffect(() => {
        if (distance !== null && duration !== null && route !== null) {
            getNearbyPlaces(route);
        }
    }, [distance, duration, route]);

    useEffect(() => {
      if (placesRef && waypointPlaces.length > 0) {
        placesRef.current.scrollIntoView({ behavior: "smooth" });
    }
    }, [waypointPlaces])

    const getNearbyPlaces = async (route: any) => {
        const waypoints = route["routes"][0]["overview_path"];
        const nearbyService = new google.maps.places.PlacesService(map);
        const promises = [];
        const distancePerWaypoint = distance.value / waypoints.length;
        const radius = 2000;
        const interval = Math.round(radius / distancePerWaypoint);
        for (let i = 0; i < waypoints.length; i += interval) {
            const promise = new Promise((resolve) => {
                nearbyService.nearbySearch(
                    {
                        location: waypoints[i],
                        radius: radius,
                        type: "restaurant",
                    },
                    (result, status) => {
                        if (
                            status ===
                                google.maps.places.PlacesServiceStatus.OK &&
                            result
                        ) {
                            resolve(result);
                        } else {
                            resolve([]);
                        }
                    }
                );
            });

            promises.push(promise);
        }
        return Promise.all(promises).then((results) => {
            let waypointMarkers: any = [];
            let waypointPlaces: any = [];
            results.forEach((result: any) => {
                if (result) {
                    for (const place of result) {
                        waypointPlaces.push(place);
                    }
                }
            });
            waypointPlaces = removeDuplicatePlaceIds(waypointPlaces);
            waypointPlaces.forEach((place: any) => {
                const lat = place.geometry?.location?.lat();
                const lng = place.geometry?.location?.lng();
                waypointMarkers.push({ lat, lng });
            });
            setWaypointMarkers(waypointMarkers);
            setWaypointPlaces(waypointPlaces);
        });
    };

    const calculateRoute = async () => {
        if (startLocation === "" || endLocation === "") {
            return;
        }
        const directionService = new google.maps.DirectionsService();
        const route: any = await directionService.route({
            origin: startLocation.getPlace().geometry.location,
            destination: endLocation.getPlace().geometry.location,
            travelMode: google.maps.TravelMode.DRIVING,
        });
        const distance = route["routes"][0]["legs"][0]["distance"];
        const duration = route["routes"][0]["legs"][0]["duration"];
        setDistance(distance);
        setDuration(duration);
        setRoute(route);
        // getNearbyPlaces() will be triggered by useEffect once distance, duration and route are set.
    };

    const handleLocations = async () => {
        const startPlace = startLocation.getPlace();
        const endPlace = endLocation.getPlace();
        const startPlaceLat = startPlace.geometry.location.lat();
        const startPlaceLng = startPlace.geometry.location.lng();
        const endPlaceLat = endPlace.geometry.location.lat();
        const endPlaceLng = endPlace.geometry.location.lng();
        await calculateRoute();
        setStartEndMarkers([
            { lat: startPlaceLat, lng: startPlaceLng },
            { lat: endPlaceLat, lng: endPlaceLng },
        ]);
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: startPlaceLat, lng: startPlaceLng });
        bounds.extend({ lat: endPlaceLat, lng: endPlaceLng });
        map.fitBounds(bounds);
        setMap(map);
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
                        <Places places={waypointPlaces} map={map} selectedMarker={selectedMarker} setSelectedMarker={setSelectedMarker} />
                    </section>
                )}
            </section>
        </main>
    );
}
