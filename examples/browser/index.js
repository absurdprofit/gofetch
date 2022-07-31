import gofetch from '/build/gofetch.js';

class ConsoleStream extends TransformStream {
    constructor() {
        super({
            start() {},
            async transform(chunk, controller) {
                chunk = await chunk;

                if (chunk === null) controller.terminate();
                else {
                    controller.enqueue(chunk);
                    console.log(`${chunk}`);
                }
                
            },
            flush() {}
        })
    }
}

class BufferStream extends WritableStream {
    constructor(props) {
        const queuingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });
        super({
            write(chunk) {
                return new Promise((resolve, reject) => {
                    if (props.onChunk) props.onChunk(chunk);
                    resolve();
                })
            },
            close() {},
            abort(error) {}
        }, queuingStrategy);
    }
}

gofetch.use({
    onResponse: async (config) => {
        let body = config.body;
        const {readable, writable} = new TransformStream();
        if (body) {
            body.pipeThrough(new TextDecoderStream()).pipeTo(writable);
        }

        return {
            options: config.options,
            body: readable
        };
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
    fetchButton.onclick = () => {
        gofetch.get('https://streams.spec.whatwg.org/demos/data/commits.include')
        .then(async (response) => {
            const body = response.body;
            if (!table) return;
            
            const writable = new BufferStream({
                onChunk: (chunk) => {
                    table.innerHTML += chunk;
                }
            });
            body.pipeTo(writable);
        });
    }
}

