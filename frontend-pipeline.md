# Frontend Pipeline Documentation

This document describes the frontend CI/CD pipeline in the top-level project hierarchy.
It covers the automated pipeline, the manual temporary image workflow, and the cleanup workflow.

## Overview

The frontend automation consists of three workflows:

1. [.github/workflows/frontend-pipeline.yml](.github/workflows/frontend-pipeline.yml) for the main CI/CD flow.
2. [.github/workflows/manual-temporary-frontend-image.yml](.github/workflows/manual-temporary-frontend-image.yml) for manually publishing temporary images.
3. [.github/workflows/cleanup-temporary-frontend-images.yml](.github/workflows/cleanup-temporary-frontend-images.yml) for removing temporary images again.

## Main Frontend Pipeline

The main workflow runs on `push`, `pull_request`, and `workflow_dispatch` for `main` and `feature/**` branches.

### Non-Docker steps

The first part of the pipeline validates the frontend codebase:

1. Set up Node.js 22.
2. Install dependencies with `npm ci`.
3. Run Prettier formatting checks.
4. Run ESLint.
5. Run the TypeScript type check.
6. Run the test suite with `npm test`.
7. Build the frontend with `npm run build`.
8. Run smoke tests only on pull requests.
9. Run `npm audit --audit-level=high`.


The local equivalents of these commands are documented in [Local_Command_README.md](Local_Command_README.md).

### Version and image logic

The Docker part starts with the version handling steps:

- Step 10.1 reads the current application version from `package.json`.
- Step 10.2 compares the current version with the version from the previous Git reference.
- Step 10.3 sets the Docker image name depending on the branch.
- Step 10.4 logs in to GitHub Container Registry only when an image push is allowed.
- Step 10.5 builds the Docker image and pushes it only when the version changed and pushing is allowed.

The important release rule is:

- When a new frontend image is published, the version in `package.json` must be increased first.
- The pipeline uses that version as the image tag.
- When the version does not change, the publish step is skipped.

Semantic versioning in `package.json` is used to decide which part of the version number changes during an update:

- `MAJOR` when the change is breaking or incompatible
- `MINOR` when the change adds new backwards-compatible functionality
- `PATCH` when the change is a small fix or improvement that does not change the public behavior

When the application version is updated before publishing a new image, the version component that matches the size of the change should be updated.

The build also adds a SHA tag in the form `sha-<commit-sha>`.

### Deployment placeholders

Steps 11 and 12 are currently placeholders:

- `11 - Deploy Staging`
- `12 - Deploy Production`

At the moment they only print a status message and do not perform a real deployment.

## Manual Temporary Frontend Image

The workflow [.github/workflows/manual-temporary-frontend-image.yml](.github/workflows/manual-temporary-frontend-image.yml) is started manually with `workflow_dispatch` and requires an `image_tag` input.

### Purpose

The workflow publishes a temporary frontend image for test or intermediate use.

### Flow

1. Validate the provided Docker tag.
2. Normalize the repository owner and branch name.
3. Remove any existing temporary image for the same branch.
4. Log in to GHCR.
5. Set up Docker Buildx.
6. Build and push the temporary image.

### Tags that are created

The workflow publishes the image with these tags:

- the manually provided `image_tag`
- a branch management tag in the form `branch-<branch>`
- a commit SHA tag

These tags come directly from the workflow steps in [.github/workflows/manual-temporary-frontend-image.yml](.github/workflows/manual-temporary-frontend-image.yml):

- `INPUT_TAG` is read from `inputs.image_tag` in step 01.
- `MANAGEMENT_TAG` is built from the normalized branch name in step 01.
- `sha-<commit-sha>` is created in step 05 with `${{ github.sha }}`.

## Cleanup Temporary Frontend Images

The workflow [.github/workflows/cleanup-temporary-frontend-images.yml](.github/workflows/cleanup-temporary-frontend-images.yml) runs on a schedule at 03:00 and can also be started manually.

### Purpose

The workflow removes the temporary GHCR package used for manual frontend images.

### Flow

1. Check whether the temporary package exists.
2. Exit without failure if the package does not exist.
3. Delete the package if it does exist.

## Short rule for new releases

When a new frontend image is published:

1. Increase the version in `package.json`.
2. Commit and push the change.
3. Let the pipeline run.
4. The image is pushed only if the version changed.