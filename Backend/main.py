import os
import json
import urllib.request
import urllib.parse
import uuid
import re
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# For translation
try:
    from deep_translator import GoogleTranslator
    TRANSLATOR_AVAILABLE = True
except ImportError:
    TRANSLATOR_AVAILABLE = False

# For drawing text onto images
try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

@app.post("/generate-image")
async def generate_image(
    prompt: str = Form(""), 
    image: UploadFile = File(None),
    width: int = Form(1080),
    height: int = Form(1350)
):
    try:
        # 1. Handle uploaded image if provided
        image_filename = None
        if image:
            image_filename = image.filename
            saved_image_path = os.path.join(UPLOAD_DIR, image_filename)
            with open(saved_image_path, "wb") as buffer:
                buffer.write(await image.read())

        # 2. Extract exact text inside quotes FIRST (before translation alters it)[cite: 2]
        quoted_match = re.search(r'["„\'️](.*?)["„\'️]', prompt)
        text_to_overlay = quoted_match.group(1) if quoted_match else ""

        # 3. Clean background prompt for AI generation (remove the quoted text from background description)[cite: 2]
        background_prompt = re.sub(r'["„\'️].*?["„\'️]', '', prompt).strip()
        if not background_prompt:
            background_prompt = prompt # Fallback if everything was inside quotes[cite: 2]

        # 4. Translate background prompt to English for the AI image generator[cite: 2]
        final_prompt = background_prompt
        if TRANSLATOR_AVAILABLE and background_prompt.strip():
            try:
                final_prompt = GoogleTranslator(source='auto', target='en').translate(background_prompt)
            except Exception as trans_err:
                print(f"Translation warning: {trans_err}")

        # 5. Generate and download image from cloud AI using target width & height[cite: 2]
        encoded_prompt = urllib.parse.quote(final_prompt)
        ai_image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true"

        final_filename = f"result_{uuid.uuid4()}.png"
        final_path = os.path.join(OUTPUT_DIR, final_filename)

        req = urllib.request.Request(
            ai_image_url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        
        with urllib.request.urlopen(req) as response, open(final_path, 'wb') as f:
            f.write(response.read())

        # 6. If text was provided, overlay it clearly onto the downloaded image using Pillow[cite: 2]
        if PIL_AVAILABLE and text_to_overlay:
            try:
                img = Image.open(final_path)
                draw = ImageDraw.Draw(img)
                
                # Use a font path that supports Unicode/Marathi if available, like Nirmala or Arial[cite: 2]
                font_path = "C:/Windows/Fonts/nirmala.ttf" # Nirmala UI handles Marathi/Hindi well[cite: 2]
                if not os.path.exists(font_path):
                    font_path = "C:/Windows/Fonts/arial.ttf"
                if not os.path.exists(font_path):
                    font_path = "arial.ttf"
                
                font = ImageFont.truetype(font_path, 56)
                
                # Center text at the bottom[cite: 2]
                bbox = draw.textbbox((0, 0), text_to_overlay, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                img_width, img_height = img.size
                x = (img_width - text_width) / 2
                y = img_height - text_height - 120
                
                # Draw black outline for visibility, then white text[cite: 2]
                outline_color = "black"
                for adj_x, adj_y in [(-3,0), (3,0), (0,-3), (0,3), (-3,-3), (3,3)]:
                    draw.text((x + adj_x, y + adj_y), text_to_overlay, font=font, fill=outline_color)
                
                draw.text((x, y), text_to_overlay, font=font, fill="white")
                
                img.save(final_path)
            except Exception as draw_err:
                print(f"Text overlay error: {draw_err}")

        # 7. Return response to React[cite: 2]
        return {
            "status": "success",
            "imageUrl": f"http://127.0.0.1:8000/outputs/{final_filename}"
        }

    except Exception as e:
        print(f"CRITICAL BACKEND ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)