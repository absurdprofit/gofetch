import { GofetchRequestInit, Middleware, RequestConfig, RequestOrResponse, ResponseConfig, ResponseConfigReturn } from "./common/type";
import { deepMerge, isAbsoluteURL, isResponse } from "./common/utils";
import MiddlewareManager from "./middleware-manager";

export class Gofetch<T = any, F extends Request | Response = Request> {
    private readonly _fetch: Response | Request;
    private readonly _defaultOptions: GofetchRequestInit;
    private readonly _middlewares = new MiddlewareManager();

    constructor(
        baseURL: RequestInfo | URL = window.location.origin,
        options: GofetchRequestInit = {},
        fetch: Request | Response = new Request(new URL(baseURL.toString()), {...options, body: undefined}),
        middlewares: MiddlewareManager = new MiddlewareManager()
    ) {
        this._fetch = fetch;
        this._defaultOptions = options;
        this._middlewares = middlewares;
    }

    private get fetch() {
        return this._fetch.clone();
    }

    get body(): ReadableStream<Uint8Array> | null {
        return this.fetch.body;
    }

    get bodyUsed() {
        return this.fetch.bodyUsed;
    }

    get headers() {
        return this.fetch.headers;
    }
    
    get url() {
        return this.fetch.url;
    }

    get raw(): RequestOrResponse<F> {
        return this.fetch as any;
    }

    public arrayBuffer(): Promise<ArrayBuffer> {
        return this.fetch.arrayBuffer();
    }

    public blob() {
        return this.fetch.blob();
    }

    public clone() {
        return this._fetch.clone();
    }

    public formData() {
        return this.fetch.formData();
    }

    public json(): Promise<T> {
        return this.fetch.json();
    }

    public text() {
        return this.fetch.text();
    }

    public async get<R = any>(input: RequestInfo | URL, options: GofetchRequestInit = {}): Promise<Gofetch<R, Response>> {
        let config = await this.dispatchRequestMiddlewares({
            options: deepMerge(this._defaultOptions, options)
        });
        
        const response = await fetch(this.resolveURL(input), {
            ...config.options,
            method: 'GET'
        });

        const responseConfig = await this.dispatchResponseMiddlewares({
            body: response.body,
            options: {
                headers: response.headers,
                status: response.status,
                statusText: response.statusText
            }
        });

        return new Gofetch<R, Response>(
            this._fetch.url,
            this._defaultOptions,
            new Response(responseConfig.body, responseConfig.options),
            this._middlewares
        );
    }

    public async post<D = any, R = any>(input: RequestInfo | URL, body?: BodyInit | ReadableStream<D>, options: GofetchRequestInit = {}) {
        let requestConfig = await this.dispatchRequestMiddlewares({
            body,
            options: deepMerge(this._defaultOptions, options)
        });

        const response = await fetch(this.resolveURL(input), {
            ...requestConfig.options,
            body: requestConfig.body,
            method: 'POST'
        });

        const responseConfig = await this.dispatchResponseMiddlewares({
            body: response.body,
            options: {
                headers: response.headers,
                status: response.status,
                statusText: response.statusText
            }
        });

        return new Gofetch<R, Response>(
            this._fetch.url,
            this._defaultOptions,
            new Response(responseConfig.body, responseConfig.options),
            this._middlewares
        );
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

    public createInstance(baseURL: string, options?: GofetchRequestInit) {
        // merge defaults
        options = deepMerge(this._defaultOptions, options);
        return new Gofetch(baseURL, new Request(baseURL, options));
    }

    public use<D = any>(middleware: Middleware<D>) {
        return this._middlewares.add(middleware);
    }

    public async dispatchResponseMiddlewares<D>(config: ResponseConfigReturn<D>) {
        for (const middleware of this._middlewares) {
            if (middleware.onResponse) {
                const response = new Response(config.body, config.options);
                config = await middleware.onResponse({
                    body: response.clone().body,
                    options: config.options,
                    json: () => response.clone().json(),
                    arrayBuffer: () => response.clone().arrayBuffer(),
                    blob: () => response.clone().blob(),
                    formData: () => response.clone().formData(),
                    text: () => response.clone().text()
                });
            }
        }

        return config;
    }

    public async dispatchRequestMiddlewares<D>(config: RequestConfig<D>) {
        for (const middleware of this._middlewares) {
            if (middleware.onRequest) {
                config = await middleware.onRequest(config);
            }
        }

        return config;
    }
}

const gofetch = new Gofetch(); // base instance

export default gofetch;