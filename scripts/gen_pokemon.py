"""Generate 5 cinematic portrait Pokemon images via Nano Banana 2 (Gemini)."""
import base64, json, os, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = open("/root/.gemini-api-key").read().strip()
MODEL = "gemini-3.1-flash-image-preview"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT_DIR = "/root/dev/pokemon-hero/public/pokemon"
os.makedirs(OUT_DIR, exist_ok=True)

ASPECT = (
    "Portrait orientation, 3:4 aspect ratio, taller than wide. "
    "Ultra-photoreal cinematic film still, shot on Arri Alexa, 85mm lens, "
    "shallow depth of field, volumetric lighting, dramatic atmosphere, "
    "hyper-detailed textures, photographic realism (NOT anime, NOT cartoon, NOT illustration). "
    "Solo subject filling roughly 55% of the frame, environment filling the rest. "
    "No text, no logos, no watermarks, no captions anywhere in the image."
)

PROMPTS = [
    {
        "name": "charizard",
        "prompt": (
            "A cinematic photoreal portrait of Charizard, the iconic orange dragon Pokemon, "
            "standing tall and heroic in a vast volcanic lava field at dusk. Its immense leathery "
            "wings are spread wide against a darkening crimson sky. A powerful arc of orange-red "
            "fire breath roars from its maw into the heavens, illuminating the scene. Molten rivers "
            "of glowing magma snake across cracked black basalt behind it, floating ember particles "
            "drift through the hot air, heat haze shimmers. The dominant color palette is deep "
            "crimson red and molten orange, with rim-light catching the edges of scales and wing "
            "membranes. Epic, awe-inspiring, dragon-king energy. " + ASPECT
        ),
    },
    {
        "name": "mewtwo",
        "prompt": (
            "A cinematic photoreal portrait of Mewtwo, the legendary psychic Pokemon, floating "
            "serenely in mid-air inside a futuristic neon cyber chamber. Violet lightning crackles "
            "around its sleek pale body, arcing off its long tail and fingertips. The polished "
            "metallic floor reflects its form like a dark mirror. Faint holographic glyphs and "
            "circuit diagrams glow in the background fog. Cold cinematic tone, clinical yet "
            "menacing. The dominant color palette is deep violet and electric purple with icy "
            "cyan accents. Shallow depth of field isolates Mewtwo, psionic energy distorts the air "
            "around its head. Godlike, intelligent, unsettling presence. " + ASPECT
        ),
    },
    {
        "name": "gengar",
        "prompt": (
            "A cinematic photoreal portrait of Gengar, the ghost Pokemon, emerging from thick "
            "swirling purple fog in a moonlit haunted forest. Its mischievous toothy grin is "
            "half-lit by pale silver moonlight filtering through gnarled bare branches. Small "
            "floating orbs of ghostly blue-white will-o'-wisp light hover around it. Cold ground-"
            "level mist coils around twisted tree roots. Strong chiaroscuro lighting carves the "
            "shadowy silhouette of its spiked body against the mist. The dominant color palette "
            "is dark purple, black, and deep indigo, with cold moonlit highlights. Eerie, "
            "playful, sinister atmosphere. " + ASPECT
        ),
    },
    {
        "name": "lucario",
        "prompt": (
            "A cinematic photoreal portrait of Lucario, the aura Pokemon, seated in cross-legged "
            "zen meditation on a moss-covered stone in a tranquil bamboo forest. Golden sunbeams "
            "filter diagonally through the tall bamboo stalks, catching motes of dust in the air. "
            "A soft luminous blue aura glows around its paws and chest spikes. In the blurred "
            "distance, the silhouette of ancient temple ruins overgrown with ivy. Calm, "
            "contemplative, spiritual mood. The dominant color palette is forest green and teal "
            "with warm golden rim-light. Shallow depth of field, serene stillness, petals and "
            "tiny leaves drifting in the beams. " + ASPECT
        ),
    },
    {
        "name": "rayquaza",
        "prompt": (
            "A cinematic photoreal portrait of Rayquaza, the legendary sky dragon Pokemon, coiled "
            "in a vast spiral through a swirling thunderstorm high in the stratosphere. Its long "
            "serpentine emerald-green scales catch sudden flashes of white lightning. Its tail "
            "wraps dramatically through cyclonic cumulonimbus clouds, yellow fin-markings "
            "glowing. Vast open sky backdrop with storm cells churning, wind-torn wisps of vapor. "
            "The dominant color palette is stormy blue-green, deep teal, and slate gray, with "
            "lightning accents. Mythic, god-tier, apex-predator-of-the-sky energy. " + ASPECT
        ),
    },
]


def call(prompt):
    body = {"contents": [{"parts": [{"text": prompt}]}]}
    req = urllib.request.Request(
        f"{ENDPOINT}?key={API_KEY}",
        method="POST",
        headers={"Content-Type": "application/json"},
        data=json.dumps(body).encode(),
    )
    with urllib.request.urlopen(req, timeout=240) as r:
        payload = json.loads(r.read())
    for part in payload["candidates"][0]["content"]["parts"]:
        inline = part.get("inlineData") or part.get("inline_data")
        if inline:
            return base64.b64decode(inline["data"])
    raise RuntimeError(f"no image: {json.dumps(payload)[:400]}")


def one(p):
    out = os.path.join(OUT_DIR, f"{p['name']}.png")
    last_err = ""
    for attempt in range(3):
        try:
            data = call(p["prompt"])
            with open(out, "wb") as f:
                f.write(data)
            return (p["name"], out, len(data), "ok")
        except urllib.error.HTTPError as e:
            last_err = f"HTTP {e.code}: {e.read()[:200].decode(errors='ignore')}"
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(3 * (attempt + 1))
                continue
            break
        except Exception as e:
            last_err = str(e)[:200]
            time.sleep(2 * (attempt + 1))
    return (p["name"], None, 0, f"FAIL: {last_err}")


if __name__ == "__main__":
    t0 = time.time()
    results = []
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(one, p): p for p in PROMPTS}
        for f in as_completed(futs):
            r = f.result()
            results.append(r)
            print(f"[{r[3][:40]:40}] {r[0]:12} {r[2]:>8} bytes", flush=True)
    print(f"\nTotal: {time.time()-t0:.1f}s")
    json.dump(results, open("/tmp/pokemon_results.json", "w"), indent=2)
