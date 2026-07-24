🔎 = Feature/functionality missing that was present previously

🆕 = New feature/functionality

🐛 = Working, needs a bug fix

✅ = Complete

❌ = Rejected

⏸️ = On hold

* ✅ ~~run commands sent from chat bridge~~
* ✅ ~~offline storage viewing~~ // local HTML viewer (`alt-offline-storage-viewer/viewer.html`); loads merged.json, caches in localStorage, ctrl+f friendly
* ✅ ~~for tablist, cache user heads to disk, parallel pulls seem to hit a limit and return lots of empty head pics~~ // lives in Hub, completed there
* ✅ ~~`/mosiac` (not sure on the name), builds an image using all the cached heads (why not reuse em if we have all the data anyway?)~~
* ✅ ~~add mobile friendly tablist, including a "Mobile Friendly" button that refreshes normal tablist to a mobile friendly one~~ // demoed interactively before building (dynamic sizing, column count, crop-vs-stretch bg, all tuned against real preview renders, not guessed). Hub: `util/generate/tablist/drawMobile.ts` (new, portrait 1080x1920) + `shared.ts` (bg/ping helpers extracted out of `draw.ts` so both renderers use one copy) + `tablist.ts`/`getTablist.ts` dispatch on a `mobile` query param. Discord: `/tablist mobile:true` option, "Mobile Friendly" button on the normal view (`tablist_to_mobile(_lossless)`), its own refresh button once in mobile mode (`tablist_mobile_refresh(_lossless)`)