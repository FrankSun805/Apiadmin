export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');

    if (!path) {
        return new Response('Path parameter missing', { status: 400 });
    }

    // Extract query params (excluding 'path')
    const searchParams = new URLSearchParams(url.searchParams);
    searchParams.delete('path');
    const queryStr = searchParams.toString();

    const targetUrl = `http://124.156.230.187:8080${path}${queryStr ? '?' + queryStr : ''}`;

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: {
                'Content-Type': 'application/json', // Basic headers
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
        });

        const data = await response.text();
        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, { status: 500 });
    }
}
