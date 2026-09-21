# 🗺️ FoodRecommend - Kế Hoạch Phát Triển Dự Án

**Version**: 1.0  
**Last Updated**: 2026-09-21  
**Status**: Active Development  
**Owner**: Development Team

---

## 📋 Mục Lục

1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Đánh Giá Trạng Thái Hiện Tại](#đánh-giá-trạng-thái-hiện-tại)
3. [Phân Tích SWOT](#phân-tích-swot)
4. [Kế Hoạch Phát Triển Theo Giai Đoạn](#kế-hoạch-phát-triển-theo-giai-đoạn)
5. [Chi Tiết Các Phase](#chi-tiết-các-phase)
6. [Quản Lý Rủi Ro](#quản-lý-rủi-ro)
7. [Đo Lường Thành Công](#đo-lường-thành-công)
8. [Khuyến Nghị & Next Steps](#khuyến-nghị--next-steps)
9. [Phụ Lục](#phụ-lục)

---

## 1. Tổng Quan Dự Án

### 1.1 Tầm Nhìn
Xây dựng nền tảng AI-powered giúp người dùng quyết định "Ăn gì, ở đâu, đặt như thế nào" thông qua gợi ý cá nhân hóa, học hỏi từ hành vi, và tích hợp liền mạch với các nền tảng giao đồ ăn.

### 1.2 Công Nghệ Sử Dụng
- **Backend**: Node.js 20, Express 5, TypeScript
- **Database**: PostgreSQL 15, Redis 7
- **AI/ML**: Qdrant (Vector DB), Gemini API, Transformers.js
- **Message Queue**: Kafka
- **Frontend**: Flutter 3.x
- **Testing**: Jest, Supertest, Flutter Test, K6
- **Infrastructure**: Docker, GitHub Actions

### 1.3 Kiến Trúc Hệ Thống
```
┌─────────────────┐
│   Flutter App   │
└────────┬────────┘
         │
┌────────▼────────┐
│  API Gateway    │ (Nginx/Kong)
└────────┬────────┘
         │
┌────────▼────────┐
│  Node.js API    │
└┬──────┬──────┬──┘
 │      │      │
┌▼──┐ ┌▼───┐ ┌▼──────┐
│PG │ │Redis│ │Qdrant │
└───┘ └────┘ └───────┘
         │
    ┌────▼─────┐
    │  Kafka   │
    └──────────┘
```

---

## 2. Đánh Giá Trạng Thái Hiện Tại

### 2.1 Tiến Độ Tổng Thể

| Thành Phần | Trạng Thái | Tiến Độ | Ghi Chú |
|------------|------------|---------|---------|
| **Infrastructure** | ✅ Hoàn thành | 100% | PostgreSQL, Redis, Qdrant, Kafka |
| **AI Pipeline** | ✅ Hoạt động | 95% | 3-tier routing, cần optimize |
| **Authentication** | ✅ Hoàn thành | 100% | JWT, login/register |
| **Tab 1 (Social)** | 🟡 Cơ bản | 80% | API + UI, thiếu pagination |
| **Tab 2 (Group)** | 🟡 Cơ bản | 75% | API working, UI basic |
| **Tab 3 (Recommend)** | 🟡 Cơ bản | 85% | AI routing + swipe |
| **Tab 4 (Profile)** | ✅ Hoàn thành | 90% | API + UI |
| **Tab 5 (Settings)** | ✅ Hoàn thành | 90% | API + UI |
| **Testing** | ✅ Tốt | 85% | 62 unit + integration tests |
| **Security** | ❌ Yếu | 30% | Nhiều vulnerabilities |
| **Observability** | ❌ Thiếu | 10% | Chưa có logging/metrics |
| **Deployment** | ⏳ Sẵn sàng | 70% | Docker ready, thiếu CI/CD |

**Tiến độ tổng thể: ~75% MVP**

### 2.2 Điểm Mạnh Đã Đạt Được

#### ✅ Infrastructure Vững Chắc
- PostgreSQL với schema chuẩn hóa
- Redis caching layer
- Qdrant vector database cho AI
- Kafka message queue
- Docker Compose one-command deployment

#### ✅ AI Pipeline Hiện Đại
- **Fast Tier**: Qdrant vector search + allergy filtering
- **Medium Tier**: Borda Count aggregation cho group
- **Deep Tier**: Gemini LLM với validation
- Event-driven với Kafka
- Singleton embedding model

#### ✅ Test Coverage Tốt
- 62 backend unit tests
- 1 integration test suite
- 7 Flutter widget tests
- Tất cả tests passing
- Test infrastructure tự động hóa (test:prepare)

#### ✅ Code Quality
- TypeScript strict mode
- ESLint configured
- Modular architecture
- Clear separation of concerns

### 2.3 Vấn Đề Cần Giải Quyết

#### 🔴 Critical Issues (Phải Fix Ngay)

**1. Security Vulnerabilities**
```typescript
// IDOR: User có thể access bất kỳ user nào
GET /api/users/:id  // Không check ownership
PUT /api/users/:id/preferences  // Không check ownership

// Missing Authorization
GET /api/groups/:id  // Không check membership
POST /api/groups/:id/orders  // Không check membership
Socket.IO  // Không check membership trước khi join/send

// Mock Token Bypass
if (token === 'mock.jwt.token') {  // Line 22-25 authMiddleware.ts
  req.user = { userId: 'hardcoded-id' };  // SECURITY RISK
  return next();
}

// Hard-coded Secrets
const JWT_SECRET = 'dev-secret-key-123456';  // Không dùng env var
```

**2. SQL Injection Risk**
```typescript
// Social feed query (đã fix một phần nhưng vẫn còn risk)
const query = `... WHERE post_type = '${type}' ...`;  // String interpolation
```

**3. Input Validation Thiếu**
- Không validate/sanitize input
- Không có request body schema validation
- Không có rate limiting

#### 🟡 High Priority Issues

**1. Database Migrations**
- Chỉ dùng `schema.sql` - không có version control
- Khó rollback khi có lỗi
- Không có migration tool

**2. Error Handling**
- Không có centralized error handler
- Error messages không chuẩn hóa
- Thiếu error tracking (Sentry)

**3. Observability**
- Không có structured logging
- Không có metrics (Prometheus)
- Không có APM (New Relic/DataDog)
- Không có distributed tracing

**4. Frontend Gaps**
- Delivery links hard-coded
- Maps coordinates hard-coded
- Thiếu widget tests cho screens
- Thiếu error boundaries

#### 🟢 Low Priority Issues

**1. Performance**
- Connection pooling cần tuning
- Thiếu caching strategy
- Query optimization chưa done

**2. Documentation**
- API documentation (Swagger) chưa có
- Architecture decision records (ADR) thiếu
- Onboarding guide cho developers

---

## 3. Phân Tích SWOT

### 💪 Strengths (Điểm Mạnh)

1. **Modern Tech Stack**
   - Node.js + TypeScript: Type-safe, maintainable
   - PostgreSQL: ACID compliance, JSONB support
   - Qdrant: High-performance vector search
   - Kafka: Event-driven architecture
   - Flutter: Cross-platform mobile

2. **AI-Powered Features**
   - 3-tier recommendation engine
   - Real-time personalization
   - Group decision optimization (Borda Count)
   - LLM integration (Gemini)

3. **Test Infrastructure**
   - Comprehensive test suite
   - Integration tests
   - Automated test preparation
   - CI/CD ready

4. **Docker-Ready**
   - One-command deployment
   - Reproducible environments
   - Easy scaling

5. **Real-Time Capabilities**
   - Socket.IO cho chat
   - Kafka event streaming
   - Live updates

### ⚠️ Weaknesses (Điểm Yếu)

1. **Security Gaps**
   - IDOR vulnerabilities
   - Missing authorization checks
   - Hard-coded secrets
   - No input validation
   - No rate limiting

2. **Technical Debt**
   - No database migrations
   - Inconsistent error handling
   - Missing observability
   - No APM/monitoring

3. **Frontend Incomplete**
   - Mock data còn tồn tại
   - Hard-coded configurations
   - Thiếu widget tests
   - Missing error states

4. **Documentation Gaps**
   - No API documentation
   - Missing architecture docs
   - No onboarding guide

5. **Performance Unknowns**
   - No performance baselines
   - No load testing results
   - Caching strategy chưa rõ ràng

### 🎯 Opportunities (Cơ Hội)

1. **Market Opportunities**
   - Thị trường food delivery Việt Nam lớn
   - AI-powered recommendation là USP
   - Group decision making chưa có competitor mạnh
   - Mobile-first approach phù hợp thị trường

2. **Technical Opportunities**
   - Cloud deployment (AWS/GCP/Azure)
   - Payment integration (MoMo/ZaloPay)
   - Social features (followers, notifications)
   - AI optimization (caching, A/B testing)

3. **Business Opportunities**
   - Partnership với food delivery platforms
   - Affiliate revenue từ delivery links
   - Premium features (subscription)
   - B2B solution cho restaurants

4. **Growth Opportunities**
   - Expand sang các vertical khác (coffee, grocery)
   - Multi-city expansion
   - Loyalty program
   - Referral system

### ⚡ Threats (Rủi Ro)

1. **Security Threats**
   - Data breach nếu không fix vulnerabilities
   - Compliance issues (GDPR, local laws)
   - API abuse (no rate limiting)

2. **Technical Threats**
   - Performance degradation khi scale
   - Vendor lock-in (Gemini API)
   - Database scalability issues
   - Kafka complexity

3. **Business Threats**
   - Competition từ các app hiện có (ShopeeFood, GrabFood)
   - User acquisition cost cao
   - Low retention rate
   - Monetization challenges

4. **Operational Threats**
   - Small team, limited resources
   - Technical debt accumulation
   - Burnout risk
   - Knowledge silos

---

## 4. Kế Hoạch Phát Triển Theo Giai Đoạn

### 📊 Timeline Tổng Quan

```
Week 1-2: Phase 0 - Security Hardening (CRITICAL)
    ↓
Week 3-5: Phase 1 - Production Readiness (HIGH)
    ↓
Week 6-10: Phase 2 - Feature Completion (MEDIUM)
    ↓
Week 11-16: Phase 3 - Scale & Growth (LOW)
```

### 🎯 Milestones

| Milestone | Target Date | Success Criteria |
|-----------|-------------|------------------|
| **M1: Security Complete** | Week 2 | Tất cả vulnerabilities fixed, security audit passed |
| **M2: Production Ready** | Week 5 | CI/CD pipeline, monitoring, error tracking |
| **M3: Feature Complete** | Week 10 | Tất cả MVP features hoạt động, no mock data |
| **M4: Beta Launch** | Week 12 | Deploy production, 100 beta users |
| **M5: Public Launch** | Week 16 | 1000+ users, payment integration |

---

## 5. Chi Tiết Các Phase

### 🚨 Phase 0: Security Hardening (CRITICAL)

**Thời gian**: 1-2 tuần  
**Mục tiêu**: Fix tất cả security vulnerabilities trước khi deploy production

#### 5.1.1 Tasks

| # | Task | Priority | Effort | Owner | Status |
|---|------|----------|--------|-------|--------|
| 0.1 | Remove mock JWT token bypass | P0 | 1h | Dev | ⏳ |
| 0.2 | Move JWT secret to env variables | P0 | 1h | Dev | ⏳ |
| 0.3 | Add authorization middleware | P0 | 4h | Dev | ⏳ |
| 0.4 | Fix IDOR trong user routes | P0 | 2h | Dev | ⏳ |
| 0.5 | Fix IDOR trong group routes | P0 | 2h | Dev | ⏳ |
| 0.6 | Add membership check cho socket | P0 | 2h | Dev | ⏳ |
| 0.7 | Fix SQL injection trong social feed | P0 | 1h | Dev | ⏳ |
| 0.8 | Add input validation (Zod/Joi) | P0 | 4h | Dev | ⏳ |
| 0.9 | Add rate limiting | P1 | 2h | Dev | ⏳ |
| 0.10 | Add Helmet security headers | P1 | 1h | Dev | ⏳ |
| 0.11 | Security audit với OWASP ZAP | P1 | 2h | Dev | ⏳ |
| 0.12 | Dependency audit (npm audit) | P1 | 1h | Dev | ⏳ |

**Tổng effort**: ~23 giờ (~3 ngày làm việc)

#### 5.1.2 Chi Tiết Implementation

**Task 0.1: Remove Mock JWT Token Bypass**
```typescript
// src/auth/authMiddleware.ts
// XÓA đoạn code này (line 22-25):
if (token === 'mock.jwt.token') {
  req.user = { userId: '3f4d9056-0929-4c6e-9bd4-618bdea0eac4', email: 'user1@example.com' };
  return next();
}

// THAY BẰNG: Chỉ accept real JWT tokens
```

**Task 0.2: Move JWT Secret to Env Variables**
```typescript
// src/auth/authMiddleware.ts
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// .env
JWT_SECRET=your-production-secret-here-min-32-chars
```

**Task 0.3: Add Authorization Middleware**
```typescript
// src/middleware/authorization.ts
export const requireOwnership = (resourceType: 'user' | 'group') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const resourceId = req.params.id;

    if (resourceType === 'user') {
      if (userId !== resourceId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      return next();
    }

    if (resourceType === 'group') {
      const membership = await db.query(
        'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
        [resourceId, userId]
      );
      if (membership.rowCount === 0) {
        return res.status(403).json({ error: 'Not a member of this group' });
      }
      return next();
    }
  };
};

// Usage trong routes:
router.get('/users/:id', authenticateToken, requireOwnership('user'), getUserProfile);
router.get('/groups/:id', authenticateToken, requireOwnership('group'), getGroupDetails);
```

**Task 0.6: Add Membership Check cho Socket**
```typescript
// src/socket/index.ts
socket.on('join_group', async (groupId: string) => {
  const userId = (socket as AuthenticatedSocket).user?.userId;
  
  // Check membership
  const membership = await db.query(
    'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
    [groupId, userId]
  );
  
  if (membership.rowCount === 0) {
    socket.emit('error', { message: 'Not a member of this group' });
    return;
  }
  
  socket.join(`group_${groupId}`);
  console.log(`User ${userId} joined group_${groupId}`);
});
```

**Task 0.8: Add Input Validation với Zod**
```typescript
// src/validators/auth.validator.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  fullName: z.string().min(2).max(100)
});

// Usage trong routes:
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    // ... login logic
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    // ...
  }
});
```

**Task 0.9: Add Rate Limiting**
```typescript
// Install: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

// General rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later'
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
```

#### 5.1.3 Definition of Done

- ✅ Tất cả endpoints yêu cầu authentication (ngoại trừ /api/auth/*)
- ✅ User chỉ access được data của mình (IDOR fixed)
- ✅ Group/order/socket check membership trước khi cho phép action
- ✅ Không còn hard-coded secrets (tất cả trong env vars)
- ✅ Input validation trên tất cả endpoints
- ✅ Rate limiting configured
- ✅ Security headers (Helmet) enabled
- ✅ Security audit passed (OWASP ZAP scan)
- ✅ Dependency audit clean (npm audit fix)
- ✅ All tests passing

#### 5.1.4 Testing

```bash
# Security tests
npm run test:security

# Manual testing
# 1. Try accessing other user's profile → should get 403
# 2. Try joining group without membership → should get 403
# 3. Try sending socket message without membership → should get error
# 4. Try invalid input → should get 400 with validation errors
# 5. Try brute force login → should get rate limited after 5 attempts
```

---

### 🎯 Phase 1: Production Readiness (HIGH)

**Thời gian**: 3-5 tuần  
**Mục tiêu**: Sẵn sàng deploy lên production environment

#### 5.2.1 Sub-Phases

**Phase 1.1: Database Migrations (Week 1)**
**Phase 1.2: Error Handling & Logging (Week 2)**
**Phase 1.3: Observability (Week 3)**
**Phase 1.4: Performance Optimization (Week 4)**
**Phase 1.5: CI/CD Pipeline (Week 5)**

#### 5.2.2 Phase 1.1: Database Migrations

**Mục tiêu**: Implement proper database migration system

**Tasks**:
1. Cài đặt migration tool (knex hoặc db-migrate)
2. Convert schema.sql thành migration files
3. Tạo migration cho user_swipes table
4. Setup migration scripts trong package.json
5. Document migration workflow
6. Add seed fixtures cho testing

**Implementation**:
```bash
# Install knex
npm install knex

# Init knex
npx knex init

# Create migrations
npx knex migrate:make create_users_table
npx knex migrate:make create_restaurants_table
# ... etc
```

**Migration example**:
```typescript
// migrations/20260921000001_create_users_table.ts
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('full_name');
    table.boolean('is_reviewer').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
```

**Package.json scripts**:
```json
{
  "scripts": {
    "migrate:latest": "knex migrate:latest",
    "migrate:rollback": "knex migrate:rollback",
    "migrate:make": "knex migrate:make",
    "seed:run": "knex seed:run"
  }
}
```

#### 5.2.3 Phase 1.2: Error Handling & Logging

**Mục tiêu**: Centralized error handling và structured logging

**Tasks**:
1. Tạo centralized error handler middleware
2. Define custom error classes
3. Install và configure Winston/Pino logger
4. Add request/response logging
5. Setup Sentry cho error tracking
6. Document error handling patterns

**Implementation**:
```typescript
// src/errors/CustomErrors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/CustomErrors';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: (req as any).user?.userId
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Unexpected errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;
```

**Sentry integration**:
```typescript
// src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.requestHandler());
// ... routes
app.use(Sentry.Handlers.errorHandler());
```

#### 5.2.4 Phase 1.3: Observability

**Mục tiêu**: Implement monitoring, metrics, và APM

**Tasks**:
1. Setup Prometheus metrics endpoint
2. Add custom metrics (request count, latency, errors)
3. Setup Grafana dashboards
4. Add health check endpoints
5. Configure alert rules
6. Setup APM (New Relic hoặc DataDog)

**Implementation**:
```typescript
// src/middleware/metrics.ts
import promClient from 'prom-client';

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

export const metricsMiddleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();
  
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode });
    httpRequestTotal.inc({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode });
  });
  
  next();
};

export const metricsHandler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};
```

**Health check**:
```typescript
// src/routes/health.ts
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      qdrant: await checkQdrant(),
      kafka: await checkKafka()
    }
  };
  
  const statusCode = Object.values(health.checks).every(c => c.status === 'ok') ? 200 : 503;
  res.status(statusCode).json(health);
});
```

#### 5.2.5 Phase 1.4: Performance Optimization

**Mục tiêu**: Optimize performance và establish baselines

**Tasks**:
1. Analyze slow queries với EXPLAIN ANALYZE
2. Add database indexes
3. Implement Redis caching strategy
4. Connection pooling tuning
5. Load testing với K6
6. Document performance baselines

**Implementation**:
```typescript
// src/utils/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },
  
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  },
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};

// Usage trong services:
async function getUserProfile(userId: string) {
  const cacheKey = `user:profile:${userId}`;
  
  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  
  // Fetch from database
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  
  // Cache for 1 hour
  await cache.set(cacheKey, user, 3600);
  
  return user;
}
```

**Database indexes**:
```sql
-- migrations/20260921000010_add_indexes.ts
exports.up = function(knex) {
  return knex.schema
    .raw('CREATE INDEX idx_users_email ON users(email)')
    .raw('CREATE INDEX idx_group_members_user_id ON group_members(user_id)')
    .raw('CREATE INDEX idx_group_messages_group_id ON group_messages(group_id, created_at DESC)')
    .raw('CREATE INDEX idx_posts_user_id ON posts(user_id, created_at DESC)')
    .raw('CREATE INDEX idx_dishes_restaurant_id ON dishes(restaurant_id)');
};
```

#### 5.2.6 Phase 1.5: CI/CD Pipeline

**Mục tiêu**: Automate testing và deployment

**Tasks**:
1. Setup GitHub Actions workflow
2. Add automated testing (unit + integration)
3. Docker image build + push
4. Staging deployment
5. Production deployment (blue/green)
6. Add deployment notifications

**Implementation**:
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Run integration tests
        run: |
          docker compose up -d
          npm run test:prepare
          npm run test:integration
          docker compose down
  
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t foodrecommend:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          docker tag foodrecommend:${{ github.sha }} registry.example.com/foodrecommend:${{ github.sha }}
          docker push registry.example.com/foodrecommend:${{ github.sha }}
  
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          kubectl set image deployment/foodrecommend foodrecommend=registry.example.com/foodrecommend:${{ github.sha }}
  
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Blue/green deployment
          kubectl set image deployment/foodrecommend-blue foodrecommend=registry.example.com/foodrecommend:${{ github.sha }}
          # Switch traffic
          kubectl patch service foodrecommend -p '{"spec":{"selector":{"version":"blue"}}}'
```

#### 5.2.7 Definition of Done (Phase 1)

- ✅ Database migrations working
- ✅ Centralized error handling
- ✅ Structured logging
- ✅ Error tracking (Sentry)
- ✅ Prometheus metrics
- ✅ Grafana dashboards
- ✅ Health check endpoints
- ✅ Performance baselines established
- ✅ CI/CD pipeline working
- ✅ Automated testing in CI
- ✅ Docker image build + push
- ✅ Staging deployment
- ✅ Production deployment

---

### 🚀 Phase 2: Feature Completion (MEDIUM)

**Thời gian**: 5-7 tuần  
**Mục tiêu**: Hoàn thiện tất cả MVP features

#### 5.3.1 Sub-Phases

**Phase 2.1: Frontend Polish (Week 1-2)**
**Phase 2.2: Group Features (Week 3-4)**
**Phase 2.3: Social Features (Week 5-6)**
**Phase 2.4: AI Pipeline Optimization (Week 7)**

#### 5.3.2 Phase 2.1: Frontend Polish

**Mục tiêu**: Hoàn thiện UI/UX và tích hợp third-party services

**Tasks**:
1. Google Maps SDK integration
2. Delivery deep links (Grab/ShopeeFood/BeFood)
3. Widget tests cho tất cả screens
4. Error/retry states
5. Loading skeletons
6. Pull-to-refresh
7. Responsive design improvements

**Google Maps Integration**:
```dart
// pubspec.yaml
dependencies:
  google_maps_flutter: ^2.5.0

// lib/services/maps_service.dart
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapsService {
  static Future<void> openMapsDirection(double lat, double lng, String label) async {
    // Use actual Google Maps intent
    final url = 'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng';
    if (await canLaunch(url)) {
      await launch(url);
    }
  }
}

// lib/screens/recommendation/recommendation_screen.dart
Widget _buildMapButton() {
  return IconButton(
    icon: Icon(Icons.map),
    onPressed: () {
      if (_recommendations.isNotEmpty) {
        final dish = _recommendations.first;
        MapsService.openMapsDirection(
          dish['lat'],
          dish['lng'],
          dish['restaurant_name']
        );
      }
    }
  );
}
```

**Delivery Deep Links**:
```dart
// lib/services/delivery_link_service.dart
class DeliveryLinkService {
  static Future<void> openGrabFood(String restaurantName) async {
    final query = Uri.encodeComponent(restaurantName);
    final url = 'grab://open?screenType=GRABFOOD&searchQuery=$query';
    
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      // Fallback to web
      await launch('https://food.grab.com/vn/vi/restaurants?search=$query');
    }
  }
  
  static Future<void> openShopeeFood(String restaurantName) async {
    final query = Uri.encodeComponent(restaurantName);
    await launch('https://shopeefood.vn/ho-chi-minh/danh-sach-dia-diem-giao-tan-noi?q=$query');
  }
}
```

#### 5.3.3 Phase 2.2: Group Features

**Mục tiêu**: Hoàn thiện group decision making features

**Tasks**:
1. Group voting UI
2. Real-time chat optimization
3. Group recommendation improvements
4. Split bill enhancements

**Group Voting UI**:
```dart
// lib/screens/group/group_voting_screen.dart
class GroupVotingScreen extends StatefulWidget {
  // ... implementation
  
  Widget _buildRestaurantCard(Restaurant restaurant) {
    final hasVoted = _votes.contains(restaurant.id);
    
    return Card(
      child: ListTile(
        title: Text(restaurant.name),
        subtitle: Text('${restaurant.voteCount} votes'),
        trailing: IconButton(
          icon: Icon(hasVoted ? Icons.check_circle : Icons.circle_outlined),
          onPressed: () => _toggleVote(restaurant.id)
        )
      )
    );
  }
  
  Future<void> _toggleVote(String restaurantId) async {
    if (_votes.contains(restaurantId)) {
      await _api.removeVote(restaurantId);
      setState(() => _votes.remove(restaurantId));
    } else {
      await _api.addVote(restaurantId);
      setState(() => _votes.add(restaurantId));
    }
  }
}
```

**Real-time Chat Optimization**:
```dart
// lib/screens/group/group_chat_screen.dart
class GroupChatScreen extends StatefulWidget {
  // ... implementation
  
  @override
  void initState() {
    super.initState();
    _socket.on('new_message', (data) {
      setState(() {
        _messages.insert(0, Message.fromJson(data));
      });
    });
  }
  
  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;
    
    final message = {
      'groupId': widget.groupId,
      'text': text,
      'timestamp': DateTime.now().toIso8601String()
    };
    
    _socket.emit('send_message', message);
    setState(() {
      _messages.insert(0, Message.fromJson({
        ...message,
        'sender_id': _userId,
        'sender_name': _userName
      }));
    });
  }
}
```

#### 5.3.4 Phase 2.3: Social Features

**Mục tiêu**: Hoàn thiện social features (pagination, notifications)

**Tasks**:
1. Pagination cho feed
2. Infinite scroll
3. Like/comment/follow APIs
4. Notification system (WebSocket)

**Pagination**:
```typescript
// src/api/social.routes.ts
router.get('/feed', async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  
  const posts = await db.query(
    `SELECT * FROM posts 
     ORDER BY created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  
  const total = await db.query('SELECT COUNT(*) FROM posts');
  
  res.json({
    data: posts.rows,
    pagination: {
      page,
      limit,
      total: parseInt(total.rows[0].count),
      totalPages: Math.ceil(parseInt(total.rows[0].count) / limit)
    }
  });
});
```

**Notification System**:
```typescript
// src/socket/index.ts
socket.on('like_post', async (postId: string) => {
  const userId = (socket as AuthenticatedSocket).user?.userId;
  
  // Save like to database
  await db.query(
    'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
    [postId, userId]
  );
  
  // Get post owner
  const post = await db.query(
    'SELECT user_id FROM posts WHERE id = $1',
    [postId]
  );
  
  // Send notification to post owner
  io.to(`user_${post.rows[0].user_id}`).emit('notification', {
    type: 'like',
    fromUserId: userId,
    postId: postId,
    timestamp: new Date().toISOString()
  });
});
```

#### 5.3.5 Phase 2.4: AI Pipeline Optimization

**Mục tiêu**: Optimize AI recommendation performance

**Tasks**:
1. A/B testing framework
2. Feedback loop (user ratings → retrain)
3. Caching recommendations (Redis)
4. Batch inference cho popular queries

**A/B Testing**:
```typescript
// src/utils/abTesting.ts
export class ABTest {
  static getVariant(userId: string, testName: string): 'A' | 'B' {
    // Simple hash-based assignment
    const hash = this.hashString(userId + testName);
    return hash % 2 === 0 ? 'A' : 'B';
  }
  
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Usage:
const variant = ABTest.getVariant(userId, 'recommendation_algorithm');
const recommendations = variant === 'A' 
  ? await fastTierRecommender.getRecommendations(userId, context)
  : await newAlgorithm.getRecommendations(userId, context);
```

**Recommendation Caching**:
```typescript
// src/recommendation/engine.ts
async function getRecommendations(userId: string, context: ContextParams) {
  const cacheKey = `recommendations:${userId}:${JSON.stringify(context)}`;
  
  // Try cache first (5 minutes TTL)
  const cached = await cache.get(cacheKey);
  if (cached) {
    logger.info('Cache hit for recommendations', { userId });
    return cached;
  }
  
  // Generate recommendations
  const recommendations = await generateRecommendations(userId, context);
  
  // Cache for 5 minutes
  await cache.set(cacheKey, recommendations, 300);
  
  logger.info('Cache miss, generated recommendations', { userId });
  return recommendations;
}
```

#### 5.3.6 Definition of Done (Phase 2)

- ✅ Google Maps SDK integrated
- ✅ Delivery deep links working (Grab/ShopeeFood/BeFood)
- ✅ Widget tests cho tất cả screens
- ✅ Error/retry states implemented
- ✅ Group voting UI complete
- ✅ Real-time chat optimized
- ✅ Social feed pagination
- ✅ Notification system working
- ✅ A/B testing framework
- ✅ Recommendation caching
- ✅ All mock data removed
- ✅ UI/UX polished

---

### 📈 Phase 3: Scale & Growth (LOW)

**Thời gian**: 2-4 tuần  
**Mục tiêu**: Chuẩn bị cho production traffic và user growth

#### 5.4.1 Sub-Phases

**Phase 3.1: Infrastructure (Week 1-2)**
**Phase 3.2: Payment Integration (Week 2-3)**
**Phase 3.3: Advanced Features (Week 3-4)**
**Phase 3.4: Security Audit (Week 4)**

#### 5.4.2 Phase 3.1: Infrastructure

**Mục tiêu**: Scale infrastructure cho production traffic

**Tasks**:
1. Kubernetes deployment
2. Horizontal pod autoscaling
3. Database read replicas
4. Multi-region deployment
5. Disaster recovery plan

**Kubernetes Deployment**:
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foodrecommend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: foodrecommend
  template:
    metadata:
      labels:
        app: foodrecommend
    spec:
      containers:
      - name: foodrecommend
        image: registry.example.com/foodrecommend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: foodrecommend-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: foodrecommend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: foodrecommend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

#### 5.4.3 Phase 3.2: Payment Integration

**Mục tiêu**: Tích hợp thanh toán online

**Tasks**:
1. MoMo integration
2. ZaloPay integration
3. Order history
4. Refund flow
5. Invoice generation

**MoMo Integration**:
```typescript
// src/services/payment.service.ts
import crypto from 'crypto';

export class MomoService {
  private partnerCode = process.env.MOMO_PARTNER_CODE;
  private accessKey = process.env.MOMO_ACCESS_KEY;
  private secretKey = process.env.MOMO_SECRET_KEY;
  
  async createPayment(orderId: string, amount: number, orderInfo: string) {
    const requestId = this.generateRequestId();
    const extraData = '';
    const orderGroupId = '';
    const autoCapture = true;
    const lang = 'vi';
    
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${process.env.MOMO_IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${process.env.MOMO_REDIRECT_URL}&requestId=${requestId}&requestType=captureWallet`;
    
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');
    
    const requestBody = {
      partnerCode: this.partnerCode,
      partnerName: 'FoodRecommend',
      storeId: 'FoodRecommend',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: process.env.MOMO_REDIRECT_URL,
      ipnUrl: process.env.MOMO_IPN_URL,
      lang,
      requestType: 'captureWallet',
      autoCapture,
      orderGroupId,
      signature,
      extraData
    };
    
    const response = await fetch('https://test-payment.momo.vn/v2/gateway/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    return await response.json();
  }
  
  private generateRequestId(): string {
    return crypto.randomUUID();
  }
}
```

#### 5.4.4 Phase 3.3: Advanced Features

**Mục tiêu**: Thêm features nâng cao

**Tasks**:
1. Push notifications (Firebase)
2. Email/SMS notifications
3. Loyalty program
4. Referral system
5. Analytics dashboard

**Push Notifications**:
```typescript
// src/services/notification.service.ts
import admin from 'firebase-admin';

export class NotificationService {
  static async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    const user = await db.query(
      'SELECT device_token FROM users WHERE id = $1',
      [userId]
    );
    
    if (!user.rows[0]?.device_token) return;
    
    const message = {
      notification: { title, body },
      data: data || {},
      token: user.rows[0].device_token
    };
    
    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}
```

#### 5.4.5 Phase 3.4: Security Audit

**Mục tiêu**: Comprehensive security audit

**Tasks**:
1. Penetration testing
2. OWASP ZAP scan
3. Dependency audit (Snyk)
4. Security headers audit
5. HTTPS enforcement
6. Security documentation

---

## 6. Quản Lý Rủi Ro

### 6.1 Risk Matrix

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Security breach | High | Critical | Phase 0 security hardening, regular audits |
| Performance degradation | Medium | High | Caching, optimization, monitoring |
| Data loss | Low | Critical | Backup strategy, migrations, disaster recovery |
| Gemini API quota/timeout | Medium | Medium | Fallback mechanisms, caching, rate limiting |
| Kafka failure | Low | High | Retry logic, dead letter queue, monitoring |
| Frontend crashes | Medium | Medium | Error boundaries, Sentry, testing |
| Low user adoption | Medium | High | User research, A/B testing, marketing |
| Competition | High | Medium | Differentiation, unique features, partnerships |
| Technical debt | High | Medium | Regular refactoring, code reviews |
| Team burnout | Medium | High | Realistic timelines, work-life balance |

### 6.2 Mitigation Plans

#### 6.2.1 Security Breach

**Prevention**:
- Phase 0 security hardening
- Regular security audits (quarterly)
- Dependency updates (weekly)
- Security training for team

**Response Plan**:
1. Isolate affected systems
2. Assess impact
3. Notify users (if required by law)
4. Fix vulnerabilities
5. Post-mortem analysis
6. Update security policies

#### 6.2.2 Performance Degradation

**Prevention**:
- Performance monitoring (Prometheus + Grafana)
- Load testing trước mỗi release
- Caching strategy
- Database optimization

**Response Plan**:
1. Identify bottleneck (APM)
2. Scale horizontally (Kubernetes HPA)
3. Enable emergency caching
4. Optimize slow queries
5. Deploy hotfix

#### 6.2.3 Data Loss

**Prevention**:
- Daily database backups (pg_dump)
- Store backups in S3 (30-day retention)
- Database replication (read replicas)
- Regular backup testing

**Response Plan**:
1. Stop application
2. Restore from latest backup
3. Verify data integrity
4. Restart application
5. Investigate root cause
6. Update backup strategy

---

## 7. Đo Lường Thành Công

### 7.1 Technical KPIs

| KPI | Target | Current | Status |
|-----|--------|---------|--------|
| **Uptime** | >99.5% | N/A | ⏳ |
| **Response time (p95)** | <500ms | ~800ms | 🟡 |
| **Error rate** | <1% | ~2% | 🟡 |
| **Test coverage** | >80% | 75% | 🟡 |
| **Deployment frequency** | Weekly | Manual | 🟡 |
| **Mean time to recovery** | <1 hour | N/A | ⏳ |

### 7.2 Business KPIs

| KPI | Target | Current | Status |
|-----|--------|---------|--------|
| **User retention (7-day)** | >40% | N/A | ⏳ |
| **Recommendation CTR** | >15% | N/A | ⏳ |
| **Swipe completion rate** | >70% | N/A | ⏳ |
| **Group order conversion** | >20% | N/A | ⏳ |
| **Daily active users** | 1000+ | 0 | ⏳ |
| **Monthly revenue** | $5000+ | $0 | ⏳ |

### 7.3 Monitoring Dashboard

**Grafana Dashboards**:
1. **Overview**: Uptime, response time, error rate
2. **API Performance**: Latency by endpoint, throughput
3. **Database**: Query performance, connection pool
4. **AI Pipeline**: Recommendation latency, cache hit rate
5. **Business Metrics**: User activity, conversion rates

---

## 8. Khuyến Nghị & Next Steps

### 8.1 Immediate Actions (This Week)

1. ✅ **Bắt đầu Phase 0: Security Hardening**
   - Assign tasks to team members
   - Setup security testing environment
   - Fix critical vulnerabilities (mock JWT, IDOR)

2. ✅ **Setup Monitoring**
   - Install Sentry for error tracking
   - Setup basic logging

3. ✅ **Plan Phase 1**
   - Research migration tools (knex vs db-migrate)
   - Design error handling architecture

### 8.2 Short-term Goals (Next 2 Weeks)

1. ✅ Complete Phase 0 (Security)
2. ✅ Start Phase 1.1 (Database Migrations)
3. ✅ Setup CI/CD pipeline (basic)
4. ✅ Deploy to staging environment

### 8.3 Medium-term Goals (Next Month)

1. ✅ Complete Phase 1 (Production Readiness)
2. ✅ Start Phase 2 (Feature Completion)
3. ✅ Launch beta with 100 users
4. ✅ Collect user feedback

### 8.4 Long-term Goals (Next Quarter)

1. ✅ Complete Phase 2 & 3
2. ✅ Public launch
3. ✅ Reach 1000+ users
4. ✅ Integrate payment
5. ✅ Generate revenue

### 8.5 Resource Requirements

**Team**:
- 2 Backend developers
- 1 Frontend developer
- 1 DevOps engineer (part-time)
- 1 QA engineer (part-time)

**Infrastructure Costs** (Estimated):
- Cloud hosting: $200-500/month
- Database: $100-300/month
- Monitoring: $50-100/month
- Third-party services: $100-200/month
- **Total**: $450-1100/month

### 8.6 Success Criteria

**Phase 0 Success**:
- All security vulnerabilities fixed
- Security audit passed
- No critical issues in penetration test

**Phase 1 Success**:
- CI/CD pipeline operational
- Monitoring/alerting setup
- Production deployment successful
- 99.5% uptime for 1 week

**Phase 2 Success**:
- All MVP features complete
- No mock data
- 100 beta users
- 40% 7-day retention

**Phase 3 Success**:
- 1000+ daily active users
- Payment integration working
- $5000+ monthly revenue
- Positive unit economics

---

## 9. Phụ Lục

### 9.1 Tài Liệu Tham Khảo

- [FoodRecommend Product Specification](./FoodRecommend_Product_Specification.md)
- [Product Design Document](./ProductDesignDocument.md)
- [Module Progress](./Module_Progress.md)
- [Testing Guide](./TESTING.md)
- [README](./README.md)

### 9.2 Liên Hệ

**Project Lead**: [Name]  
**Email**: [email@example.com]  
**Slack**: #foodrecommend-dev

### 9.3 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-21 | Initial roadmap created |

---

**End of Document**
