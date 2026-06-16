"""Pre-download the background-removal model weights into the rembg cache
(~/.u2net) so the first request isn't a slow/timed-out download.

Override the model with the BG_MODEL env var (default: birefnet-general-lite).
"""

from __future__ import annotations

import os

from rembg import new_session

MODEL_NAME = os.environ.get("BG_MODEL", "birefnet-general-lite")


def main() -> None:
    print(f"Downloading rembg model '{MODEL_NAME}' into the cache ...")
    new_session(MODEL_NAME)
    print("done")


if __name__ == "__main__":
    main()
