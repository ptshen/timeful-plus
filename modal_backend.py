import os
import subprocess

import modal

app = modal.App("timeful-backend")

# Build from a Modal-specific Dockerfile that includes Python in the runtime image.
image = modal.Image.from_dockerfile("Dockerfile.modal")

SECRET_NAME = os.environ.get("MODAL_BACKEND_SECRET", "timeful-backend-secrets")
secrets = [modal.Secret.from_name(SECRET_NAME)]


@app.function(image=image, min_containers=1, secrets=secrets)
@modal.web_server(3002, label="timeful-backend")
def serve():
    os.environ.setdefault("PORT", "3002")
    os.chdir("/app")
    subprocess.Popen(["/app/server", "-release=true"])
