interface RetrySignalEventMap {
    "retry": RetryEvent;
}

export interface RetrySignal {
    onretry: ((ev: Event) => any) | null;
    addEventListener<K extends keyof RetrySignalEventMap>(type: K, listener: (ev: RetrySignalEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof RetrySignalEventMap>(type: K, listener: (ev: RetrySignalEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

export class RetrySignal extends EventTarget {
    private _retries: number = 0;
    constructor() {
        super();
        this.addEventListener('retry', (e) => {
            this._retries = e.retries;
            if (this.onretry) this.onretry(e);
        });
    }
    get retries() {
        return this._retries;
    }
}

export class RetryEvent extends Event {
    readonly retries: number;
    
    constructor(retries: number) {
        super('retry', {
            bubbles: false,
            cancelable: false,
            composed: false
        });

        this.retries = retries;
    }
}

export class RetryController {
    readonly signal: RetrySignal = new RetrySignal();
    
    retry() {
        const event = new RetryEvent(this.signal.retries + 1);
        this.signal.dispatchEvent(event);
    }
}