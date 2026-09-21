import promClient from 'prom-client';
import { Request, Response, NextFunction } from 'express';

const register = new promClient.Registry();

// Default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const end = httpRequestDuration.startTimer();
  
  res.on('finish', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routePath = (req as any).route?.path || req.path;
    end({ method: req.method, route: routePath, status_code: res.statusCode });
    httpRequestTotal.inc({ method: req.method, route: routePath, status_code: res.statusCode });
  });
  
  next();
};

export const metricsHandler = async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};
