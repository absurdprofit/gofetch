import { Gofetch } from "../index";
import { DeepMerge } from "./types";

export function isAbsoluteURL(url: RequestInfo | URL) {
    const r = new RegExp('^(?:[a-z+]+:)?//', 'i');

    return r.test(url.toString());
}

export function isResponse(fetch: Response | Request): fetch is Response {
    return 'ok' in fetch;
}

function isPlainObject<T extends {}>(obj: any): obj is T {
    return (obj && typeof obj === 'object' && obj.constructor === Object);
}

function isObject<T extends {}>(obj: any): obj is T {
    return (obj && typeof obj === 'object');
}

export function deepMerge<T extends Record<any, any>, U extends Record<any, any>>(obj1: T, obj2: U): DeepMerge<T, U> {
    const clone = {...obj1};
    if (isObject(clone)) {
        for (const key in obj2) {
            if (isPlainObject(obj2[key])) {
                clone[key] = deepMerge(clone[key as keyof T], obj2[key]) as T[Extract<keyof U, string>];
            } else {
                Object.assign(clone, { [key]: obj2[key] });
            }
        }

        return clone as any; // properties merged into obj1 and overwrite
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

export function createJSONIndexProxy<T extends {}>(
    obj: T,
    indexTest: RegExp | string,
    indexTransformer: (index: string | symbol) => PropertyKey
) {
    const testIndex = (p: string | symbol) => {
        p = p.toString();
        if (typeof indexTest === "string") {
            return p === indexTest;
        } else {
            return indexTest.test(p);
        }
    }
    const transformKey = (p: string | symbol) => {
        let propertyKey: PropertyKey = p;
        if (testIndex(p)) {
            propertyKey = indexTransformer(p);
        }
        return propertyKey;
    }
    return new Proxy(
        obj,
        {
            get(target, p, receiver) {
                const propertyKey = transformKey(p);
                return Reflect.get(target, propertyKey, receiver);
            },
            set(target, p, newValue, receiver) {
                const propertyKey = transformKey(p);
                return Reflect.set(target, propertyKey, newValue, receiver);
            },
            defineProperty(target, property, attributes) {
                const propertyKey = transformKey(property);
                return Reflect.defineProperty(target, propertyKey, attributes);
            },
            deleteProperty(target, p) {
                const propertyKey = transformKey(p);
                return Reflect.deleteProperty(target, propertyKey);
            },
            getOwnPropertyDescriptor(target, p) {
                const propertyKey = transformKey(p);
                return Reflect.getOwnPropertyDescriptor(target, propertyKey);
            },
            has(target, p) {
                const propertyKey = transformKey(p);
                return Reflect.has(target, propertyKey);
            },
        }
    );
}

export function camelToSnakeCase(str: string) {
    return str.replace(/[A-Z]/g, (letter, offset) => {
        if (!offset)
            return letter.toLowerCase();
            
        return `_${letter.toLowerCase()}`;
    });
};

export const CAMEL_CASE_RE = '^[a-zA-Z]+([A-Z][a-z]+)+$';