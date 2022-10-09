import { Middleware } from "./common/types";

export default class MiddlewareManager {
    private readonly middlewareMap = new Map<number, Middleware<any> | null>();

    constructor(middlewares?: MiddlewareManager) {
        if (middlewares) this.middlewareMap = new Map(middlewares.entries);
    }

    add(middleware: Middleware<any>) {
        const index = this.middlewareMap.size;
        this.middlewareMap.set(index, middleware);

        return index;
    }

    remove(index: number) {
        return this.middlewareMap.delete(index);
    }

    get entries() {
        return this.middlewareMap.entries();
    }

    get size() {
        return this.middlewareMap.size;
    }

    [Symbol.iterator]() {
        let index = -1;
        let data = Array.from(this.middlewareMap.values()).filter(Boolean) as Middleware<any>[];
        
        return {
            next: () => ({value: data[++index], done: !(index in data)})
        };
    }
}