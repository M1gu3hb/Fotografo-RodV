"""Extract reviewed individual photos from the native JPEG pages in the 2026 PDF.

The importer never rasterizes a PDF page and never enlarges a photograph. It reads
the embedded page JPEGs, crops the reviewed rectangles, removes visual duplicates,
and creates responsive WebP derivatives with stripped metadata.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PDF = ROOT.parent / "PDF THE BEST MOMENTS 2026.pdf"
PLAN_PATH = ROOT / "scripts" / "pdf-photo-plan.json"
GALLERY_PATH = ROOT / "data" / "gallery.json"
SITE_PATH = ROOT / "src" / "data" / "site.json"
PHOTO_DIR = ROOT / "public" / "photos"
REPORT_PATH = ROOT / "data" / "pdf-import-report.json"
CONTACT_SHEET = ROOT / "tmp" / "pdfs" / "import-contact-sheet.jpg"


def image_hashes(image: Image.Image) -> tuple[int, int]:
    gray = np.asarray(image.convert("L").resize((32, 32), Image.Resampling.LANCZOS), dtype=np.float32)
    low = cv2.dct(gray)[:8, :8]
    phash = sum(1 << index for index, value in enumerate(low.flat) if value > np.median(low[1:]))
    small = np.asarray(image.convert("L").resize((9, 8), Image.Resampling.LANCZOS))
    dhash = sum(1 << index for index, value in enumerate((small[:, 1:] > small[:, :-1]).flat) if value)
    return phash, dhash


def prepare_features(image: Image.Image):
    gray = np.asarray(image.convert("L"))
    if max(gray.shape) > 900:
        scale = 900 / max(gray.shape)
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    keypoints, descriptors = cv2.SIFT_create(nfeatures=600).detectAndCompute(gray, None)
    points = np.float32([point.pt for point in keypoints])
    return gray, points, descriptors


def same_photo(first: Image.Image, second: Image.Image) -> bool:
    a, a_points, a_descriptors = prepare_features(first)
    b, b_points, b_descriptors = prepare_features(second)
    if a_descriptors is None or b_descriptors is None or min(len(a_descriptors), len(b_descriptors)) < 15:
        return False
    matches = cv2.BFMatcher().knnMatch(a_descriptors, b_descriptors, k=2)
    good = [match for match, neighbor in matches if match.distance < 0.7 * neighbor.distance]
    if len(good) < 15:
        return False
    source = np.float32([a_points[match.queryIdx] for match in good])
    target = np.float32([b_points[match.trainIdx] for match in good])
    homography, mask = cv2.findHomography(source, target, cv2.RANSAC, 3.0)
    if homography is None or mask is None or int(mask.sum()) < 13 or mask.sum() / len(good) < 0.58:
        return False
    warped = cv2.warpPerspective(a, homography, (b.shape[1], b.shape[0]))
    coverage = cv2.warpPerspective(np.full(a.shape, 255, dtype=np.uint8), homography, (b.shape[1], b.shape[0])) > 250
    coverage = cv2.erode(coverage.astype("uint8"), np.ones((5, 5), np.uint8)).astype(bool)
    if coverage.sum() < min(a.size, b.size) * 0.32:
        return False
    correlation = float(np.corrcoef(warped[coverage].astype(float), b[coverage].astype(float))[0, 1])
    return correlation > 0.955


def embedded_pages(pdf_path: Path, wanted_pages: set[int]) -> dict[int, Image.Image]:
    reader = PdfReader(str(pdf_path))
    result = {}
    for page_number in wanted_pages:
        images = reader.pages[page_number - 1].images
        if len(images) != 1:
            raise RuntimeError(f"Expected one embedded page image on page {page_number}; found {len(images)}")
        image = Image.open(io.BytesIO(images[0].data))
        result[page_number] = ImageOps.exif_transpose(image).convert("RGB")
    return result


def make_contact_sheet(candidates: list[dict]) -> None:
    CONTACT_SHEET.parent.mkdir(parents=True, exist_ok=True)
    thumb_width, thumb_height = 270, 205
    rows = (len(candidates) + 4) // 5
    sheet = Image.new("RGB", (thumb_width * 5, thumb_height * rows), "#e7e7e4")
    draw = ImageDraw.Draw(sheet)
    for index, candidate in enumerate(candidates):
        thumb = candidate["image"].copy()
        thumb.thumbnail((thumb_width - 12, thumb_height - 34), Image.Resampling.LANCZOS)
        x = (index % 5) * thumb_width + (thumb_width - thumb.width) // 2
        y = (index // 5) * thumb_height + 4
        sheet.paste(thumb, (x, y))
        draw.text(((index % 5) * thumb_width + 8, (index // 5) * thumb_height + thumb_height - 25), candidate["sourceRef"], fill="#111111")
    sheet.save(CONTACT_SHEET, quality=92, optimize=True)


def save_webp(image: Image.Image, path: Path, target_width: int) -> dict:
    target_width = min(target_width, image.width)
    target_height = round(image.height * target_width / image.width)
    if target_width == image.width:
        derivative = image.copy()
    else:
        derivative = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
        derivative = derivative.filter(ImageFilter.UnsharpMask(radius=0.55, percent=55, threshold=3))
    derivative.save(path, "WEBP", quality=94 if target_width < image.width else 96, method=6, exact=True)
    return {
        "src": "/photos/" + path.name,
        "width": derivative.width,
        "height": derivative.height,
        "bytes": path.stat().st_size,
    }


def placeholder_data(image: Image.Image) -> str:
    preview = image.copy()
    preview.thumbnail((24, 24), Image.Resampling.LANCZOS)
    output = io.BytesIO()
    preview.save(output, "WEBP", quality=58, method=6)
    return "data:image/webp;base64," + base64.b64encode(output.getvalue()).decode("ascii")


def load_existing_images(photos: list[dict]):
    prepared = []
    for photo in photos:
        # The smallest responsive derivative contains enough local detail for
        # perceptual/SIFT matching and avoids decoding hundreds of large files.
        path = ROOT / "public" / photo["versions"][0]["src"].lstrip("/")
        with Image.open(path) as source:
            image = source.convert("RGB")
            image.thumbnail((700, 700), Image.Resampling.LANCZOS)
            prepared.append((photo, image_hashes(image), image.copy()))
    return prepared


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, default=DEFAULT_PDF)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip-dedupe", action="store_true", help="Only for crop-plan visual review")
    args = parser.parse_args()

    plan = json.loads(PLAN_PATH.read_text(encoding="utf8"))
    pages = embedded_pages(args.pdf, {item["page"] for item in plan})
    counters: dict[int, int] = {}
    candidates = []
    for item in plan:
        page = item["page"]
        counters[page] = counters.get(page, 0) + 1
        left, top, right, bottom = item["box"]
        # Move a few native pixels inside the reviewed rectangle so the green or
        # white dividers from the printed layout never become part of the photo.
        crop = pages[page].crop((left + 5, top + 5, right - 5, bottom - 5))
        source_ref = f"pdf-{page:02d}-{counters[page]:02d}"
        candidates.append({**item, "sourceRef": source_ref, "image": crop, "hashes": image_hashes(crop)})
    make_contact_sheet(candidates)

    current = json.loads(GALLERY_PATH.read_text(encoding="utf8"))
    current = [photo for photo in current if not photo.get("sourceRef", "").startswith("pdf-")]
    accepted = []
    duplicates = []
    if args.skip_dedupe:
        accepted = candidates
    else:
        references = load_existing_images(current)
        for candidate_index, candidate in enumerate(candidates, start=1):
            duplicate_of = None
            for photo, hashes, image in references:
                phash_distance = (candidate["hashes"][0] ^ hashes[0]).bit_count()
                dhash_distance = (candidate["hashes"][1] ^ hashes[1]).bit_count()
                if phash_distance <= 20 or dhash_distance <= 17:
                    if same_photo(candidate["image"], image):
                        duplicate_of = photo["id"]
                        break
            if duplicate_of:
                duplicates.append({"sourceRef": candidate["sourceRef"], "duplicateOf": duplicate_of})
            else:
                accepted.append(candidate)
                compact = candidate["image"].copy()
                compact.thumbnail((700, 700), Image.Resampling.LANCZOS)
                references.append((
                    {"id": candidate["sourceRef"]},
                    candidate["hashes"],
                    compact,
                ))
            print(
                f"Compared {candidate_index}/{len(candidates)}: "
                + (f"duplicate of {duplicate_of}" if duplicate_of else "new"),
                flush=True,
            )

    report = {
        "source": args.pdf.name,
        "pageRasterization": False,
        "plannedCrops": len(candidates),
        "accepted": len(accepted),
        "duplicates": duplicates,
        "contactSheet": str(CONTACT_SHEET.relative_to(ROOT)),
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if args.dry_run:
        return

    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    for old in PHOTO_DIR.glob("bodas-pdf-*.webp"):
        old.unlink()
    imported = []
    for candidate in accepted:
        digest = hashlib.sha256(candidate["image"].tobytes()).hexdigest()[:10]
        ident = f"bodas-{candidate['sourceRef']}-{digest}"
        widths = sorted(set([min(480, candidate["image"].width), min(1200, candidate["image"].width), candidate["image"].width]))
        versions = []
        for width in widths:
            height = round(candidate["image"].height * width / candidate["image"].width)
            filename = f"{ident}-{width}.webp"
            versions.append(save_webp(candidate["image"], PHOTO_DIR / filename, width))
        imported.append({
            "id": ident,
            "category": "bodas",
            "alt": candidate["alt"],
            "width": candidate["image"].width,
            "height": candidate["image"].height,
            "versions": versions,
            "sourceRef": candidate["sourceRef"],
            "placeholder": placeholder_data(candidate["image"]),
        })

    gallery = current + imported
    GALLERY_PATH.write_text(json.dumps(gallery, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    site = json.loads(SITE_PATH.read_text(encoding="utf8"))
    site["total"] = len(gallery)
    for collection in site["collections"]:
        collection["total"] = sum(photo["category"] == collection["slug"] for photo in gallery)
    SITE_PATH.write_text(json.dumps(site, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    print(f"Imported {len(imported)} new photographs; gallery now has {len(gallery)} photographs.")


if __name__ == "__main__":
    main()
