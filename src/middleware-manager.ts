import { Middleware } from "./common/type";

export default class MiddlewareManager {
    private readonly middlewareMap = new Map<number, Middleware<any> | null>();

    add(middleware: Middleware<any>) {
        const index = this.middlewareMap.size;
        this.middlewareMap.set(index, middleware);

        return index;
    }

    remove(index: number) {
        return this.middlewareMap.delete(index);
    }

    [Symbol.iterator]() {
        let index = -1;
        let data = Array.from(this.middlewareMap.values()).filter(Boolean) as Middleware<any>[];
        
        return {
            next: () => ({value: data[++index], done: !(index in data)})
        };
    }
}