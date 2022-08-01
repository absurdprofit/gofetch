export interface IdleTransformStreamProps<I, O> {
    onStart?(): void;
    onChunk?(chunk: I): O;
    onEnd?(): void;
    writableStrategy?: QueuingStrategy<I>;
    readableStrategy?: QueuingStrategy<O>;
}

export class IdleTransformStream<I, O = I> extends TransformStream<I, O> {
    constructor(props: IdleTransformStreamProps<I, O> = {}) {
        const buffer: (O extends I ? I : O)[] = [];
        let finished = false;
        let promise: PromiseLike<void>;
        super({
            start(controller) {
                promise = new Promise<void>((resolve) => { // buffer processor
                    const onIdle = async (deadline: IdleDeadline) => { // when the browser is idle
                        while (deadline.timeRemaining() > 0 && buffer.length) {
                            controller.enqueue(buffer.shift() as any); // transfer frames from buffer to controller
                        } // until the browser needs control again
                        
                        if (!finished || buffer.length) requestIdleCallback(onIdle); // if we're not finished we go again
                        else resolve(); // if we are finished we resolve the promise
                    }
        
                    requestIdleCallback(onIdle);
                });
            },
            async transform(chunk) {
                chunk = await chunk;
                if (props.onChunk) chunk = props.onChunk(chunk) as any;
                buffer.push(chunk as any); // buffer the chunks
                
                if (chunk === null) {
                    return promise; // will terminate the transformer once promise resolves
                }
            },
            flush() {
                finished = true;
                return promise; // will terminate the transformer once the promise resolves
            }
        }, props.writableStrategy, props.readableStrategy);
    }
}

export class ProgressStream extends TransformStream {

}

export class GZipTransformStream extends TransformStream {

}

export interface LogStreamProps<I> {
    log(value: I): void;
}

export class LogStream<I> extends TransformStream<I, I> {
    constructor({log}: LogStreamProps<I> = {log: console.log}) {
        super({
            start() {},
            async transform(chunk, controller) {
                chunk = await chunk;

                if (chunk === null) controller.terminate();
                else {
                    controller.enqueue(chunk);
                    log(chunk);
                }
                
            },
            flush() {}
        })
    }
}

export interface BufferStreamProps<W> {
    onStart?(): void;
    onChunk?(chunk: W): void;
    onEnd?(): void;
    queuingStrategy?: QueuingStrategy<W>;
}

export class BufferStream<W> extends WritableStream<W> {
    constructor(props: BufferStreamProps<W>) {
        super({
            start() { if (props.onStart) props.onStart(); },
            write(chunk) {
                return new Promise((resolve) => {
                    if (props.onChunk) props.onChunk(chunk);
                    resolve();
                })
            },
            close() {
                if (props.onEnd) props.onEnd();
            },
            abort(error) { return Promise.reject(error); }
        }, props.queuingStrategy);
    }
}