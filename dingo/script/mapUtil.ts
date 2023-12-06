import haversineDistance from "haversine-distance";
import { encode, decode, parse, stringify } from "urlencode";

const apiUrl =
    process.env.NEXT_PUBLIC_APP_API_BASE_URL || "http://localhost:3000";

export interface PlacesV2 {
    formattedAddress: string;
    rating: number;
    googleMapsUri: string;
    userRatingCount: number;
    displayName: DisplayName;
    currentOpeningHours: CurrentOpeningHours;
    editorialSummary: EditorialSummary;
    priceLevel: PriceLevel;
    servesVegetarianFood: Boolean;
    primaryType: string;
    photos: Photo[];
    id: string;
    location: LatLngV2;
    detourDistance: number;
    photoUrl: string;
}

export enum PriceLevel {
    PRICE_LEVEL_UNSPECIFIED = "PRICE_LEVEL_UNSPECIFIED",
    PRICE_LEVEL_FREE = "PRICE_LEVEL_FREE",
    PRICE_LEVEL_INEXPENSIVE = "PRICE_LEVEL_INEXPENSIVE",
    PRICE_LEVEL_MODERATE = "PRICE_LEVEL_MODERATE",
    PRICE_LEVEL_EXPENSIVE = "PRICE_LEVEL_EXPENSIVE",
    PRICE_LEVEL_VERY_EXPENSIVE = "PRICE_LEVEL_VERY_EXPENSIVE",
}

export interface EditorialSummary {
    text: string;
    languageCode: string;
}

export interface LatLngV2 {
    latitude: number;
    longitude: number;
}

export interface DisplayName {
    text: string;
    languageCode: string;
}

export interface CurrentOpeningHours {
    openNow: boolean;
    periods: Period[];
    weekdayDescriptions: string[];
}

export interface Period {
    open: Time;
    close: Time;
}

export interface Time {
    day: number;
    hour: number;
    minute: number;
    date: Date;
}

export interface Date {
    year: number;
    month: number;
    day: number;
}

export interface Photo {
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: AuthorAttribution[];
}

export interface AuthorAttribution {
    displayName: string;
    uri: string;
    photoUri: string;
}

const getExtendedPolygon = (waypoints: Array<any>, radius: number) => {
    const R = 6378137;
    const pi = 3.14;
    //distance in meters
    const upper_offset = radius;
    const lower_offset = -radius;
    const Lat_up = upper_offset / R;
    const Lat_down = lower_offset / R;

    let UpperBound = [];
    let LowerBound = [];

    //OffsetPosition, decimal degrees
    for (let i = 0; i < waypoints.length; i++) {
        const latitude = waypoints[i].lat();
        const longitude = waypoints[i].lng();
        const lat_upper = latitude + (Lat_up * 180) / pi;
        const lat_lower = latitude + (Lat_down * 180) / pi;
        UpperBound.push({ lat: lat_upper, lng: longitude });
        LowerBound.push({ lat: lat_lower, lng: longitude });
    }

    let reversebound = LowerBound.reverse();
    let extendedPoly = UpperBound.concat(reversebound);

    return extendedPoly;
};

// const removeDuplicatePlaceIds = (array: google.maps.places.PlaceResult[]) => {
//     const uniquePlaceIds = new Set<string>();
//     const uniqueObjects = array.filter(
//         (place: google.maps.places.PlaceResult) => {
//             if (place.place_id && !uniquePlaceIds.has(place.place_id)) {
//                 uniquePlaceIds.add(place.place_id);
//                 return true;
//             }
//             return false;
//         }
//     );

//     return Array.from(uniqueObjects);
// };

const removeDuplicatePlaceIds = (array: PlacesV2[]) => {
    const uniquePlaceIds = new Set<string>();
    const uniqueObjects = array.filter((place: PlacesV2) => {
        if (place.id && !uniquePlaceIds.has(place.id)) {
            uniquePlaceIds.add(place.id);
            return true;
        }
        return false;
    });

    return Array.from(uniqueObjects);
};

// const getNearbyPlacesFromBounds = async (
//     bounds: google.maps.LatLngBounds,
//     map: google.maps.Map
// ) => {
//     const nearbyService = new google.maps.places.PlacesService(map);
//     const promise: Promise<google.maps.places.PlaceResult[]> = new Promise(
//         (resolve) => {
//             nearbyService.nearbySearch(
//                 {
//                     bounds: bounds,
//                     type: "restaurant",
//                 },
//                 (result, status) => {
//                     if (
//                         status === google.maps.places.PlacesServiceStatus.OK &&
//                         result
//                     ) {
//                         resolve(result);
//                     } else {
//                         resolve([]);
//                     }
//                 }
//             );
//         }
//     );
//     return promise.then((results) => {
//         let waypointMarkers: google.maps.LatLngLiteral[] = [];
//         const filteredResults = removeDuplicatePlaceIds(results);
//         filteredResults.forEach((place) => {
//             const lat = place.geometry?.location?.lat();
//             const lng = place.geometry?.location?.lng();
//             if (lat && lng) {
//                 waypointMarkers.push({ lat, lng });
//             }
//         });
//         return waypointMarkers;
//     });
// };

const fetchNearbyPlaces = async (
    latLng: google.maps.LatLng,
    radius: number
) => {
    const lat = latLng.lat().toString();
    const lng = latLng.lng().toString();
    let requestOptions: any = {
        method: "GET",
        redirect: "follow",
    };

    const places = await fetch(
        `${apiUrl}/api/map/getNearbyPlaces?latitude=${lat}&longitude=${lng}&radius=${radius.toString()}`,
        requestOptions
    );
    return places.json();
};

const getPlaceImageUrl = async (query: string) => {
    const imageDetails = await fetch(
        `${apiUrl}/api/map/getPhotoUrl?query=${query}`
    );
    const imageJson = await imageDetails.json();
    return imageJson.photoUri;
};

const getNearbyPlacesFromRoute = async (
    route: google.maps.DirectionsResult,
    radius: number
) => {
    const waypoints = route["routes"][0]["overview_path"];
    const routeWaypoints = route?.routes[0].overview_path;
    let waypointPlaces: PlacesV2[] = [];
    const waypointLocations: google.maps.LatLngLiteral[] = [];
    for (let i = 0; i < waypoints.length; i += 200) {
        const places = await fetchNearbyPlaces(waypoints[i], radius);
        waypointPlaces.push(...places.places);
    }
    waypointPlaces = removeDuplicatePlaceIds(waypointPlaces);
    waypointPlaces.forEach(async (place) => {
        const latLng = {
            lat: place.location.latitude,
            lng: place.location.longitude,
        };
        const shortestDistanceToRoute = getShortestDistanceToRoute(
            latLng,
            routeWaypoints
        );
        place.detourDistance = shortestDistanceToRoute;
        waypointLocations.push({
            lat: place.location.latitude,
            lng: place.location.longitude,
        });
    });
    return { waypointPlaces, waypointLocations };
};

// const getNearbyPlacesFromRoute = async (
//     route: google.maps.DirectionsResult,
//     map: google.maps.Map,
//     radius: number
// ) => {
//     const waypoints = route["routes"][0]["overview_path"];
//     const nearbyService = new google.maps.places.PlacesService(map);
//     const promises = [];
//     for (let i = 0; i < waypoints.length; i += 10) {
//         const promise: Promise<google.maps.places.PlaceResult[]> = new Promise(
//             (resolve) => {
//                 nearbyService.nearbySearch(
//                     {
//                         location: waypoints[i],
//                         radius: radius,
//                         type: "restaurant",
//                     },
//                     (result, status) => {
//                         if (
//                             status ===
//                                 google.maps.places.PlacesServiceStatus.OK &&
//                             result
//                         ) {
//                             console.log(result);
//                             resolve(result);
//                         } else {
//                             resolve([]);
//                         }
//                     }
//                 );
//             }
//         );
//         promises.push(promise);
//     }
//     return Promise.all(promises).then((results) => {
// let waypointMarkers: google.maps.LatLngLiteral[] = [];
// let waypointPlaces: google.maps.places.PlaceResult[] = [];
// results.forEach((result) => {
//     if (result) {
//         for (const place of result) {
//             waypointPlaces.push(place);
//         }
//     }
// });
// waypointPlaces = removeDuplicatePlaceIds(waypointPlaces);
// waypointPlaces.forEach((place) => {
//     const lat = place.geometry?.location?.lat();
//     const lng = place.geometry?.location?.lng();
//     if (lat && lng) {
//         waypointMarkers.push({ lat, lng });
//     }
// });
// return { waypointMarkers, waypointPlaces };
//     });
// };

const getRoute = async (
    startLocation: google.maps.places.Autocomplete,
    endLocation: google.maps.places.Autocomplete,
    transitMode: google.maps.TravelMode | null
) => {
    const origin = startLocation.getPlace().geometry?.location;
    const destination = endLocation.getPlace().geometry?.location;

    if (!origin || !destination || !transitMode) {
        return;
    }
    const directionService = new google.maps.DirectionsService();
    const route = await directionService.route({
        origin: origin,
        destination: destination,
        travelMode: transitMode,
    });
    return route;
    // getNearbyPlaces() will be triggered by useEffect once distance, duration and route are set.
};

const getShortestDistanceToRoute = (
    point: google.maps.LatLngLiteral,
    route: google.maps.LatLng[]
) => {
    let shortestDistance = 10001;
    for (const waypoint of route) {
        const distance = haversineDistance(point, {
            lat: waypoint.lat(),
            lng: waypoint.lng(),
        });
        if (distance < shortestDistance) {
            shortestDistance = distance;
        }
    }
    return shortestDistance;
};

const formatDistance = (distanceInMeters: number | undefined) => {
    if (!distanceInMeters) {
        return;
    }
    const distanceNearestHundred = Math.ceil(distanceInMeters / 100) * 100;
    if (distanceNearestHundred >= 1000) {
        const distanceInKilometers =
            Math.ceil(distanceNearestHundred / 100) / 10;
        return distanceInKilometers + " km";
    } else {
        const roundedDistance = Math.ceil(distanceNearestHundred / 100) * 100;
        return roundedDistance + " m";
    }
};

const getPlaceDetails = (
    map: google.maps.Map,
    placeDetailsRequest: google.maps.places.PlaceDetailsRequest,
    setPlaceResult: any
) => {
    const placesService = map && new google.maps.places.PlacesService(map);
    placesService.getDetails(placeDetailsRequest, (result) => {
        console.log(result);
        setPlaceResult(result);
    });
};

const getGoogleMapsUrl = (
    origin: google.maps.places.PlaceResult,
    destination: google.maps.places.PlaceResult,
    waypoints: PlacesV2[],
    travelMode: google.maps.TravelMode
) => {
    if (!origin.name || !destination.name) {
        return;
    }
    const originNameEncoded = encode(origin.name);
    const originPlaceId = origin.place_id;
    const destinationEncoded = encode(destination.name);
    const destinationPlaceId = destination.place_id;
    let waypointsString = waypoints
        .map((waypoint) => waypoint.displayName)
        .join("|");
    const waypointsEncoded = encode(waypointsString);
    const waypointsPlaceIds = waypoints
        .map((waypoint) => waypoint.id)
        .join("|");
    const waypointsPlaceIdsEncoded = encode(waypointsPlaceIds);
    const googleUrl = `https://www.google.com/maps/dir/?api=1&origin=${originNameEncoded}&origin_place_id=${originPlaceId}&destination=${destinationEncoded}&destination_place_id=${destinationPlaceId}&waypoints=${waypointsEncoded}&waypoint_place_ids=${waypointsPlaceIdsEncoded}&travelmode=${travelMode}`;
    window.open(googleUrl);
};

const formatPrimaryType = (type: string) => {
    const words = type.split("_");

    const capitalizedWords = words.map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );

    const result = capitalizedWords.join(" ");

    return result;
};

export default {
    getExtendedPolygon,
    removeDuplicatePlaceIds,
    getNearbyPlacesFromRoute,
    // getNearbyPlacesFromBounds,
    getRoute,
    getShortestDistanceToRoute,
    getPlaceDetails,
    formatDistance,
    getGoogleMapsUrl,
    fetchNearbyPlaces,
    getPlaceImageUrl,
    formatPrimaryType,
};
