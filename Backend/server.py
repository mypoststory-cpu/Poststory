import os
import json
import urllib.request
import urllib.parse
import uuid
import re
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
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
    request: Request,
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

        # 2. Extract exact text inside quotes FIRST
        quoted_match = re.search(r'["„\'️](.*?)["„\'️]', prompt)
        text_to_overlay = quoted_match.group(1) if quoted_match else ""

        # 3. Clean background prompt for AI generation
        background_prompt = re.sub(r'["„\'️].*?["„\'️]', '', prompt).strip()
        if not background_prompt:
            background_prompt = prompt 

        # 4. Translate background prompt to English
        final_prompt = background_prompt
        if TRANSLATOR_AVAILABLE and background_prompt.strip():
            try:
                final_prompt = GoogleTranslator(source='auto', target='en').translate(background_prompt)
            except Exception as trans_err:
                print(f"Translation warning: {trans_err}")

        # 5. Generate and download image from cloud AI
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

        # 6. If text was provided, overlay it clearly onto the downloaded image
        if PIL_AVAILABLE and text_to_overlay:
            try:
                img = Image.open(final_path)
                draw = ImageDraw.Draw(img)
                
                # Cross-platform font selection (Windows & Linux/Render safe)
                font = None
                font_paths = [
                    "C:/Windows/Fonts/nirmala.ttf",
                    "C:/Windows/Fonts/arial.ttf",
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
                ]
                
                for path in font_paths:
                    if os.path.exists(path):
                        try:
                            font = ImageFont.truetype(path, 56)
                            break
                        except Exception:
                            continue
                
                if font is None:
                    font = ImageFont.load_default()
                
                # Center text at the bottom
                if hasattr(draw, "textbbox"):
                    bbox = draw.textbbox((0, 0), text_to_overlay, font=font)
                    text_width = bbox[2] - bbox[0]
                    text_height = bbox[3] - bbox[1]
                else:
                    text_width, text_height = draw.textsize(text_to_overlay, font=font)
                
                img_width, img_height = img.size
                x = (img_width - text_width) / 2
                y = img_height - text_height - 120
                
                # Draw black outline for visibility, then white text
                outline_color = "black"
                for adj_x, adj_y in [(-3,0), (3,0), (0,-3), (0,3), (-3,-3), (3,3)]:
                    draw.text((x + adj_x, y + adj_y), text_to_overlay, font=font, fill=outline_color)
                
                draw.text((x, y), text_to_overlay, font=font, fill="white")
                
                img.save(final_path)
            except Exception as draw_err:
                print(f"Text overlay error: {draw_err}")

        # 7. Return dynamic base URL (works automatically on Render & Localhost)
        base_url = str(request.base_url).rstrip('/')
        return {
            "status": "success",
            "imageUrl": f"{base_url}/outputs/{final_filename}"
        }

    except Exception as e:
        print(f"CRITICAL BACKEND ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)