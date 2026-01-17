from sentence_transformers import SentenceTransformer
import numpy as np

# Load the embedding model ONCE
MODEL = SentenceTransformer("all-MiniLM-L6-v2")


def embed_papers(papers):
    """
    Convert paper titles into semantic embeddings.

    Parameters
    ----------
    papers : list of dict
        Each dict represents a paper and must contain a 'title' field.

    Returns
    -------
    numpy.ndarray
        Array of shape (n_papers, embedding_dim)
    """
    texts = []

    for paper in papers:
        title = paper.get("title", "")
        texts.append(title)

    embeddings = MODEL.encode(
        texts,
        show_progress_bar=False
    )

    return np.array(embeddings)
