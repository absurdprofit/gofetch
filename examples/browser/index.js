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

class Writable extends WritableStream {
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

const fetch = document.getElementById('fetch');
const code = document.querySelector('code');
const reset = document.getElementById('reset');

if (reset) {
    reset.onclick = () => {
        if (!code) return;
        code.textContent = '';
    }
}
if (fetch) {
    fetch.onclick = () => {
        gofetch.get('https://streams.spec.whatwg.org/demos/data/commits.include')
        .then(async (response) => {
            const body = response.body;
            if (!code || !body) return;
            
            const writable = new Writable({
                onChunk: (chunk) => {
                    code.textContent += chunk;
                }
            });
            body.pipeTo(writable);
        });
    }
}

