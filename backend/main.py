from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from services.user_story_service import generate_user_stories
from services.swagger_yaml_service import generate_swagger_yaml
import os
import yaml

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate")
async def generate(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "default prompt")
    user_stories = generate_user_stories(prompt)

    return {"user_stories": user_stories}

@app.post("/swagger-yaml", response_class=PlainTextResponse)
async def generate(request: Request):
    body = await request.json()
    prompt = body.get("user_stories", "")
    swagger_yaml = generate_swagger_yaml(prompt)

    return PlainTextResponse(swagger_yaml, media_type="text/yaml")

@app.get("/context-json")
def get_context_json():
    return JSONResponse(content={
        "project_slug": "customer-onboarding",
        "package": "com.example.customer",
        "entity_name": "Customer"
    })

@app.get("/download")
def download_zip():
    zip_path = "../output/springboot_project.zip"
    with open(zip_path, "w") as f:
        f.write("dummy zip content")
    return FileResponse(zip_path, filename="springboot_project.zip")