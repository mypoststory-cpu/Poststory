import os
import io
from google import genai
from google.genai import types
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
client = genai.Client()

# 1. Text-to-Image Generation
def generate_image(prompt_text: str, output_path: str = "generated.png"):
    response = client.models.generate_content(
        model="gemini-3.1-flash-image-preview", # Nano Banana model family
        contents=prompt_text,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio="1:1" # Options like "16:9", "9:16", etc.
            )
        ),
    )
    
    # Save the generated image
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            image = Image.open(io.BytesIO(part.inline_data.data))
            image.save(output_path)
            print(f"Image successfully saved to {output_path}")

# 2. Image Editing / Multimodal Prompting
def edit_image(image_path: str, instruction: str, output_path: str = "edited.png"):
    source_image = Image.open(image_path)
    
    response = client.models.generate_content(
        model="gemini-3.1-flash-image-preview",
        contents=[source_image, instruction],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
        ),
    )
    
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            edited_image = Image.open(io.BytesIO(part.inline_data.data))
            edited_image.save(output_path)
            print(f"Edited image successfully saved to {output_path}")

# Example usages:
# generate_image("A futuristic neon city skyline at sunset")
# edit_image("generated.png", "Add a flying robotic drone in the upper sky")