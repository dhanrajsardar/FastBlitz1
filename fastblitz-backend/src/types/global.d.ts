// src/types/global.d.ts
declare module 'redis' {
  export interface RedisClientType {
    isOpen: boolean;
    on(event: string, listener: (...args: any[]) => void): this;
    connect(): Promise<this>;
    quit(): Promise<void>;
    get(key: string): Promise<string | null>;
    setEx(key: string, seconds: number, value: string): Promise<'OK'>;
    del(key: string): Promise<number>;
  }
  export function createClient(options?: any): RedisClientType;
}

declare module '@fastify/sensible' {
  const plugin: import('fastify').FastifyPluginAsync;
  export default plugin;
}

declare module '@fal-ai/client' {
  export interface SubmitOptions<T> {
    prompt?: string;
    image_url?: string;
    duration?: number;
    aspect_ratio?: string;
    callback_url?: string;
  }
  export interface QueueStatusOptions {
    requestId: string;
    logs?: boolean;
  }
  export interface QueueStatus {
    status: string;
    request_id: string;
    logs?: any[];
  }
  export interface BaseQueueOptions {
    requestId: string;
  }
  export interface Result<T> {
    data: T;
  }
  export interface FalClient {
    config(options: { credentials: string }): void;
    queue: {
      submit<T>(modelId: string, options: SubmitOptions<T>): Promise<{ request_id: string }>;
      status<T>(modelId: string, options: QueueStatusOptions): Promise<QueueStatus>;
      result<T>(modelId: string, options: BaseQueueOptions): Promise<Result<T>>;
    };
  }
  export const fal: FalClient;
}

declare module '@elevenlabs/elevenlabs-js' {
  export class ElevenLabsClient {
    constructor(options: { apiKey: string });
    generate(options: { text: string; voice?: string; model_id?: string }): Promise<{
      arrayBuffer(): Promise<ArrayBuffer>;
    }>;
  }
}

declare module 'bullmq' {
  export interface QueueOptions {
    connection: any;
    defaultJobOptions?: any;
  }
  export interface WorkerOptions {
    connection: any;
    concurrency?: number;
    limiter?: { max: number; duration: number };
    maxStalledCount?: number;
    stalledInterval?: number;
  }
  export interface JobOptions {
    removeOnComplete?: number | boolean;
    removeOnFail?: number | boolean;
    attempts?: number;
    backoff?: { type: string; delay: number };
    delay?: number;
  }
  export interface Job<T = any> {
    id: string | undefined;
    name: string;
    data: T;
    progress: number;
    updateProgress(progress: number): Promise<void>;
  }
  export class Queue<T = any> {
    constructor(name: string, options: QueueOptions);
    add(name: string, data: T, options?: JobOptions): Promise<Job<T>>;
    close(): Promise<void>;
  }
  export class Worker<T = any> {
    constructor(name: string, processor: (job: Job<T>) => Promise<any>, options: WorkerOptions);
    on(event: string, listener: (...args: any[]) => void): this;
    close(): Promise<void>;
  }
}

declare module 'prom-client' {
  export class Registry {
    registerMetric(metric: any): void;
  }
  export class Counter {
    constructor(config: { name: string; help: string; labelNames?: string[]; registers?: Registry[] });
    inc(labels?: Record<string, string>): void;
  }
  export class Histogram {
    constructor(config: { name: string; help: string; labelNames?: string[]; buckets?: number[]; registers?: Registry[] });
    observe(labels: Record<string, string>, value: number): void;
  }
  export class Gauge {
    constructor(config: { name: string; help: string; registers?: Registry[] });
    set(value: number): void;
  }
}

declare module 'socket.io' {
  export interface ServerOptions {
    cors?: { origin: string | string[]; credentials: boolean };
    transports?: string[];
  }
  export class Server {
    constructor(httpServer: any, options?: ServerOptions);
    on(event: string, listener: (...args: any[]) => void): this;
    use(middleware: (socket: any, next: (err?: Error) => void) => void): this;
    to(room: string): { emit(event: string, data: any): void };
    decorate(name: string, value: any): void;
  }
  export interface Socket {
    data: any;
    join(room: string): void;
    leave(room: string): void;
    emit(event: string, data: any): void;
    on(event: string, listener: (...args: any[]) => void): this;
    handshake: { auth: any; query: any };
  }
}