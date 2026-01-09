export const config = {
    runtime: 'edge', // Use Edge runtime for speed
};

export default async function handler(request) {
    const url = new URL(request.url);
    const path = url.searchParams.get('path'); // We'll pass the path as a query param

    if (!path) {
        return new Response('Path parameter missing', { status: 400 });
    }

    // Extract query params (excluding 'path')
    const searchParams = new URLSearchParams(url.searchParams);
    searchParams.delete('path');
    const queryStr = searchParams.toString();

    const targetUrl = `https://api2.qiandao.mom${path}${queryStr ? '?' + queryStr : ''}`;

    // Forward the Authorization header from the client
    const authHeader = request.headers.get('Authorization');
    const headers = {
        'Origin': 'https://key-check.qiandao.mom',
        'Referer': 'https://key-check.qiandao.mom/',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: request.body,
        });

        const data = await response.text();
        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow our frontend
            },
        });
    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, { status: 500 });
    }
}
