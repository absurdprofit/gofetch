import gofetch from '../../../build/index.mjs';
import {BufferStream, IdleTransformStream} from '../../../build/common/streams.mjs';

gofetch.use({
    onResponse: async (config) => {
        const {readable, writable} = new TransformStream();
        if (config.body) {
            config.body
            .pipeThrough(new IdleTransformStream())
            .pipeThrough(new TextDecoderStream())
            .pipeTo(writable);
        }

        return {
            body: readable
        };
    },
    onRequest: () => {
        
    }
});

const fetchButton = document.getElementById('fetch');
const resetButton = document.getElementById('reset');
const table = document.getElementById('table');

if (resetButton) {
    resetButton.onclick = () => {
        if (table) {
            table.innerHTML = '';
        }
    }
}
if (fetchButton) {
    fetchButton.onclick = async () => {
        const response = await gofetch.get('https://streams.spec.whatwg.org/demos/data/commits.include');
        const body = response.body;
        if (!table) return;
        
        const writable = new BufferStream({
            onChunk: (chunk) => {
                table.innerHTML += chunk;
                console.log("On Chunk");
            }
        });
        body.pipeTo(writable);
    }
}

