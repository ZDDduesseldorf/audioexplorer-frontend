# Running Pipeline Commands Locally

This guide explains how to run the local equivalents of the commands used in the frontend GitHub Actions pipeline.

Run all commands from the frontend project root.

## Check Node.js version

```bash
node --version
```

The pipeline uses Node.js 22. Locally, make sure the output starts with `v22`.

## Install dependencies

```bash
npm ci
```

Installs dependencies exactly as defined in `package-lock.json`. This is the same installation command used in the pipeline.

## Check formatting

```bash
npm run format
```

Runs the Prettier formatting check. This command only checks formatting and does not modify files.

## Run linting

```bash
npm run lint
```

Runs ESLint for the frontend project. Use this to catch linting issues before pushing changes.

## Run TypeScript type checking

```bash
npm run typecheck
```

Runs the TypeScript type check. This verifies that the project compiles correctly at the type level.

## Run tests

```bash
npm test
```

Runs the frontend test suite. In this project, this executes the configured Vitest tests.

## Build the frontend

```bash
npm run build
```

Creates the production build of the frontend. The output is written to the `dist` directory.

## Install Playwright browsers

```bash
npx playwright install --with-deps
```

Installs the browsers and dependencies required by Playwright. The pipeline runs this before executing smoke tests.

## Run smoke tests

```bash
npm run test:smoke
```

Runs the Playwright smoke tests. This is the command used when the project defines a `test:smoke` script.

## Run smoke fallback

```bash
npm run smoke
```

This is the fallback command used by the pipeline if `test:smoke` is not defined. In this project, `test:smoke` exists, so this fallback is normally not needed.

## Run security audit

```bash
npm audit --audit-level=high
```

Checks dependencies for known security vulnerabilities. The command fails if vulnerabilities with severity `high` or higher are found.

## Set a local image tag

```bash
GIT_SHA=$(git rev-parse --short HEAD)
```

The pipeline tags Docker images with the GitHub commit SHA. Locally, this command creates a similar tag from the current Git commit.

## Build the Docker image

```bash
docker build -t audioexplorer-frontend-app:$GIT_SHA .
```

Builds the Docker image for the frontend application. This is the local equivalent of the Docker build step in the pipeline.

## Inspect the Docker image

```bash
docker image inspect audioexplorer-frontend-app:$GIT_SHA
```

Prints metadata about the built Docker image. Use this to verify that the image exists and was built successfully.

## Save the Docker image as an archive

```bash
docker save audioexplorer-frontend-app:$GIT_SHA | gzip > audioexplorer-frontend-image.tar.gz
```

Exports the Docker image into a compressed archive file. This mirrors the image artifact creation step from the pipeline.

## Check the archive file

```bash
ls -lh audioexplorer-frontend-image.tar.gz
```

Shows the size of the exported Docker image archive. This confirms that the archive file was created successfully.