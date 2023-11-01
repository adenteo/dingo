"use client";
import { useRef, useState } from "react";
import Locations from "./components/Locations";
import FilterComponent from "./components/Filters";
import GoogleMaps from "./components/GoogleMaps";
import Places from "./components/Places";
import { useLoadScript, Libraries } from "@react-google-maps/api";

const placesLibrary: Libraries = ["places"];

// const foodPlaces = [
//     {
//         Name: "Food Place 1",
//         Cuisine: "Western",
//         Rating: 4.7,
//         ExtraTime: 10,
//         ExtraDistance: 0.2,
//     },
//     {
//         Name: "Food Place 2",
//         Cuisine: "Asian",
//         Rating: 4.2,
//         ExtraTime: 8,
//         ExtraDistance: 0.3,
//     },
//     {
//         Name: "Food Place 3",
//         Cuisine: "Italian",
//         Rating: 4.7,
//         ExtraTime: 11,
//         ExtraDistance: 0.3,
//     },
//     {
//         Name: "Food Place 4",
//         Cuisine: "Italian",
//         Rating: 3.2,
//         ExtraTime: 2,
//         ExtraDistance: 0.5,
//     },
// ];

export default function Home() {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API ?? "",
        libraries: placesLibrary,
    });
    const [startLocation, setStartLocation] = useState<any>("");
    const [endLocation, setEndLocation] = useState<any>("");
    const [map, setMap] = useState<any>(null);
    const [markers, setMarkers] = useState<any>([]);
    const [waypointMarkers, setWaypointMarkers] = useState<any>([]);
    const [waypointPlaces, setWaypointPlaces] = useState<any>([]);
    const [route, setRoute] = useState<any>(null);

    // const getNearbyPlaces = (route: any) => {
    //     const waypoints = route["routes"][0]["overview_path"];
    //     const nearbyService = new google.maps.places.PlacesService(map);
    //     for (let i = 0; i < waypoints.length; i += 40) {
    //         nearbyService.nearbySearch(
    //             {
    //                 location: waypoints[i],
    //                 radius: 500,
    //                 type: "restaurant",
    //             },
    //             getNearbyPlacesCallback
    //         );
    //     }
    // };

    const getNearbyPlaces = async (route: any) => {
      const promises = [];
      const waypoints = route["routes"][0]["overview_path"];
      const nearbyService = new google.maps.places.PlacesService(map);
      for (let i = 0; i < waypoints.length; i += 40) {
        const promise = new Promise((resolve) => {
          nearbyService.nearbySearch(
            {
              location: waypoints[i],
              radius: 500,
              type: "restaurant",
            },
            (result, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                resolve(result)
              } else {
                resolve([])
              }
            }
          );
        });
    
        promises.push(promise);
      }
      return Promise.all(promises)
        .then((results) => {
          const waypointMarkers: any = [];
          const waypointPlaces: any = [];
          results.forEach((result: any) => {
            if (result) {
              for (const place of result) {
                const lat = place.geometry?.location?.lat();
                const lng = place.geometry?.location?.lng();
                waypointMarkers.push({ lat, lng });
                waypointPlaces.push(place);
              }
            }
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
        const route = await directionService.route({
            origin: startLocation.getPlace().geometry.location,
            destination: endLocation.getPlace().geometry.location,
            travelMode: google.maps.TravelMode.DRIVING,
        });
        setRoute(route);
        getNearbyPlaces(route);
    };

    const handleLocations = async () => {
        const startPlace = startLocation.getPlace();
        const endPlace = endLocation.getPlace();
        const startPlaceLat = startPlace.geometry.location.lat();
        const startPlaceLng = startPlace.geometry.location.lng();
        const endPlaceLat = endPlace.geometry.location.lat();
        const endPlaceLng = endPlace.geometry.location.lng();
        await calculateRoute();
        setMarkers([
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
                        className="bg-green-400 p-2 px-5 rounded-full animate-bounce"
                        onClick={handleLocations}
                    >
                        Search
                    </button>
                </div>
                {/* <div className="my-10 hover:text-cyan-300 cursor-pointer animate-bounce text-white">
                        <a href="#projects">
                            Scroll down
                        </a>
                    </div> */}
            </section>
            {/* Result page */}
            {/* With start and destination, list of food places will be provided. Details will show extra time taken, extra distance taken. Food place will show name, location, google stars, cuisine. */}
            {/* <section className="flex min-h-screen flex-col items-center justify-between py-24">
                <div>
                    {foodPlaces.map((place) => (
                        <div className="p-3 m-3 bg-white text-black rounded w-[80vw] flex">
                            <img
                                src="foodImage.png"
                                className="w-14 h-14 rounded my-auto"
                            ></img>
                            <div className="mx-2">
                                <div className="font-semibold">
                                    {place.Name}
                                </div>
                                <div className="text-xs">{place.Cuisine}</div>
                                <div className="flex">
                                  <div className="flex m-2">
                                    <span className="bg-green-400 rounded-xl px-2 py-1 text-xs font-extrabold">+{place.ExtraDistance}</span>
                                    <span className="text-xs py-1 ml-1 font-extrabold">km</span>
                                  </div>
                                  <div className="flex m-2">
                                    <span className="bg-green-400 rounded-xl px-2 py-1 text-xs font-extrabold">+{place.ExtraTime}</span>
                                    <span className="text-xs py-1 ml-1 font-extrabold">mins</span>
                                  </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section> */}
            <section className="flex min-h-screen flex-col items-center justify-center">
                <GoogleMaps
                    isLoaded={isLoaded}
                    markers={markers}
                    setMap={setMap}
                    map={map}
                    route={route}
                    waypointMarkers={waypointMarkers}
                />
            </section>
            <section className="flex min-h-screen flex-col items-center justify-center">
              <Places places={waypointPlaces}/>
            </section>
        </main>
    );
}
