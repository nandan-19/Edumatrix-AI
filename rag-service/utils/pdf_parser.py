import fitz


def parse_pdf(file_bytes: bytes) -> list[str]:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    return [full_text[i:i+500] for i in range(0, len(full_text), 500)]
