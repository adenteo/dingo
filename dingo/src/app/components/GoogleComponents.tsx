import { Libraries, useLoadScript } from "@react-google-maps/api";
import Locations from "./Locations";
import GoogleMaps from "./GoogleMaps";
import Places from "./Places";
import TransitMode from "./TransitMode";
import { GiPathDistance } from "react-icons/gi";
import { BiTimeFive } from "react-icons/bi";
import { TbBrandGoogleMaps } from "react-icons/tb";
import DetourDistanceSlider from "./DetourDistanceSlider";
import { Spinner } from "@chakra-ui/react";
import SortMenu from "./SortMenu";
import { FaChevronUp } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";
import { IoIosSettings } from "react-icons/io";
import { useState, useRef, useEffect } from "react";
import mapUtil, { PlacesV2 } from "../../../script/mapUtil";

interface GoogleComponentsProps {
    GoogleAPIKey: string;
}

const placesLibrary: Libraries = ["places"];

const GoogleComponents = ({ GoogleAPIKey }: GoogleComponentsProps) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: GoogleAPIKey,
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
    const homeRef = useRef<any>(null);
    const [detourDistance, setDetourDistance] = useState(1);
    const [placesLoading, setPlacesLoading] = useState(false);
    const [sortPlacesBy, setSortPlacesBy] = useState<string>("Rating");
    const [showTopSection, setShowTopSection] = useState(true);
    const [isSettingsPopupVisible, setIsSettingsPopupVisible] = useState(false);

    useEffect(()=> {
      const googleAPIKey = localStorage.getItem("Google-API-Key");
      if (!googleAPIKey) {
        console.log("NO API DETECTED")
        setIsSettingsPopupVisible(true);
      } else {
        console.log("API DETECTED")
      }
    },[isSettingsPopupVisible])

    const handleSettingsButtonClick = () => {
        setIsSettingsPopupVisible(true);
    };

    const clearStates = () => {
        setTripList([]);
        setStartEndMarkers([]);
        setWaypointMarkers([]);
        setWaypointPlaces([]);
        setSortPlacesBy("Rating");
    };

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
        const handleScroll = () => {
            if (window.scrollY >= placesRef.current.offsetTop) {
                setShowTopSection(false);
                window.removeEventListener("scroll", handleScroll);
            }
        };

        if (placesRef && waypointPlaces.length > 0) {
            setTimeout(() => {
                placesRef.current.scrollIntoView({ behavior: "smooth" });
            }, 100);
            window.addEventListener("scroll", handleScroll);
        }

        return () => {
            // Cleanup: Remove the event listener when the component is unmounted
            window.removeEventListener("scroll", handleScroll);
        };
    }, [waypointPlaces, placesRef]);

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
        clearStates();

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
            <section
                ref={homeRef}
                className={`flex min-h-screen flex-col items-center justify-between py-24 ${
                    !showTopSection && "hidden"
                }`}
            >
                <div
                    className="absolute top-4 right-4 hover:animate-spin"
                    onClick={handleSettingsButtonClick}
                >
                    <IoIosSettings size={40} />
                </div>
                {/* {isSettingsPopupVisible && (
                    <SettingsPopup
                        isSettingsPopupVisible={isSettingsPopupVisible}
                        setIsSettingsPopupVisible={setIsSettingsPopupVisible}
                    />
                )} */}
                <div>
                    <h1 className="font-semibold text-7xl text-green-400 text-center">
                        Dingo
                    </h1>
                    <h2 className="font-semibold text-xs pl-1.5">
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
                    {GoogleAPIKey && (
                        <div className="w-48 mx-auto mt-10">
                            <div className="text-center mb-2">Max Detour</div>
                            <DetourDistanceSlider
                                setDetourDistance={setDetourDistance}
                                detourDistance={detourDistance}
                            />
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

            <section
                ref={placesRef}
                className="flex flex-col items-center justify-center max-h-screen"
            >
                {waypointPlaces.length > 0 && (
                    <button
                        onClick={() => {
                            clearStates();
                            setShowTopSection(true);
                            homeRef.current.scrollIntoView({
                                behavior: "smooth",
                            });
                        }}
                        className="flex flex-col items-center justify-center h-[10vh] my-4 animate-bounce"
                    >
                        <FaChevronUp size={25} />
                        Back
                    </button>
                )}
                <div
                    className={`flex flex-col items-center justify-center h-[20vh] ${
                        startEndMarkers.length > 0 && waypointPlaces.length > 0
                            ? ""
                            : "hidden"
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
                    <div className="flex flex-col items-center justify-center h-[70vh]">
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
                            <div className="flex justify-center mt-2">
                                <SiGooglemaps />
                                <div className="font-bold text-green-500 mx-2">
                                    {waypointPlaces.length}
                                </div>
                                <div>locations found.</div>
                            </div>
                            <SortMenu
                                setSortPlacesBy={setSortPlacesBy}
                                sortPlacesBy={sortPlacesBy}
                            />
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
};

export default GoogleComponents;
