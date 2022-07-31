import { DeepMerge } from "./type";

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

export function deepMerge<T, U>(obj1: T, obj2: U): DeepMerge<T, U> {
    if (isObject(obj1) && isObject(obj2)) {
        for (const key in obj2) {
            if (isObject(obj2[key])) {
                Object.assign(obj1, {[key]: {}});
                deepMerge(obj1, { [key]: obj2[key] });
            } else {
                Object.assign(obj1, { [key]: obj2[key] });
            }
        }

        return obj1 as any; // properties merged into obj1 and overwrite
    } else {
        throw new TypeError('Parameter is not of type Object');
    }
}