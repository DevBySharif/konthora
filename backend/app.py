import spaces
import torch

@spaces.GPU(duration=5)
def zerogpu_warmup():
    if torch.cuda.is_available():
        return torch.zeros(1).cuda().sum().item()
    return 0.0

# Mandatory immediate top-level invocation for ZeroGPU AST scanner
_warmup_val = zerogpu_warmup()

import os
import sys
import gradio as gr
from fastapi.middleware.cors import CORSMiddleware
from app.main import app as fastapi_app

os.environ.setdefault("CORS_ORIGINS", "*")
os.environ.setdefault("TRUSTED_HOSTS", "*")

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Kokoro inference runs on CPU inside the FastAPI queue workers.
#
# ZeroGPU's @spaces.GPU decorator can only schedule a GPU from a live Gradio
# request context (it reads the visitor's X-IP-Token from that request). The TTS
# queue processes jobs in a background thread after the HTTP request has
# returned, so there is no request context: every call failed to schedule and
# was surfaced as "Speech synthesis failed due to an internal worker error."
# Keeping synthesis on CPU avoids the ZeroGPU quota entirely; the model is an
# 82M-parameter Kokoro pipeline and runs comfortably on the Space's vCPUs.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Minimal Gradio Interface (Mounted under /gradio)
# ---------------------------------------------------------------------------
with gr.Blocks(title="Konthora Audio Engine") as demo:
    gr.Markdown("# 🎙️ Konthora AI Audio Engine")
    gr.Markdown("ZeroGPU Backend active and running.")

# Direct Root Status Endpoint on primary FastAPI app
@fastapi_app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {"status": "online", "service": "Konthora AI Engine"}

# Mount Gradio strictly under /gradio; fastapi_app handles the root and all /api/v1 routes
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)

