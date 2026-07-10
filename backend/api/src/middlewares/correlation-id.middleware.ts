import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
    req.headers['correlation-id'] = req.headers['correlation-id'] ?? `${req.ip}-${randomUUID()}`;

    next();
}