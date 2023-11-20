"use client";
import { useRef, useState, useEffect } from "react";
import Locations from "./components/Locations";
import FilterComponent from "./components/Filters";
import GoogleMaps from "./components/GoogleMaps";
import Places from "./components/Places";
import TransitMode from "./components/TransitMode";
import { useLoadScript, Libraries } from "@react-google-maps/api";
import { GiPathDistance } from "react-icons/gi";
import { BiTimeFive } from "react-icons/bi";
import { TbBrandGoogleMaps } from "react-icons/tb";
import mapUtil, { PlacesV2 } from "../../script/mapUtil";
import DetourDistanceSlider from "./components/DetourDistanceSlider";
import { Spinner } from "@chakra-ui/react";
import SortMenu from "./components/SortMenu";

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
    const [waypointPlaces, setWaypointPlaces] = useState<PlacesV2[]>([]);
    const [route, setRoute] = useState<
        google.maps.DirectionsResult | undefined
    >(undefined);
    const [distance, setDistance] = useState<google.maps.Distance | undefined>(
        undefined
    ); // text and value
    const [duration, setDuration] = useState<google.maps.Duration | undefined>(
        undefined
    ); // text and value
    const [selectedMarker, setSelectedMarker] =
        useState<google.maps.LatLngLiteral | null>(null);
    const [transitMode, setTransitMode] =
        useState<google.maps.TravelMode | null>(null);
    const [tripList, setTripList] = useState<PlacesV2[]>([]);
    const placesRef = useRef<any>(null);
    const [detourDistance, setDetourDistance] = useState(5);
    const [placesLoading, setPlacesLoading] = useState(false);
    const [sortPlacesBy, setSortPlacesBy] = useState<string | null>(null);

    useEffect(() => {
        const getNearbyPlaces = async () => {
            if (distance && duration && route && map) {
                setPlacesLoading(true);
                const { waypointPlaces, waypointLocations } =
                    await mapUtil.getNearbyPlacesFromRoute(
                        route,
                        detourDistance * 1000
                    );
                console.log(waypointPlaces);
                setWaypointMarkers(waypointLocations);
                setWaypointPlaces(waypointPlaces);
                setPlacesLoading(false);
            }
        };
        getNearbyPlaces();
    }, [distance, duration, route]);

    useEffect(() => {
        if (placesRef && waypointPlaces.length > 0) {
            placesRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [waypointPlaces]);

    const handleOpenInGmaps = () => {
        if (
            !startLocation ||
            !endLocation ||
            tripList.length === 0 ||
            !transitMode
        ) {
            return;
        }
        const startPlace = startLocation.getPlace();
        const endPlace = endLocation.getPlace();
        mapUtil.getGoogleMapsUrl(startPlace, endPlace, tripList, transitMode);
    };

    const handleAddToTrip = (place: PlacesV2, addToTrip: boolean) => {
        if (addToTrip) {
            // Add to the trip list
            const newTripList = [...tripList, place];
            setTripList(newTripList);
            return newTripList.length; // Return the order
        } else {
            // Remove from the trip list
            const newTripList = tripList.filter((p: PlacesV2) => p !== place);
            setTripList(newTripList);
            return null;
        }
    };

    const handleLocations = async () => {
        setTripList([]);
        setStartEndMarkers([]);
        setWaypointMarkers([]);
        setWaypointPlaces([]);
        setSortPlacesBy(null);

        if (!startLocation || !endLocation || !map) {
            return;
        }
        console.log(startLocation);
        const startPlace = startLocation.getPlace();
        const endPlace = endLocation.getPlace();
        const startPlaceLat = startPlace.geometry?.location?.lat();
        const startPlaceLng = startPlace.geometry?.location?.lng();
        const endPlaceLat = endPlace.geometry?.location?.lat();
        const endPlaceLng = endPlace.geometry?.location?.lng();

        if (!startPlaceLat || !startPlaceLng || !endPlaceLat || !endPlaceLng) {
            return;
        }

        const route = await mapUtil.getRoute(
            startLocation,
            endLocation,
            transitMode
        );
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
                <div>
                    <Locations
                        startLocation={startLocation}
                        endLocation={endLocation}
                        setStartLocation={setStartLocation}
                        setEndLocation={setEndLocation}
                        isLoaded={isLoaded}
                    ></Locations>
                    <TransitMode
                        transitMode={transitMode}
                        setTransitMode={setTransitMode}
                        isLoaded={isLoaded}
                    />
                    {isLoaded && (
                        <div className="w-48 mx-auto mt-10">
                            <div className="text-center mb-2">Max Detour</div>
                            <DetourDistanceSlider setDetourDistance={setDetourDistance} detourDistance={detourDistance}/>
                            <div className="text-center mt-2">
                                {detourDistance} km
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <button
                        className="bg-gradient-to-br from-green-400 to-green-600 flex
                       p-2 px-5 rounded-xl text-xl font-semibold 
                       transform transition-transform hover:scale-110"
                        onClick={handleLocations}
                    >
                        {placesLoading ? <Spinner /> : "Go!"}
                    </button>
                </div>
            </section>
            <section className="flex flex-col items-center justify-center max-h-screen">
                <div
                    className={`flex flex-col items-center justify-center h-[25vh] ${
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
                </div>
                {waypointPlaces.length > 0 && (
                    <div
                        className="flex flex-col items-center justify-center h-[75vh]"
                        ref={placesRef}
                    >
                        <div className="my-4">
                            <div className="flex justify-center">
                                <div className="flex items-center text-xs">
                                    <GiPathDistance
                                        size={20}
                                        className="mx-2"
                                    />
                                    {distance?.text}
                                </div>
                                <div className="flex items-center text-xs">
                                    <BiTimeFive size={20} className="mx-2" />
                                    {duration?.text}
                                </div>
                            </div>
                            <SortMenu setSortPlacesBy={setSortPlacesBy} sortPlacesBy={sortPlacesBy}/>
                        </div>
                        {tripList.length > 0 && (
                            <button
                                onClick={handleOpenInGmaps}
                                className="flex justify-center items-center p-3 mb-4 bg-green-500 rounded-xl text-black font-semibold text-xs"
                            >
                                Open trip in <TbBrandGoogleMaps size={20} />
                            </button>
                        )}
                        <Places
                            places={waypointPlaces}
                            map={map}
                            selectedMarker={selectedMarker}
                            setSelectedMarker={setSelectedMarker}
                            route={route}
                            onAddToTrip={handleAddToTrip}
                            tripList={tripList}
                            sortPlacesBy={sortPlacesBy}
                        />
                    </div>
                )}
            </section>
        </main>
    );
}
