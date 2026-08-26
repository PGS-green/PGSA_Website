# Testing

## Philosophy

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence. Without them, vibe coding is just yolo coding. With tests, it is a superpower.

## Framework

This project uses Vitest with jsdom and DOM Testing Library. Run the complete suite with:

```sh
npm test
```

Use `npm run test:watch` while developing.

## Test layers

- Unit tests cover pure data transformations and validation.
- Integration tests cover Supabase-facing flows with external services mocked.
- Browser QA covers navigation, responsive layout, forms, and full user journeys.
- End-to-end tests should be added when a workflow needs durable real-browser coverage.

## Conventions

- Put tests in `tests/` and name them `*.test.ts`.
- Describe user-visible behavior in test names.
- Mock network, database, storage, and authentication dependencies.
- Assert exact outcomes and error states, not merely that values exist.
- Reset or restore mocks between tests.
