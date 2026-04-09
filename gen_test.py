#!/usr/bin/env python3
import os, json, base64, urllib.request

API_KEY = os.environ["XAI_API_KEY"]
OUTDIR = "/data/.openclaw/workspace/projects/status-page/images"

tests = {
    "oscar": (
        "Premium luxury playing card face card illustration, King archetype, "
        "commanding regal male figure holding a stylized lightning-bolt scepter, "
        "ornate detailed engraving style linework, black background, gold and silver ink, "
        "intricate border filigree, centered formal court card composition, "
        "Summit Forge Labs deck aesthetic, gear and mountain motifs in the border, "
        "high detail, no text, square format"
    ),
    "sentinel": (
        "Premium luxury playing card face card illustration, Knight archetype, "
        "vigilant armored figure holding a shield with an eye motif, "
        "ornate detailed engraving style linework, black background, gold and silver ink, "
        "intricate border filigree, centered formal court card composition, "
        "Summit Forge Labs deck aesthetic, gear and mountain motifs in the border, "
        "high detail, no text, square format"
    ),
}

for agent, prompt in tests.items():
    print(f"Generating {agent} test...", flush=True)
    payload = json.dumps({
        "model": "grok-imagine-image",
        "prompt": prompt,
        "n": 1,
        "response_format": "b64_json"
    }).encode()
    req = urllib.request.Request(
        "https://api.x.ai/v1/images/generations",
        data=payload,
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read())
    img_bytes = base64.b64decode(data["data"][0]["b64_json"])
    outpath = f"{OUTDIR}/{agent}/test_card.jpg"
    with open(outpath, "wb") as f:
        f.write(img_bytes)
    print(f"  {agent}: {len(img_bytes):,} bytes -> {outpath}", flush=True)

print("Done.")
