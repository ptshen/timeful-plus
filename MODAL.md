# Modal Backend Hosting

This repo includes a Modal entrypoint for running the Go backend as a long-running HTTP service.

Files:
- `modal_backend.py`: Modal app that serves the Go binary.
- `Dockerfile.backend`: Backend build image used by Modal.
- `modal.env.example`: Environment variable template to copy values from Railway into.

## Prerequisites

- Modal CLI installed and authenticated.
- Backend env vars copied from Railway into a local file based on `modal.env.example`.

## Setup

1. Create a copy of the template and fill in values from Railway:
   ```bash
   cp modal.env.example modal.env
   ```
2. Create the Modal secret from the env file:
   ```bash
   modal secret create timeful-backend-secrets --from-dotenv modal.env
   ```
3. Deploy:
   ```bash
   modal deploy modal_backend.py
   ```

## Notes

- The Modal app keeps one warm container with `min_containers=1`.
- Google Cloud Tasks are optional. If you do not use them, leave
  `SERVICE_ACCOUNT_KEY_PATH` unset.
