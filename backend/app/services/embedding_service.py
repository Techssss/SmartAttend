import logging
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


def normalize_embedding(embedding: np.ndarray) -> np.ndarray:
    values = np.asarray(embedding, dtype=np.float32)
    norm = np.linalg.norm(values)
    if norm == 0:
        return values
    return values / norm


def cosine_similarity(left: np.ndarray, right: np.ndarray) -> float:
    left_norm = normalize_embedding(left)
    right_norm = normalize_embedding(right)
    return float(np.dot(left_norm, right_norm))


def as_embedding_array(value: Any) -> np.ndarray:
    return normalize_embedding(np.asarray(value, dtype=np.float32))
