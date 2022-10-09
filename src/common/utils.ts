import { Gofetch, ResponseConfig, ResponseConfigReturn } from "../index";
import { DeepMerge } from "./types";

export function isAbsoluteURL(url: RequestInfo | URL) {
    const r = new RegExp('^(?:[a-z+]+:)?//', 'i');

    return r.test(url.toString());
}

export function isResponse(fetch: Response | Request): fetch is Response {
    return 'ok' in fetch;
}

function isObject<T extends {}>(obj: any): obj is T {
    return (obj && typeof obj === 'object' && !Array.isArray(obj));
}

export function deepMerge<T extends Record<any, any>, U extends Record<any, any>>(obj1: T, obj2: U): DeepMerge<T, U> {
    if (isObject(obj1) && isObject(obj2)) {
        for (const key in obj2) {
            if (isObject(obj2[key])) {
                Object.assign(obj1, {[key]: {}});
                deepMerge(obj1[key as keyof T], obj2[key]);
            } else {
                Object.assign(obj1, { [key]: obj2[key] });
            }
        }

        return obj1 as any; // properties merged into obj1 and overwrite
    } else {
        throw new TypeError('Parameter is not of type Object');
    }
}

export function isIterable<T>(i: any): i is Iterable<T> {
    if (!i) return false;
    return (Symbol.iterator in i) || Array.isArray(i);
}

export type Key = string | number | symbol;
export function iterableToObject<T extends [Key, any]>(iterable: Iterable<T> | Array<T>) {
    if (!isIterable(iterable)) throw new TypeError("Object is not iterable");

    const object: {[key:Key]:any} = {};
    for (const item of iterable) {
        const [key, value] = item;
        object[key] = value;
    }

    return object;
}

export class GofetchError extends Error {
    public readonly response: Gofetch<Response | Request>;
    constructor(response: Gofetch<Response | Request>, message?: string) {
        super();

        this.response = response;
        this.name = "GofetchError";
        if (response.raw instanceof Response) {
            if (message) {
                this.message = message
            }
            else if (response.raw.statusText) {
                this.message = `${response.raw.status} ${response.raw.statusText}`;
            } else {
                this.message =  `Request failed with status code ${response.raw.status}`;
            }
        } else {
            this.message = message ?? '';
        }

    }
}


export function resolveURL(path: RequestInfo | URL, base: URL | string) {
    if (isAbsoluteURL(path)) {
        return path;
    }

    if (typeof path !== "string" && 'url' in path)
        path = path.url;
    return new URL(path, base);
}

export function updateResponseConfig<D>(config: ResponseConfig<D>, newConfig: ResponseConfigReturn<D>) {
    if ('body' in newConfig) config.body = newConfig.body;
    if (newConfig.headers) {
        if (isIterable(newConfig.headers))
        newConfig.headers = iterableToObject(newConfig.headers as Headers | [string, string][]);
        if (!config.headers)
            config.headers = newConfig.headers;
        else
            config.headers = deepMerge(newConfig.headers, config.headers);
    }

    return config;
}