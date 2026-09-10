import spaces
import torch

@spaces.GPU
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
from app.services.kokoro_service import KokoroService

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
# ZeroGPU Kokoro Inference Task
# ---------------------------------------------------------------------------
original_synthesize_chunk = KokoroService.synthesize_chunk

@spaces.GPU(duration=120)
def gpu_synthesis_task(chunk_text: str, voice_id: str, speed: float):
    service = KokoroService()
    lang_code = service.get_lang_code_for_voice(voice_id)
    pipeline = service.load_pipeline(lang_code)
    use_cuda = torch.cuda.is_available()
    if use_cuda and hasattr(pipeline, "model") and pipeline.model is not None:
        try:
            pipeline.model.to("cuda")
        except Exception:
            pass
    try:
        return original_synthesize_chunk(service, chunk_text, voice_id, speed)
    finally:
        if use_cuda and hasattr(pipeline, "model") and pipeline.model is not None:
            try:
                pipeline.model.to("cpu")
            except Exception:
                pass

def _routed_synthesize_chunk(self, chunk_text: str, voice_id: str, speed: float):
    return gpu_synthesis_task(chunk_text, voice_id, speed)

KokoroService.synthesize_chunk = _routed_synthesize_chunk

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

