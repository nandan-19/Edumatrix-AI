from fastapi import APIRouter, UploadFile, File
from utils.pdf_parser import parse_pdf
from utils.embedder import get_embeddings
from utils.vector_store import store_chunks, search_vector_store
from fastapi.responses import JSONResponse

router = APIRouter()


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    content = await file.read()
    text_chunks = parse_pdf(content)
    vectors = get_embeddings(text_chunks)
    store_chunks(text_chunks, vectors)
    return JSONResponse(content={"message": "PDF processed successfully"})


@router.get("/rag")
async def get_rag_context(query: str):
    embedded_query = get_embeddings([query])[0]
    relevant_chunks = search_vector_store(embedded_query)
    return {"context": "\n".join(relevant_chunks)}
