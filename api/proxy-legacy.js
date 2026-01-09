export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');

    if (!path) {
        return new Response('Path parameter missing', { status: 400 });
    }

    const targetUrl = `http://124.156.230.187:8080${path}`;

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: {
                'Content-Type': 'application/json', // Basic headers
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
