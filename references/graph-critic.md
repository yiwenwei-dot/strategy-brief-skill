# Graph-critic loop

**Render → critique → fix → repeat.** Do this with an actual agent reading the rendered images. The #1 failure is skipping this and eyeballing it yourself.

## 1. Render (macOS / headless Chrome + sips)

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# full page (tall window); bump height if the page is longer
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1120,8400 \
  --screenshot=/tmp/page.png "file://$PWD/plan.html"
# legible slices for the critic (Read can downscale a tall image)
H=$(sips -g pixelHeight /tmp/page.png | awk '/pixelHeight/{print $2}')
for off in 0 1500 3000 4400 5800 7000; do
  sips -c 1400 1120 --cropOffset $off 0 /tmp/page.png --out /tmp/band-$off.png >/dev/null 2>&1
done
# hi-DPI crop of one figure: --force-device-scale-factor=2 + a short window
```

Render the **live URL** too after deploy to confirm CDN/JS (e.g. a marked.js report renderer).

## 2. Critique (spawn an agent that READS the images)

Prompt the agent with the band PNGs and, per figure, ask for: **(1) Clarity** — anything illegible / low-contrast / clipped / overflowing / confusing at a glance? **(2) Data-honesty** — bars proportional on a real shared axis; no mixed units; no white-on-light labels? **(3) On-brand / polish.** Ask it to name the single worst offender and the exact CSS/markup fix. Report only, no edits.

## 3. Known pitfalls (check these first)

- **Invisible bar fills** — a child `<div class="fill" style="width:X%">` with `height:100%` collapses when the track has no height context. **Fix:** paint the bar as a gradient on the track: `style="background:linear-gradient(90deg,COLOR 0 X%, var(--track) X% 100%)"`.
- **White value labels on light bars** (contrast ≈1:1, invisible). **Fix:** dark labels OUTSIDE the bar (`.bval`), or a `text-shadow:0 1px 2px rgba(0,0,0,.6)` on saturated fills.
- **Mixed units on one bar axis** ("70,000", "88%", "retreating"). **Fix:** use the crowded-vs-sparse chip columns, not bars.
- **Non-proportional widths** ($79 drawn longer than $99). **Fix:** compute width = value/axis-max; state the axis.
- **Two incompatible models in one chart** (e.g. 50% vs 30% activation). **Fix:** split into two clearly-labeled panels.
- **Citations that jump to an on-page list** feel broken. **Fix:** link each `[n]` straight to the source URL, `target="_blank"`.

## 4. Iterate

Apply the top fix, re-render the affected band, confirm, then re-run the critic until every figure is PASS. Record the final verdicts.

## 5. Deploy-verify (after deploy)

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://DOMAIN/PATH         # 200
curl -s https://DOMAIN/PATH | grep -c 'noindex,nofollow'            # unlisted
curl -s https://DOMAIN/PATH | grep -c 'KEY_PHRASE'                  # content present
curl -s https://DOMAIN/sitemap.xml | grep -c PATH                  # 0 if unlisted
```
