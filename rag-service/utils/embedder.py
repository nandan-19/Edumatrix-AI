from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")


def get_embeddings(chunks: list[str]) -> list[list[float]]:
    return model.encode(chunks).tolist()
