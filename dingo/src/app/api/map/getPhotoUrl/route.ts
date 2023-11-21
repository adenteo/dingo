export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    if (!query) {
        return;
    }

    const result = await fetch(
        `https://places.googleapis.com/v1/${query}/media?maxWidthPx=1000&skipHttpRedirect=true`,
        {
            method: "GET",
            headers: {
                "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API ?? "",
            }
        }
    );
    
    return new Response(result.body);
}
