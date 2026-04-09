#!/usr/bin/env python3
import os, json, base64, urllib.request

API_KEY = os.environ["XAI_API_KEY"]
OUTDIR = "/data/.openclaw/workspace/projects/status-page/images"

agents = {
    "oscar": "Stylized 3D portrait, premium android commander, distinguished sharp features, subtle chrome metallic accents at temples and jaw, tailored deep navy coat with gold insignia, calm authoritative expression, warm gold cinematic lighting, deep navy-black background, professional classy high-end digital art, Summit Forge Labs aesthetic",
    "vera": "Stylized 3D portrait, premium android analyst, clean refined features, slim silver optical implants integrated into face like elegant eyewear, sleek dark charcoal blazer, intelligent searching expression, warm gold cinematic lighting, deep navy background, professional high-end 3D render, Summit Forge Labs aesthetic",
    "forge": "Stylized 3D portrait, premium android craftsman, strong structured features, subtle copper-bronze chrome metallic skin tone, clean work vest over dark shirt, sleeves rolled, confident capable expression, warm gold-copper cinematic lighting, deep navy background, high-end 3D render, Summit Forge Labs aesthetic",
    "sentinel": "Stylized 3D portrait, premium android security operative, cool angular precision features, silver-blue chrome metallic skin, subtle geometric HUD ring visible in one iris, dark tactical jacket, arms-crossed alert posture, cool cinematic lighting with blue edge rim, deep navy background, high-end 3D render, Summit Forge Labs aesthetic",
    "scribe": "Stylized 3D portrait, premium android archivist, distinguished refined features, warm silver chrome skin, neat dark collared shirt, calm attentive expression, slight tilt of head, warm gold ambient lighting, deep navy background, high-end 3D render, Summit Forge Labs aesthetic",
    "probe": "Stylized 3D portrait, premium android QA inspector, sharp symmetrical features, naturally skeptical raised-eyebrow expression, cool-neutral chrome metallic skin, clean dark jacket, analytical composed posture, clinical cool lighting with blue-white accents, deep navy background, high-end 3D render, Summit Forge Labs aesthetic",
    "ledger": "Stylized 3D portrait, premium android strategist, polished confident features, subtle gold-warm shimmer in chrome metallic skin, impeccable slim-fit dark suit, knowing slight smile, gold cinematic key light, deep navy background, high-end 3D render, Summit Forge Labs aesthetic",
}

for agent, prompt in agents.items():
    print(f"Generating {agent}...", flush=True)
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
    img_b64 = data["data"][0]["b64_json"]
    img_bytes = base64.b64decode(img_b64)
    outpath = f"{OUTDIR}/{agent}/awake.jpg"
    with open(outpath, "wb") as f:
        f.write(img_bytes)
    print(f"  {agent}: saved {len(img_bytes):,} bytes", flush=True)

print("All done.")
