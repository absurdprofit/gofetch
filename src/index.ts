import {
    GofetchMethod,
    GofetchRequestInit,
    GofetchResponseInit,
    Middleware,
    RequestConfig,
    RequestOrResponse,
    ResponseConfigReturn
} from "./common/types";
import {
    deepMerge,
    isIterable,
    GofetchError,
    iterableToObject,
    resolveURL,
    createJSONIndexProxy,
    camelToSnakeCase,
    CAMEL_CASE_RE
} from "./common/utils";
import MiddlewareManager from "./MiddlewareManager";
import { RetryController } from "./RetryController";

export class Gofetch<F extends Request | Response = Request> {
    private readonly _fetch: Response | Request;
    private readonly _defaultOptions: GofetchRequestInit | GofetchResponseInit;
    private readonly _middlewares = new MiddlewareManager();
    public createJSONIndexProxy: (<D extends {}>(json: D) => D) | null;

    constructor(
        baseURL: RequestInfo | URL,
        options: GofetchRequestInit | GofetchResponseInit = {},
        fetch: Request | Response = new Request(new URL(baseURL.toString()), {...options, body: undefined}),
        middlewares: MiddlewareManager = new MiddlewareManager()
    ) {
        this._fetch = fetch;
        this._defaultOptions = options;
        this._middlewares = middlewares;
        this.createJSONIndexProxy = (json) => {
            return createJSONIndexProxy(json, new RegExp(CAMEL_CASE_RE), (index) => {
                index = index.toString();
                
                return camelToSnakeCase(index);
            });
        }
    }

    private get fetch() {
        return this._fetch.clone();
    }

    get body(): ReadableStream<Uint8Array> | null {
        return this.fetch.body;
    }

    get bodyUsed() {
        return this._fetch.bodyUsed;
    }

    get headers() {
        return iterableToObject(this._fetch.headers);
    }
    
    get url() {
        return this._fetch.url;
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

    public async json<T = any>(): Promise<T> {
        const json = await this.fetch.json();
        if (!this.createJSONIndexProxy)
            return json;

        return this.createJSONIndexProxy(json);
    }

    public text() {
        return this.fetch.text();
    }

    /**
     * 
     * @param input Input URL of the request resource.
     * @param requestConfig The config options that will be passed to fetch().
     * @param method The HTTP method of the request
     * @returns A Gofetch Response init.
     */
    public async gofetch<B>(input: RequestInfo | URL, options: GofetchRequestInit, method: GofetchMethod | string, body?: BodyInit | ReadableStream<B>) {
        let response: Gofetch<Response>;
        const controller = new RetryController();
        const signal = controller.signal;
        let shouldTry = true;
        const onRetry = () => {
            shouldTry = true;
        }

        let request = await this.dispatchRequestMiddlewares<B>(input, {
            body,
            ...deepMerge(this._defaultOptions, options)
        });
        while(true) {
            shouldTry = false; // run only once
            signal.addEventListener('retry', onRetry, {once: true}); // unless retried

            const rawResponse = await fetch(resolveURL(input, this._fetch.url), {
                ...request,
                body: request.body,
                method
            });
    
            response = await this.dispatchResponseMiddlewares(input, {
                body: rawResponse.body,
                headers: iterableToObject(rawResponse.headers),
                status: rawResponse.status,
                statusText: rawResponse.statusText
            }, controller);

            // merge old headers with new headers
            if (!request.headers)
                request.headers = response.headers;
            else {
                if (isIterable(request.headers)) request.headers = iterableToObject(request.headers as Headers | [string, string][]);
                request.headers = deepMerge(request.headers, response.headers);
            }
                
            // if the body field is specified in the retry config then we consider this the new body
            request.body = 'body' in response ? response.body ?? undefined : request.body;
            
            if (!shouldTry) break;
        }

        // cleanup
        signal.removeEventListener('retry', onRetry);

        return response;
    }

    public async get<B = any>(input?: RequestInfo | URL, options: GofetchRequestInit = {}): Promise<Gofetch<Response>> {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        return await this.gofetch<B>(input ?? this.url, options, 'GET');
    }

    public async head<B = any>(input?: RequestInfo | URL, options: GofetchRequestInit = {}): Promise<Gofetch<Response>> {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        return await this.gofetch<B>(input ?? this.url, options, 'HEAD');
    }

    public async post<B = any>(input?: RequestInfo | URL, body?: BodyInit | ReadableStream<B>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        return await this.gofetch<B>(input ?? this.url, options, 'POST', body);
    }

    public async options<B = any>(input?: RequestInfo | URL, body?: BodyInit | ReadableStream<B>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        return await this.gofetch<B>(input ?? this.url, options, 'OPTIONS', body);
    }

    public async delete<B = any>(input?: RequestInfo | URL, body?: BodyInit | ReadableStream<B>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        return await this.gofetch<B>(input ?? this.url, options, 'DELETE', body);
    }

    public async patch<B = any>(input?: RequestInfo | URL, body?: BodyInit | ReadableStream<B>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        return await this.gofetch<B>(input ?? this.url, options, 'PATCH', body);
    }

    public async put<B = any>(input?: RequestInfo | URL, body?: BodyInit | ReadableStream<B>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        return await this.gofetch<B>(input ?? this.url, options, 'PUT', body);
    }

    /**
     * 
     * @param baseURL The base URL prepended to relative identifiers.
     * @param options The config options that will be passed to fetch().
     * @param body Optional body of the request.
     * @returns A Gofetch Request instance.
     */
    public createInstance(baseURL: RequestInfo | URL, options: GofetchRequestInit = {}, body?: BodyInit | null) {
        // merge defaults
        options = deepMerge(this._defaultOptions, options);
        const _fetch = new Request(baseURL, {
            ...options,
            body
        });
        return new Gofetch(baseURL, options, _fetch, new MiddlewareManager(this._middlewares));
    }

    /**
     * 
     * @param middleware An object that implements an onRequest, onResponse or onError method.
     * @returns The ID associated with the middleware.
     */
    public use<D = any>(middleware: Middleware<D>): number {
        return this._middlewares.add(middleware);
    }

    /**
     * 
     * @param _id The ID associated with the middleware.
     * @returns A boolean indicating whether the middlware was removed or not.
     */
    public remove(_id: number) {
        return this._middlewares.remove(_id);
    }

    private async dispatchResponseMiddlewares<D>(input: RequestInfo | URL, config: ResponseConfigReturn<D> & GofetchResponseInit, controller: RetryController) {
        let shouldBreak = false;
        const onRetry = () => {
            shouldBreak = true; // break middleware chain on retry
        }
        controller.signal.addEventListener('retry', onRetry, {once: true});
        
        let response = new Gofetch<Response>(
            input,
            {},
            new Response(config.body, {
                headers: config.headers,
                status: config.status,
                statusText: config.statusText
            })
        );

        for (const middleware of this._middlewares) {
            if (!middleware.onResponse && !middleware.onError) continue;

            if (response.raw.ok) {
                if (middleware.onResponse) {
                    const newConfig = await middleware.onResponse(response);
                    if (newConfig) {
                        config = deepMerge(config, newConfig);
                        config.body = newConfig.body;
                    }
                }
                    
            } else {
                const error = new GofetchError(response);
                if (middleware.onError) {
                    const newConfig = await middleware.onError(error, controller);
                    if (newConfig) {
                        config = deepMerge(config, newConfig);
                        config.body = newConfig.body;
                    }
                }
            }

            if (config.body instanceof ReadableStream && config.body.locked)
                config.body = response.body;
            response = new Gofetch<Response>(
                input,
                {},
                new Response(config.body, {
                    headers: config.headers,
                    status: config.status,
                    statusText: config.statusText
                })
            );
            
            if (shouldBreak) break;
        }

        // cleanup
        controller.signal.removeEventListener('retry', onRetry);
        
        // no retry signalled throw unhandled error
        if (!shouldBreak && !response.raw.ok) {
            const error = new GofetchError(response);
            throw error;
        }

        return response;
    }

    private async dispatchRequestMiddlewares<D>(input: RequestInfo | URL, config: RequestConfig<D>) {
        const {body, ...options} = config;
        let request = this.createInstance(input, options, body);
        for (const middleware of this._middlewares) {
            const {body, ...options} = config;
            request = this.createInstance(input, options, body);
            if (middleware.onRequest) {
                const newConfig = await middleware.onRequest(request);
                if (newConfig)
                    config = deepMerge(config, newConfig);
            }
        }

        return config;
    }
}

declare global {
    module Deno {
        function cwd(): string;
    }
}

let baseURL: string;
if (globalThis.location) {
    baseURL = globalThis.location.origin;
} else if (globalThis.process) {
    baseURL = globalThis.process.cwd();
} else if (globalThis.Deno) {
    baseURL = globalThis.Deno.cwd();
} else {
    throw new Error('No Base URL');
}

export default new Gofetch(baseURL);

// on platforms where baseURL is impossible to assume i.e. deno or node
// we export the constructor instead
export * from './common/types';
export * from './common/utils';
export {RetryController} from './RetryController';