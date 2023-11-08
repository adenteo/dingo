import haversineDistance from "haversine-distance";

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

const removeDuplicatePlaceIds = (array: google.maps.places.PlaceResult[]) => {
    const uniquePlaceIds = new Set<string>();
    const uniqueObjects = array.filter(
        (place: google.maps.places.PlaceResult) => {
            if (place.place_id && !uniquePlaceIds.has(place.place_id)) {
                uniquePlaceIds.add(place.place_id);
                return true;
            }
            return false;
        }
    );

    return Array.from(uniqueObjects);
};

const getNearbyPlacesFromBounds = async (
    bounds: google.maps.LatLngBounds,
    map: google.maps.Map
) => {
    const nearbyService = new google.maps.places.PlacesService(map);
    const promise: Promise<google.maps.places.PlaceResult[]> = new Promise(
        (resolve) => {
            nearbyService.nearbySearch(
                {
                    bounds: bounds,
                    type: "restaurant",
                },
                (result, status) => {
                    if (
                        status === google.maps.places.PlacesServiceStatus.OK &&
                        result
                    ) {
                        resolve(result);
                    } else {
                        resolve([]);
                    }
                }
            );
        }
    );
    return promise.then((results) => {
        let waypointMarkers: google.maps.LatLngLiteral[] = [];
        const filteredResults = removeDuplicatePlaceIds(results);
        filteredResults.forEach((place) => {
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            if (lat && lng) {
                waypointMarkers.push({ lat, lng });
            }
        });
        return waypointMarkers;
    });
};

const getNearbyPlacesFromRoute = async (
    route: google.maps.DirectionsResult,
    map: google.maps.Map,
    radius: number
) => {
    const waypoints = route["routes"][0]["overview_path"];
    const nearbyService = new google.maps.places.PlacesService(map);
    const promises = [];
    for (let i = 0; i < waypoints.length; i += 10) {
        const promise: Promise<google.maps.places.PlaceResult[]> = new Promise(
            (resolve) => {
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
                            console.log(result);
                            resolve(result);
                        } else {
                            resolve([]);
                        }
                    }
                );
            }
        );
        promises.push(promise);
    }
    return Promise.all(promises).then((results) => {
        let waypointMarkers: google.maps.LatLngLiteral[] = [];
        let waypointPlaces: google.maps.places.PlaceResult[] = [];
        results.forEach((result) => {
            if (result) {
                for (const place of result) {
                    waypointPlaces.push(place);
                }
            }
        });
        waypointPlaces = removeDuplicatePlaceIds(waypointPlaces);
        waypointPlaces.forEach((place) => {
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            if (lat && lng) {
                waypointMarkers.push({ lat, lng });
            }
        });
        // const updatedWaypointPlaces = waypointPlaces.map((place) => {
        //     const lat = place.geometry?.location?.lat();
        //     const lng = place.geometry?.location?.lng();
        //     if (lat && lng) {
        //         const shortestDistanceToRoute = getShortestDistanceToRoute(
        //             { lat, lng },
        //             waypoints
        //         );
        //         console.log(shortestDistanceToRoute);
        //         const updatedPlace: any = { ...place };
        //         updatedPlace["shortestDistance"] = shortestDistanceToRoute;
        //         return updatedPlace;
        //     }
        // });
        return { waypointMarkers, waypointPlaces };
    });
};

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
        travelMode: transitMode
    });
    return route;
    // getNearbyPlaces() will be triggered by useEffect once distance, duration and route are set.
};

const getShortestDistanceToRoute = (
    point: google.maps.LatLngLiteral,
    route: google.maps.LatLng[]
) => {
    let shortestDistance = 2000;
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

export default {
    getExtendedPolygon,
    removeDuplicatePlaceIds,
    getNearbyPlacesFromRoute,
    getNearbyPlacesFromBounds,
    getRoute,
    getShortestDistanceToRoute,
};
