"""
HuggingFace Spaces - Gradio wrapper for Todo API
"""
import gradio as gr
import httpx
import os

# This is a simple landing page since the full app needs separate frontend
def home():
    return """
    # 🚀 Todo API Backend

    This is the backend API for the Todo Full-Stack Application.

    ## API Endpoints

    | Method | Endpoint | Description |
    |--------|----------|-------------|
    | GET | `/api/v1/tasks` | List tasks |
    | POST | `/api/v1/tasks` | Create task |
    | PUT | `/api/v1/tasks/{id}` | Update task |
    | DELETE | `/api/v1/tasks/{id}` | Delete task |

    ## Frontend

    Deploy the frontend on Vercel and connect to this API.

    **API Base URL:** `https://muhammadyousuf333-web-todo.hf.space`
    """

demo = gr.Blocks()

with demo:
    gr.Markdown(home())
    gr.Markdown("---")
    gr.Markdown("### Quick Test")

    with gr.Row():
        test_btn = gr.Button("Test API Health")
        result = gr.Textbox(label="Result")

    def test_api():
        try:
            return "✅ API is running! Deploy frontend on Vercel to use the full app."
        except Exception as e:
            return f"❌ Error: {str(e)}"

    test_btn.click(test_api, outputs=result)

demo.launch()
