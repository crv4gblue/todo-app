# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Node.js / React web application. Package manager: npm (default; switch to pnpm/yarn if the project introduces a lockfile for those).

## Commit Style

Use Conventional Commits for all commits:
- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance, dependency updates, config
- `docs:` documentation only
- `refactor:` no behavior change
- `test:` tests only

Branch naming: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.

## Pull Requests

Use `gh pr create` to open PRs. Title must follow Conventional Commits format. Target branch: `main`.

## Formatting

Run Prettier before committing. Once installed, the format command will be `npm run format`. Do not commit unformatted code.

## Testing

Run tests with `npm test`. When adding a feature, add or update the corresponding test. Do not mark a task complete without passing tests.

## Environment

Copy `.env.example` to `.env` for local development once the file exists. Never commit `.env`.
