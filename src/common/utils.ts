export function isAbsoluteURL(url: RequestInfo | URL) {
    const r = new RegExp('^(?:[a-z+]+:)?//', 'i');

    return r.test(url.toString());
}

export function isResponse(fetch: Response | Request): fetch is Response {
    return 'ok' in fetch;
}