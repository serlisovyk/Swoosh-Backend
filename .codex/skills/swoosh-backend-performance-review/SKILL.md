---
name: swoosh-backend-performance-review
description: Use when reviewing Swoosh Server backend code for latency, payload size, Mongo query cost, indexes, pagination, expensive loops, or avoidable external calls.
---

# Swoosh Backend Performance Review

## Focus

- Mongo query shape, indexes, projections, and pagination.
- Avoiding unbounded list responses.
- Avoiding unnecessary external calls in request paths.
- Keeping DTO transforms and filter builders cheap.
- Keeping auth/user lookups minimal and indexed.

## Verification

- Prefer concrete query/index evidence over speculation.
- Call out missing indexes only when tied to a real query path.
