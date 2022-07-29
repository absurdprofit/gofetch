import { isAbsoluteURL, isResponse } from "./common/utils";

export class Gofetch<T> {
    private _fetch: Response | Request;

    constructor(
        baseURL: string = window.location.origin,
        fetch: Request | Response = new Request(new URL(baseURL))
    ) {
        this._fetch = fetch;
    }

    get body(): ReadableStream<Uint8Array> | null {
        return this._fetch.body;
    }

    get bodyUsed() {
        return this._fetch.bodyUsed;
    }

    get headers() {
        return this._fetch.headers;
    }
    
    get url() {
        return this._fetch.url;
    }

    get raw() {
        return this._fetch;
    }

    public arrayBuffer(): Promise<ArrayBuffer> {
        return this._fetch.arrayBuffer();
    }

    public blob() {
        return this._fetch.blob();
    }

    public clone() {
        return this._fetch.clone();
    }

    public formData() {
        return this._fetch.formData();
    }

    public json(): Promise<T> {
        return this._fetch.json();
    }

    public test() {
        return this._fetch.text();
    }

    public async get<R = any>(input: RequestInfo | URL): Promise<Gofetch<R>> {
        const response = await fetch(this.resolveURL(input));

        return new Gofetch<R>(response.url, response);
    }

    public async post<R = any>(input: RequestInfo | URL, body?: BodyInit | ReadableStream<BodyInit>) {
        const response = await fetch(this.resolveURL(input), {
            body
        });

        return new Gofetch<R>(response.url, response);
    }

    private resolveURL(path: RequestInfo | URL) {
        const url = new URL(this._fetch.url);

        if (isAbsoluteURL(path)) {
            return path;
        }
        
        const paths = url.pathname.split('/').filter(_path => _path.length);
        path.toString().split('/').filter(_path => _path.length).forEach(_path => paths.push(_path));
        url.pathname = paths.join('/');

        return url;
    }
}

const gofetch = new Gofetch();

export default gofetch;

// example
gofetch.get<{name: 'Nathan'}>('/videos/345453').then(response => {
    if (isResponse(response.raw)) {
        response.raw.ok;
    }
});