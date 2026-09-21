# Testing Guide

## Test Layers

### Backend unit and API tests

These tests run without external services. PostgreSQL, Redis, Qdrant, Kafka and Transformers are mocked in `tests/setup.ts`.

```bash
npm test -- --runInBand
npm run test:coverage
```

Coverage includes:

- Auth middleware and auth boundary
- Auth, user, restaurant, social, recommendation and group routes
- Recommendation routing, allergy filtering, Fast/Medium Tier and Feature Store
- Split bill rounding and validation
- Executable authentication and swipe E2E request flows
- Application root/404 boundaries

### Backend infrastructure integration tests

Start Docker dependencies first, prepare seed data and Qdrant vectors, then run:

```bash
npm run test:prepare
npm run test:integration
```

`test:prepare` prints verified PostgreSQL row counts, creates the `user_swipes` table for an existing local volume, upserts 384-dimensional dish vectors into Qdrant and ensures the `swipe-events` Kafka topic exists. It fails if embeddings are missing or counts do not match.

The integration suite is skipped unless `RUN_INTEGRATION_TESTS=true`. It checks PostgreSQL/schema, Redis round-trip, Qdrant availability and Kafka admin connectivity. It uses:

- `DATABASE_URL`
- `REDIS_URL`
- `QDRANT_URL`
- `KAFKA_BROKER`

### Frontend unit and widget tests

```bash
npm run test:flutter
npm run analyze:flutter
```

Coverage includes `AppState` restore/login/logout/guest behavior, API log retention, map distance calculation and application smoke rendering. Screen-specific HTTP tests should use an injectable client before being added.

### Load tests

The k6 scenario is intentionally separate from Jest and requires a running API plus a real test token:

```bash
k6 run tests/load/k6-script.js
```

Set `BASE_URL` and `TEST_TOKEN` in the k6 environment. The scenario validates recommendation latency, swipe status and HTTP error rate.

## CI Contract

Every change must pass:

```bash
npm ci
npm run lint
npm run build
npm test -- --runInBand
npm run test:flutter
npm run analyze:flutter
```

Infrastructure integration and k6 tests run in an environment with the corresponding services; they are not silently treated as unit tests.

## Current Test Status

As of the latest session:

- **Backend unit tests**: 23 suites, 62 tests passed
- **Integration tests**: 1 passed (PostgreSQL, Redis, Qdrant, Kafka connectivity)
- **Flutter tests**: 7 passed (AppState, API logger, maps, smoke test)
- **Build/lint/analyze**: All passed

## Quick Start

To run all tests in sequence:

```bash
# Backend unit tests
npm test -- --runInBand

# Integration tests (requires Docker services running)
docker compose up -d
npm run test:prepare
npm run test:integration

# Flutter tests
npm run test:flutter
npm run analyze:flutter
```

Or use the combined script:

```bash
npm run test:all
```
