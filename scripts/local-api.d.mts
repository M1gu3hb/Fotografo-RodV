import type { IncomingMessage, ServerResponse } from 'node:http';
export function localApi(req: IncomingMessage, res: ServerResponse, next: () => void): void;
