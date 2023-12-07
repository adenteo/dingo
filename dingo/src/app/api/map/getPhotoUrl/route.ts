export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const googleAPIkey = request.headers.get("Authorization");

    if (!query || !googleAPIkey) {
        return;
    }

    const result = await fetch(
        `https://places.googleapis.com/v1/${query}/media?maxWidthPx=1000&skipHttpRedirect=true`,
        {
            method: "GET",
            headers: {
                "X-Goog-Api-Key": googleAPIkey,
            }
        }
    );
    
    return new Response(result.body);
}
