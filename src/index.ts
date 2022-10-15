import {
    GofetchMethod,
    GofetchRequestInit,
    GofetchResponseInit,
    Middleware,
    RequestConfig,
    RequestOrResponse,
    ResponseConfigReturn
} from "./common/types";
import { deepMerge, isIterable, GofetchError, iterableToObject, resolveURL, updateResponseConfig } from "./common/utils";
import MiddlewareManager from "./MiddlewareManager";
import { RetryController } from "./RetryController";

export class Gofetch<F extends Request | Response = Request> {
    private readonly _fetch: Response | Request;
    private readonly _defaultOptions: GofetchRequestInit | GofetchResponseInit;
    private readonly _middlewares = new MiddlewareManager();

    constructor(
        baseURL: RequestInfo | URL,
        options: GofetchRequestInit | GofetchResponseInit = {},
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

    public json<T = any>(): Promise<T> {
        return this.fetch.json();
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
    public async gofetch<B>(input: RequestInfo | URL, requestConfig: RequestConfig<B>, method: GofetchMethod | string) {
        let responseConfig: ResponseConfigReturn<B> & GofetchResponseInit;
        const controller = new RetryController();
        const signal = controller.signal;
        let shouldTry = true;
        const onRetry = () => {
            shouldTry = true;
        }

        while(true) {
            shouldTry = false; // run only once
            signal.addEventListener('retry', onRetry, {once: true}); // unless retried

            const response = await fetch(resolveURL(input, this._fetch.url), {
                ...requestConfig.options,
                body: requestConfig.body,
                method
            });
    
            responseConfig = await this.dispatchResponseMiddlewares({
                body: response.body,
                headers: iterableToObject(response.headers),
                status: response.status,
                statusText: response.statusText
            }, controller);

            if (responseConfig.headers) {
                // merge old headers with new headers
                if (isIterable(responseConfig.headers))
                    responseConfig.headers = iterableToObject(responseConfig.headers as Headers | [string, string][]);
                if (!requestConfig.options) requestConfig.options = {};
                if (!requestConfig.options.headers)
                    requestConfig.options.headers = responseConfig.headers;
                else
                    requestConfig.options.headers = deepMerge(requestConfig.options.headers, responseConfig.headers);
            }
            // if the body field is specified in the retry config then we consider this the new body
            requestConfig.body = 'body' in responseConfig ? responseConfig.body ?? undefined : requestConfig.body;
            
            if (!shouldTry) break;
        }

        // cleanup
        signal.removeEventListener('retry', onRetry);

        return responseConfig;
    }

    public async get<B = any>(input?: RequestInfo | URL, options: GofetchRequestInit = {}): Promise<Gofetch<Response>> {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        let requestConfig = await this.dispatchRequestMiddlewares<B>({
            options: deepMerge(this._defaultOptions, options)
        });
        
        const responseConfig = await this.gofetch<B>(input ?? this.url, requestConfig, 'GET');

        return new Gofetch<Response>(
            this._fetch.url,
            this._defaultOptions,
            new Response(responseConfig!.body, {
                headers: responseConfig.headers,
                status: responseConfig.status,
                statusText: responseConfig.statusText
            }),
            this._middlewares
        );
    }

    public async head<B = any>(input?: RequestInfo | URL, options: GofetchRequestInit = {}): Promise<Gofetch<Response>> {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        let requestConfig = await this.dispatchRequestMiddlewares<B>({
            options: deepMerge(this._defaultOptions, options)
        });
        
        const responseConfig = await this.gofetch<B>(input ?? this.url, requestConfig, 'HEAD');

        return new Gofetch<Response>(
            this._fetch.url,
            this._defaultOptions,
            new Response(responseConfig!.body, {
                headers: responseConfig.headers,
                status: responseConfig.status,
                statusText: responseConfig.statusText
            }),
            this._middlewares
        );
    }

    public async post<B = any>(input?: RequestInfo | URL, body?: BodyInit | ReadableStream<B>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        let requestConfig = await this.dispatchRequestMiddlewares<B>({
            body,
            options: deepMerge(this._defaultOptions, options)
        });

        const responseConfig = await this.gofetch<B>(input ?? this.url, requestConfig, 'POST');

        return new Gofetch<Response>(
            this._fetch.url,
            this._defaultOptions,
            new Response(responseConfig.body, {
                headers: responseConfig.headers,
                status: responseConfig.status,
                statusText: responseConfig.statusText
            }),
            this._middlewares
        );
    }

    public async options<B = any>(input?: RequestInfo | URL, body?: BodyInit | ReadableStream<B>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        let requestConfig = await this.dispatchRequestMiddlewares<B>({
            body,
            options: deepMerge(this._defaultOptions, options)
        });

        const responseConfig = await this.gofetch<B>(input ?? this.url, requestConfig, 'OPTIONS');

        return new Gofetch<Response>(
            this._fetch.url,
            this._defaultOptions,
            new Response(responseConfig.body, {
                headers: responseConfig.headers,
                status: responseConfig.status,
                statusText: responseConfig.statusText
            }),
            this._middlewares
        );
    }

    public async delete<B = any>(input?: RequestInfo | URL, body?: BodyInit | ReadableStream<B>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        let requestConfig = await this.dispatchRequestMiddlewares<B>({
            body,
            options: deepMerge(this._defaultOptions, options)
        });

        const responseConfig = await this.gofetch<B>(input ?? this.url, requestConfig, 'DELETE');

        return new Gofetch<Response>(
            this._fetch.url,
            this._defaultOptions,
            new Response(responseConfig.body, {
                headers: responseConfig.headers,
                status: responseConfig.status,
                statusText: responseConfig.statusText
            }),
            this._middlewares
        );
    }

    public async patch<B = any>(input?: RequestInfo | URL, body?: BodyInit | ReadableStream<B>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        let requestConfig = await this.dispatchRequestMiddlewares<B>({
            body,
            options: deepMerge(this._defaultOptions, options)
        });

        const responseConfig = await this.gofetch<B>(input ?? this.url, requestConfig, 'PATCH');

        return new Gofetch<Response>(
            this._fetch.url,
            this._defaultOptions,
            new Response(responseConfig.body, {
                headers: responseConfig.headers,
                status: responseConfig.status,
                statusText: responseConfig.statusText
            }),
            this._middlewares
        );
    }

    public async put<B = any>(input?: RequestInfo | URL, body?: BodyInit | ReadableStream<B>, options: GofetchRequestInit = {}) {
        if (isIterable(options.headers)) options.headers = iterableToObject(options.headers as Headers | [string, string][]);
        let requestConfig = await this.dispatchRequestMiddlewares<B>({
            body,
            options: deepMerge(this._defaultOptions, options)
        });

        const responseConfig = await this.gofetch<B>(input ?? this.url, requestConfig, 'PUT');

        return new Gofetch<Response>(
            this._fetch.url,
            this._defaultOptions,
            new Response(responseConfig.body, {
                headers: responseConfig.headers,
                status: responseConfig.status,
                statusText: responseConfig.statusText
            }),
            this._middlewares
        );
    }

    /**
     * 
     * @param baseURL The base URL prepended to relative identifiers.
     * @param options The config options that will be passed to fetch().
     * @param body Optional body of the request.
     * @returns A Gofetch Request instance.
     */
    public createInstance(baseURL: string, options: GofetchRequestInit = {}, body?: BodyInit | null) {
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

    private async dispatchResponseMiddlewares<D>(config: ResponseConfigReturn<D> & GofetchResponseInit, controller: RetryController) {
        let shouldBreak = false;
        const onRetry = () => {
            shouldBreak = true; // break middleware chain on retry
        }
        controller.signal.addEventListener('retry', onRetry, {once: true});
        
        let response = new Response(config.body, {
            headers: config.headers,
            status: config.status,
            statusText: config.statusText
        });

        for (const middleware of this._middlewares) {
            if (!middleware.onResponse && !middleware.onError) continue;

            response = new Response(config.body, {
                headers: config.headers,
                status: config.status,
                statusText: config.statusText
            });
            const responseData = {
                body: response.clone().body,
                headers: config.headers,
                status: config.status,
                statusText: config.statusText,
                json: () => response.clone().json(),
                arrayBuffer: () => response.clone().arrayBuffer(),
                blob: () => response.clone().blob(),
                formData: () => response.clone().formData(),
                text: () => response.clone().text()
            };

            if (response.ok) {
                if (middleware.onResponse) {
                    const newConfig = await middleware.onResponse(responseData);
                    if (newConfig)
                        config = {
                            ...updateResponseConfig(responseData, newConfig),
                            ...config
                        };
                }
                    
            } else {
                const gofetch = new Gofetch<Response>(response.url, response, response);
                const error = new GofetchError(gofetch);
                if (middleware.onError) {
                    const newConfig = await middleware.onError(error, controller);
                    if (newConfig)
                        config = {
                            ...updateResponseConfig(responseData, newConfig),
                            ...config
                        };
                }
            }

            if (shouldBreak) break;
        }

        // cleanup
        controller.signal.removeEventListener('retry', onRetry);
        
        // no retry signalled throw unhandled error
        if (!shouldBreak && !response.ok) {
            const gofetch = new Gofetch<Response>(response.url, response, response);
            const error = new GofetchError(gofetch);
            throw error;
        }

        return config;
    }

    private async dispatchRequestMiddlewares<D>(config: RequestConfig<D>) {
        for (const middleware of this._middlewares) {
            if (middleware.onRequest) {
                const newConfig = await middleware.onRequest(config);
                if (newConfig)
                    config = newConfig;
            }
        }

        return config;
    }
}

// on platforms where baseURL is impossible to assume i.e. deno or node
// we export the constructor instead
export * from './common/types';
export * from './common/utils';
export {RetryController} from './RetryController';