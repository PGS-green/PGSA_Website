# Project guidance

## Testing

- Run the suite with `npm test`; tests live in `tests/`.
- See `TESTING.md` for test layers and conventions.
- Aim for 100% coverage so changes remain safe to ship.
- Add a corresponding test for new functions.
- Add a regression test for every behavior-changing bug fix.
- Exercise new error handling and both sides of every conditional.
- Never commit code that breaks existing tests.
