export class IdleBufferStream extends TransformStream {
    constructor() {
        const buffer: Uint8Array[] = [];
        let finished = false;
        let promise: PromiseLike<void>;
        super({
            start(controller) {
                promise = new Promise<void>((resolve) => { // buffer processor
                    const onIdle = async (deadline: IdleDeadline) => { // when the browser is idle
                        while (deadline.timeRemaining() > 0 && buffer.length) {
                            controller.enqueue(buffer.shift()); // transfer frames from buffer to controller
                        } // until the browser needs control again
                        
                        if (!finished || buffer.length) requestIdleCallback(onIdle); // if we're not finished we go again
                        else resolve(); // if we are finished we resolve the promise
                    }
        
                    requestIdleCallback(onIdle);
                });
            },
            async transform(chunk, controller) {
                chunk = await chunk;
                buffer.push(chunk); // buffer the chunks
                
                if (chunk === null) {
                    return promise; // will terminate the transformer once promise resolves
                }
            },
            flush() {
                finished = true;
                return promise; // will terminate the transformer once the promise resolves
            }
        })
    }
}

export class ProgressStream extends TransformStream {

}

export class GZipTransformStream extends TransformStream {

}

export class ConsoleStream extends TransformStream {
    constructor() {
        super({
            start() {},
            async transform(chunk, controller) {
                chunk = await chunk;

                if (chunk === null) controller.terminate();
                else {
                    controller.enqueue(chunk);
                    console.log(chunk);
                }
                
            },
            flush() {}
        })
    }
}

interface BufferStreamProps {
    onChunk(chunk: Uint8Array): void;
    onEnd(): void;
}

export class BufferStream extends WritableStream {
    constructor(props: BufferStreamProps) {
        const queuingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });
        super({
            write(chunk) {
                return new Promise((resolve, reject) => {
                    if (props.onChunk) props.onChunk(chunk);
                    resolve();
                })
            },
            close() {
                if (props.onEnd) props.onEnd();
            },
            abort(error) {}
        }, queuingStrategy);
    }
}