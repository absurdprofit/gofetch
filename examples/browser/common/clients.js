import gofetch from '../../../build/index.mjs';
import {IdleTransformStream} from '../../../build/common/streams.mjs';
import { deriveKey, DecryptionStream } from './utils.js';

const videoClient = gofetch.createInstance(new URL('./examples/browser/videos', window.location.origin));
videoClient.use({
    onResponse: async (config) => {
        let body = config.body;
        const {readable, writable} = new TransformStream();
        if (body) {
            body
            .pipeThrough(new IdleTransformStream())
            .pipeThrough(new DecompressionStream('gzip'))   
            .pipeTo(writable);
        }

        return {
            body: readable
        };
    }
});

export {videoClient};

const encryptedClient = gofetch.createInstance(new URL('./examples/browser/videos', window.location.origin));
encryptedClient.use({
    onResponse: async (config) => {
        let body = config.body;
        const {readable, writable} = new TransformStream();
        if (body) {
            const key = await deriveKey('absurdprofit1234');            
            body
            .pipeThrough(new IdleTransformStream())
            .pipeThrough(new DecryptionStream(key))   
            .pipeThrough(new DecompressionStream('gzip'))
            .pipeTo(writable);
        }

        return {
            options: config.options,
            body: readable
        };
    }
});

export {encryptedClient};