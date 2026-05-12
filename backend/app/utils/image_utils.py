import base64
import binascii
from typing import Any

import cv2
import numpy as np


class ImageDecodeError(ValueError):
    pass


def decode_base64_image(image_base64: str) -> np.ndarray:
    if not image_base64:
        raise ImageDecodeError("Image base64 is required.")

    raw = image_base64.strip()
    if "," in raw and raw.lower().startswith("data:"):
        raw = raw.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(raw, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ImageDecodeError("Invalid base64 image.") from exc

    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        raise ImageDecodeError("Could not decode image bytes.")

    return image


async def image_from_request(request: Any) -> tuple[np.ndarray, dict[str, Any]]:
    content_type = request.headers.get("content-type", "")
    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        upload = form.get("file") or form.get("image")
        if upload is None:
            raise ImageDecodeError("Multipart request must include file or image.")
        image_bytes = await upload.read()
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if image is None:
            raise ImageDecodeError("Could not decode uploaded image.")
        fields = {key: value for key, value in form.items() if key not in {"file", "image"}}
        return image, fields

    body = await request.json()
    return decode_base64_image(str(body.get("image") or body.get("image_base64") or "")), body
