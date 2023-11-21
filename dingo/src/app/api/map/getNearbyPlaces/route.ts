export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const radius = searchParams.get("radius");
  if (!latitude || !longitude || !radius) {
    return;
  }


  const result = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API ?? "",
            "X-Goog-FieldMask": 'places.currentOpeningHours,places.displayName,places.editorialSummary,places.googleMapsUri,places.photos,places.formattedAddress,places.primaryType,places.rating,places.priceLevel,places.userRatingCount,places.servesVegetarianFood,places.id,places.location',
        },
        // body: '{\n  "includedTypes": ["restaurant"],\n  "maxResultCount": 10,\n  "locationRestriction": {\n    "circle": {\n      "center": {\n        "latitude": 37.7937,\n        "longitude": -122.3965},\n      "radius": 500.0\n    }\n  }\n}',
        body: JSON.stringify({
            includedTypes: ["restaurant"],
            languageCode: "en",
            maxResultCount: 20,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: latitude,
                        longitude: longitude,
                    },
                    radius: parseInt(radius),
                },
            },
        }),
    })
  
  
  return new Response(result.body)
}