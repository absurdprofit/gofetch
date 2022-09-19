import { GoFetchMethod, GofetchRequestInit, Middleware, RequestConfig, RequestOrResponse, ResponseConfigReturn } from "./common/type";
import { deepMerge, isAbsoluteURL, isIterable, iterableToObject } from "./common/utils";
import MiddlewareManager from "./middleware-manager";
import { RetryController } from "./RetryController";

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
        return iterableToObject(this.fetch.headers);
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

    private async gofetch<R>(input: RequestInfo | URL, requestConfig: RequestConfig<R>, method: GoFetchMethod) {
        let responseConfig: ResponseConfigReturn<Uint8Array>;
        const controller = new RetryController();
        const signal = controller.signal;
        let shouldTry = true;
        const onRetry = () => {
            shouldTry = true;
        }
        while(shouldTry) {
            shouldTry = false; // run only once
            signal.addEventListener('retry', onRetry, {once: true}); // unless retried

            const response = await fetch(this.resolveURL(input), {
                ...requestConfig.options,
                body: requestConfig.body,
                method
            });
    
            responseConfig = await this.dispatchResponseMiddlewares({
                body: response.body,
                options: {
                    headers: iterableToObject(response.headers),
                    status: response.status,
                    statusText: response.statusText
                }
            }, controller);

            requestConfig.options = deepMerge(requestConfig.options, responseConfig.options);
            // if the body field is specified in the retry config then we consider this the new body
            requestConfig.body = 'body' in responseConfig ? responseConfig.body ?? undefined : requestConfig.body;
        }

        // cleanup
        signal.removeEventListener('retry', onRetry);

        return responseConfig!;
    }

    public async get<R = any>(input: RequestInfo | URL, options: GofetchRequestInit = {}): Promise<Gofetch<R, Response>> {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        let requestConfig = await this.dispatchRequestMiddlewares<R>({
            options: deepMerge(this._defaultOptions, options)
        });
        
        const responseConfig = await this.gofetch(input, requestConfig, 'GET');

        return new Gofetch<R, Response>(
            this._fetch.url,
            this._defaultOptions,
            new Response(responseConfig!.body, responseConfig!.options),
            this._middlewares
        );
    }

    public async post<D = any, R = any>(input: RequestInfo | URL, body?: BodyInit | ReadableStream<D>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        let requestConfig = await this.dispatchRequestMiddlewares({
            body,
            options: deepMerge(this._defaultOptions, options)
        });

        const responseConfig = await this.gofetch(input, requestConfig, 'POST');

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

    public createInstance(baseURL: string, options: GofetchRequestInit = {}) {
        // merge defaults
        options = deepMerge(this._defaultOptions, options);
        return new Gofetch(baseURL, options, new Request(baseURL), new MiddlewareManager(this._middlewares));
    }

    public use<D = any>(middleware: Middleware<D>) {
        return this._middlewares.add(middleware);
    }

    public remove(_id: number) {
        return this._middlewares.remove(_id);
    }

    public async dispatchResponseMiddlewares<D>(config: ResponseConfigReturn<D>, controller: RetryController) {
        let shouldBreak = false;
        const onRetry = () => {
            shouldBreak = true; // break middleware chain on retry
        }
        controller.signal.addEventListener('retry', onRetry, {once: true});

        for (const middleware of this._middlewares) {
            if (!middleware.onResponse && !middleware.onError) continue;

            const response = new Response(config.body, config.options);
            const responseData = {
                body: response.clone().body,
                options: config.options,
                json: () => response.clone().json(),
                arrayBuffer: () => response.clone().arrayBuffer(),
                blob: () => response.clone().blob(),
                formData: () => response.clone().formData(),
                text: () => response.clone().text()
            };
            config = responseData;

            if (response.ok) {
                if (middleware.onResponse)
                    config = await middleware.onResponse(responseData);
            } else {
                if (middleware.onError) {
                    const result = await middleware.onError(responseData, controller);
                    if (result) config = result;
                }
            }

            if (shouldBreak) break;
        }

        // cleanup
        controller.signal.removeEventListener('retry', onRetry);

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