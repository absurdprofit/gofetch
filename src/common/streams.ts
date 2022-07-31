export class IdleBufferStream extends TransformStream {
    constructor() {
        super({
            start() {},
            async transform(chunk, controller) {
                chunk = await chunk;

                if (chunk === null) controller.terminate();
                requestIdleCallback(() => {
                    controller.enqueue(chunk);
                });
            },
            flush() {}
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