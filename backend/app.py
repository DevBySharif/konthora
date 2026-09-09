import os
import sys

# Ensure permissive host headers and CORS defaults for Hugging Face Spaces routing
os.environ.setdefault("CORS_ORIGINS", "*")
os.environ.setdefault("TRUSTED_HOSTS", "*")

import gradio as gr
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

# Import existing FastAPI app from backend entry module
from app.main import app
from app.services.kokoro_service import KokoroService

# Gracefully import spaces library (present in Hugging Face ZeroGPU environment)
try:
    import spaces
except ImportError:
    class _SpacesMock:
        @staticmethod
        def GPU(func=None, **kwargs):
            if func is None:
                return lambda f: f
            return func
    spaces = _SpacesMock()

import torch

# Ensure CORS is permissive so frontend requests succeed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wrap speech generation inference with @spaces.GPU so Kokoro gets allocated NVIDIA GPU compute on ZeroGPU
original_synthesize_chunk = KokoroService.synthesize_chunk

@spaces.GPU(duration=120)
def gpu_synthesize_chunk(self, chunk_text: str, voice_id: str, speed: float):
    """
    Inference wrapper decorated with @spaces.GPU for Hugging Face ZeroGPU.
    Dynamically transfers the pipeline model to CUDA during allocated GPU time,
    and returns it to CPU afterwards to maintain clean state across ZeroGPU task assignments.
    """
    lang_code = self.get_lang_code_for_voice(voice_id)
    pipeline = self.load_pipeline(lang_code)

    use_cuda = torch.cuda.is_available()
    if use_cuda and hasattr(pipeline, "model") and pipeline.model is not None:
        try:
            pipeline.model.to("cuda")
        except Exception:
            pass

    try:
        return original_synthesize_chunk(self, chunk_text, voice_id, speed)
    finally:
        if use_cuda and hasattr(pipeline, "model") and pipeline.model is not None:
            try:
                pipeline.model.to("cpu")
            except Exception:
                pass

KokoroService.synthesize_chunk = gpu_synthesize_chunk

# Mount status page on Gradio while serving all existing API endpoints
demo = gr.Interface(
    fn=lambda: "Konthora Engine Running on ZeroGPU",
    inputs=None,
    outputs="text",
    title="Konthora API",
    description="Konthora Backend Speech Processing Engine running on Hugging Face ZeroGPU."
)
app = gr.mount_gradio_app(app, demo, path="/status")

# Redirect root path to /status so that viewing the Space directly shows the Gradio UI
@app.get("/", include_in_schema=False)
def root_redirect():
    return RedirectResponse(url="/status")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
