
import fitz
from PIL import Image
import pytesseract
import os


def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    text = ""

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        page_text = page.get_text()

        if page_text.strip():
            text += f"\n--- Page {page_num + 1} ---\n{page_text}"
        else:
            pix = page.get_pixmap(dpi=200)
            img = Image.frombytes(
                "RGB", [pix.width, pix.height], pix.samples
            )
            ocr_text = pytesseract.image_to_string(img, lang="eng")

            if ocr_text.strip():
                text += f"\n--- Page {page_num + 1} (scanned) ---\n{ocr_text}"

    doc.close()
    return text.strip()


def extract_text_from_image(file_path: str) -> str:
    img = Image.open(file_path)

    if img.mode not in ["RGB", "L"]:
        img = img.convert("RGB")

    return pytesseract.image_to_string(img, lang="eng").strip()


def extract_text(file_path: str, file_type: str) -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    if file_type == "pdf":
        return extract_text_from_pdf(file_path)

    elif file_type == "image":
        return extract_text_from_image(file_path)

    else:
        raise ValueError("Unsupported file type: " + file_type)

