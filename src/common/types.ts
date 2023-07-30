import { Gofetch } from "../index";
import { RetryController } from "../RetryController";
import { GofetchError } from "./utils";

export type RequestOrResponse<T extends Request | Response> = T extends Request ? Request : Response;

interface RangeObject {
  start: number;
  end?: number;
}
type RangeArray = [number, number?];
export type Range = RangeObject | RangeArray | number;
// TODO add developer interface for specifying range requests
export type GofetchRequestInit = Partial<Pick<RequestInit, 'cache' | 'credentials' | 'headers' | 'integrity' | 'redirect' | 'referrer' | 'referrerPolicy' | 'signal' | 'mode' | 'keepalive' | 'window' | 'method'>>;
export type GofetchResponseInit = Partial<ResponseInit>;

type GetExclusiveKeys<
  T,
  U,
  T0 = Omit<T, keyof U> & Omit<U, keyof T>,
  T1 = {
    [K in keyof T0]: T0[K]
  }
> = T1;

type GetInclusiveKeys<T, U> = Omit<T | U, keyof GetExclusiveKeys<T, U>>;

type Merge<
  T,
  U, 
  // non shared keys are optional
  T0 = GetExclusiveKeys<T, U>
    // shared keys are required
    & { [K in keyof GetInclusiveKeys<T, U>]: T[K] | U[K] },
  T1 = { [K in keyof T0]: T0[K] }
> = T1;

export type DeepMerge<T, U> =
  // check if generic types are arrays and unwrap it and do the recursion
  [T, U] extends [{ [key: string]: unknown}, { [key: string]: unknown } ]
    ? Merge<T, U>
    : T | U;


export interface RequestConfig<B = any> extends GofetchRequestInit {
  body?: BodyInit | ReadableStream<B>;
}

export interface ResponseConfig<B> extends GofetchResponseInit {
  body: BodyInit | ReadableStream<B> | null;
  json<D>(): Promise<D>;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
}

export type ResponseConfigReturn<B = any> = Pick<ResponseConfig<B>, 'body' | 'headers'>;

export type None = null | undefined | void;
export interface Middleware<B = any> {
  onRequest?(config: Gofetch<Request>): Promise<RequestConfig<B> | None> | RequestConfig<B> | None;
  onResponse?(config: Gofetch<Response>): Promise<ResponseConfigReturn<B> | None> | ResponseConfigReturn<B> | None;
  onError?(error: GofetchError, controller: RetryController): Promise<ResponseConfigReturn<B> | None> | ResponseConfigReturn<B> | None;
}

export type GofetchMethod = 'GET' | 'POST' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'DELETE' | 'PUT';

