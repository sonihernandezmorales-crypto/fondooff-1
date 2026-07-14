from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

app = FastAPI(title="FondoOff API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://192.168.100.24:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    # Leer el archivo enviado
    contenido = await file.read()

    # Subir a Cloudinary
    resultado = cloudinary.uploader.upload(contenido, folder="fondooff")
    public_id = resultado["public_id"]

    # Generar URL con transformación para quitar fondo y formato PNG
    url_sin_fondo = cloudinary.CloudinaryImage(public_id).build_url(
        transformation=[
            {"effect": "background_removal"},
            {"fetch_format": "png"}
        ]
    )

    return {"imagen": url_sin_fondo}