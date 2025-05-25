import chromadb

chroma_client = chromadb.Client()
COLL_NAME = "edumatrix"


def get_collection():
    """
    Helper that returns a fresh, empty collection named `COLL_NAME`.
    If the collection already exists it is first deleted to guarantee
    no stale vectors remain.
    """
    try:
        chroma_client.delete_collection(COLL_NAME)  # idempotent
    except chromadb.errors.NotFoundError:
        pass
    return chroma_client.create_collection(COLL_NAME)


# keep one handle you recreate on every upload
collection = get_collection()


# ── vector‑store helpers ───────────────────────────────────────
def store_chunks(chunks: list[str], vectors: list[list[float]]) -> None:
    """
    Clears the collection so it contains ONLY the current PDF’s vectors,
    then inserts them.
    """
    global collection
    collection = get_collection()  # ← wipe & recreate

    for idx, (chunk, vector) in enumerate(zip(chunks, vectors)):
        collection.add(documents=[chunk], embeddings=[vector], ids=[f"doc-{idx}"])


def search_vector_store(embedded_query: list[float], top_k: int = 3):
    """
    Returns the `top_k` most similar chunks (list[str]).
    Assumes the query embedding is pre‑computed.
    """
    results = collection.query(query_embeddings=[embedded_query], n_results=top_k)
    return results["documents"][0]  # list of chunks
