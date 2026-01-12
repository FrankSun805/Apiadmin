export const config = {
    runtime: 'nodejs',
};

export default async function handler(request, response) {
    // Parse query from the request URL
    const url = new URL(request.url, `http://${request.headers.host}`);
    const path = url.searchParams.get('path');

    if (!path) {
        return response.status(400).send('Path parameter missing');
    }

    // Extract query params (excluding 'path')
    const searchParams = new URLSearchParams(url.searchParams);
    searchParams.delete('path');
    const queryStr = searchParams.toString();

    const targetUrl = `http://124.156.230.187:8080${path}${queryStr ? '?' + queryStr : ''}`;

    try {
        const method = request.method;

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        if (method !== 'GET' && method !== 'HEAD' && request.body) {
            options.body = JSON.stringify(request.body);
        }

        const upstreamRes = await fetch(targetUrl, options);
        const data = await upstreamRes.text();

        response.setHeader('X-Debug-Target-Url', targetUrl);
        response.setHeader('Access-Control-Allow-Origin', '*');

        return response.status(upstreamRes.status).send(data);

    } catch (error) {
        return response.status(500).send(`Proxy Error: ${error.message}`);
    }
}
