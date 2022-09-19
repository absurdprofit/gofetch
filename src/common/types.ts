import { RetryController } from "../RetryController";

export type RequestOrResponse<T extends Request | Response> = T extends Request ? Request : Response;

interface RangeObject {
  start: number;
  end?: number;
}
type RangeArray = [number, number?];
export type Range = RangeObject | RangeArray | number;
// TODO add developer interface for specifying range requests
export type GofetchRequestInit = Partial<Pick<RequestInit, 'cache' | 'credentials' | 'headers' | 'integrity' | 'redirect' | 'referrer' | 'referrerPolicy'>>;
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


export interface RequestConfig<D> {
    body?: BodyInit | ReadableStream<D>;
    options?: GofetchRequestInit;
}

export interface ResponseConfig<D> {
  body: BodyInit | ReadableStream<D> | null;
  options: GofetchResponseInit;
  json(): Promise<D>;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
}

export type ResponseConfigReturn<D> = Pick<ResponseConfig<D>, 'body' | 'options'>;

export interface Middleware<D> {
  onRequest?(config: RequestConfig<D>): PromiseLike<RequestConfig<D>> | RequestConfig<D>;
  onResponse?(config: ResponseConfig<D>): PromiseLike<ResponseConfigReturn<D>> | ResponseConfigReturn<D>;
  onError?(config: ResponseConfig<D>, controller: RetryController): Promise<PromiseLike<ResponseConfigReturn<D>> | ResponseConfigReturn<D> | void>;
}

export type GoFetchMethod = 'GET' | 'POST';