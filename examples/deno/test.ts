// @deno-types="../../build/index.d.ts"
import {Gofetch} from '../../build/index.mjs';
// @deno-types="../../build/common/types.d.ts"
import type {Middleware, RequestConfig} from '../../build/common/types.d.ts';

const gofetch = new Gofetch(new URL('http://localhost:8080/'));

class AuthMiddleware implements Middleware {
    private authToken: string | null = null;
    private authURL = new URL('http://localhost:8080/login');
    private authenticating = false;

    async onRequest(config: RequestConfig) {
        if (this.authenticating) return config; // prevent infinite loop
        if (!this.authToken) {
            // get auth token
            this.authenticating = true;
            const response = await gofetch.get(this.authURL);
            this.authToken = await response.text();
        }

        this.authenticating = false;

        config.options = {
            ...config.options,
            headers: {
                Authorization: `Bearer ${this.authToken}`
            }
        };

        return config;
    }
}

gofetch.use(new AuthMiddleware());

interface Payload {
    message: string;
}

gofetch.get<Payload>('/')
.then(res => res.json())
.then(console.log)
.catch(console.error);

(async function () {
    const res = await gofetch.get('/');
    res.delete()
})();