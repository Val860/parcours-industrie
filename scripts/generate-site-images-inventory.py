#!/usr/bin/env python3
"""Génère content/site-images.json à partir des HTML/CSS du site.

Usage :
  python3 scripts/generate-site-images-inventory.py

Le script détecte :
- les balises <img src="">
- les url(...) dans les styles HTML et CSS

Il conserve des chemins publics absolus (/images/...) pour que Decap CMS
affiche correctement les aperçus et pour que le site puisse utiliser les
images publiées depuis Netlify.
"""

from pathlib import Path
import json
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "content/site-images.json"

IMG_RE = re.compile(r"<img\b[^>]*?\bsrc=[\"']([^\"']+)[\"'][^>]*>", re.I | re.S)
ALT_RE = re.compile(r"\balt=[\"']([^\"']*)[\"']", re.I | re.S)
URL_RE = re.compile(r"url\([\"']?([^\"')]+)[\"']?\)", re.I)

GROUPS_ORDER = [
    ("accueil", "Accueil"),
    ("electricite-energie", "Électricité et énergie"),
    ("maintenance-industrielle", "Maintenance industrielle"),
    ("production-industrielle", "Production industrielle"),
    ("cybersecurite-reseaux", "Cybersécurité et réseaux"),
    ("vae", "VAE"),
    ("bilan", "Bilan de compétences"),
    ("blog", "Blog"),
    ("contact", "Contact"),
    ("generales", "Images générales"),
    ("logos", "Logos et éléments graphiques"),
]


def slug(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return text or "image"


def normalize_asset(src, file_path):
    if not src or src.startswith(("http://", "https://", "data:", "#")):
        return None
    if src.startswith("/"):
        return src
    path = (Path(file_path).parent / src).as_posix()
    parts = []
    for part in path.split("/"):
        if part in ("", "."):
            continue
        if part == "..":
            if parts:
                parts.pop()
        else:
            parts.append(part)
    return "/" + "/".join(parts)


def page_label(page):
    fixed = {
        "index.html": "Accueil",
        "contact.html": "Contact",
        "merci.html": "Merci",
        "a-propos.html": "À propos",
        "404.html": "Page 404",
        "mentions-legales.html": "Mentions légales",
        "politique-confidentialite.html": "Politique de confidentialité",
    }
    if page in fixed:
        return fixed[page]
    return page.replace("/index.html", "").replace(".html", "").replace("/", " — ").replace("-", " ").title()


def group_for(page, path):
    page_l = page.lower()
    path_l = path.lower()
    if "logo" in path_l or "/icons/" in path_l or path_l.endswith((".svg", ".ico")):
        return "logos"
    if page_l.startswith("blog/"):
        return "blog"
    if page_l.startswith("bilan/"):
        return "bilan"
    if page_l.startswith("vae/"):
        if any(x in page_l or x in path_l for x in ["electricien", "melec", "electrotechnique", "tmsec"]):
            return "electricite-energie"
        if any(x in page_l or x in path_l for x in ["maintenance", "mei", "mspc"]):
            return "maintenance-industrielle"
        if any(x in page_l or x in path_l for x in ["pspa", "cprp", "production"]):
            return "production-industrielle"
        if any(x in page_l or x in path_l for x in ["ciel", "cyber", "reseau", "cloud"]):
            return "cybersecurite-reseaux"
        return "vae"
    if page_l == "index.html" or path_l.startswith("/images/accueil/"):
        return "accueil"
    if page_l in ("contact.html", "merci.html") or path_l.startswith("/images/contact/"):
        return "contact"
    return "generales"


def section_for(path, kind, index):
    low = path.lower()
    if "logo" in low:
        return "Logo / navigation / pied de page"
    if kind == "css-url":
        return "Image de fond CSS"
    if index == 0:
        return "Image principale / hero"
    if "hero" in low:
        return "Image principale / hero"
    if any(x in low for x in ["contexte", "plan", "dossier"]):
        return "Image de contexte"
    if "/icons/" in low:
        return "Icône de service"
    return "Image de contenu"


def main():
    files = list(ROOT.rglob("*.html")) + list(ROOT.rglob("*.css"))
    groups = {gid: {"id": gid, "label": label, "images": []} for gid, label in GROUPS_ORDER}
    seen = set()
    id_counts = {}
    page_count = {}

    for file in files:
        rel = file.relative_to(ROOT).as_posix()
        text = file.read_text(errors="ignore")

        for match in IMG_RE.finditer(text):
            src = match.group(1)
            path = normalize_asset(src, rel)
            if not path:
                continue
            alt_match = ALT_RE.search(match.group(0))
            alt = alt_match.group(1) if alt_match else ""
            idx = page_count.get(rel, 0)
            page_count[rel] = idx + 1
            key = (rel, "img", path, alt)
            if key in seen:
                continue
            seen.add(key)
            add_item(groups, id_counts, rel, path, alt, "img", idx)

        for match in URL_RE.finditer(text):
            src = match.group(1)
            if not re.search(r"\.(png|jpe?g|webp|svg|gif|ico)$", src, re.I):
                continue
            path = normalize_asset(src, rel)
            if not path:
                continue
            key = (rel, "css-url", path, "")
            if key in seen:
                continue
            seen.add(key)
            add_item(groups, id_counts, rel, path, "", "css-url", 99)

    output = {
        gid.replace("-", "_"): {
            "label": groups[gid]["label"],
            "images": groups[gid]["images"],
        }
        for gid, _ in GROUPS_ORDER
        if groups[gid]["images"]
    }
    OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
    print(f"{sum(len(g['images']) for g in output.values())} images référencées écrites dans {OUT.relative_to(ROOT)}")


def add_item(groups, id_counts, page, path, alt, kind, index):
    gid = group_for(page, path)
    base = slug(page.replace("/index.html", "").replace(".html", "") + "-" + Path(path).stem)
    count = id_counts.get(base, 0)
    id_counts[base] = count + 1
    image_id = base if count == 0 else f"{base}-{count + 1}"
    section = section_for(path, kind, index)
    label = f"{page_label(page)} — {section}"
    if alt and alt.lower() not in label.lower():
        label += f" — {alt[:60]}"
    groups[gid]["images"].append({
        "id": image_id,
        "label": label,
        "page": page,
        "section": section,
        "current_path": path,
        "image": path,
        "alt": alt,
        "description": "Image détectée automatiquement dans " + page,
        "type": kind,
        "exists": (ROOT / path.lstrip("/")).exists(),
    })


if __name__ == "__main__":
    main()
