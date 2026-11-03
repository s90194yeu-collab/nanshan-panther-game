"""截圖檢查：桌機與手機橫向各跑一次三種身分，截圖並印出 JS 錯誤。用法：python3 tools/screenshot.py"""
import asyncio, pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / 'index.html').as_uri()
OUT = ROOT / 'shots'; OUT.mkdir(exist_ok=True)

async def shot(p, name, role, **ctx):
    b = await p.chromium.launch()
    c = await b.new_context(**ctx)
    pg = await c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    await pg.click(f'[data-g="{role}"]'); await pg.click('#go'); await pg.wait_for_timeout(400)
    await pg.click('#dB'); await pg.wait_for_timeout(1200)
    await pg.screenshot(path=str(OUT / f'{name}_{role}_play.png'))
    await pg.click('#menubtn'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=str(OUT / f'{name}_{role}_menu.png'))
    await pg.click('[data-m="off"]'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=str(OUT / f'{name}_{role}_offices.png'))
    await pg.click('#dB'); await pg.click('#findbtn'); await pg.fill('#fq', '實驗室'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=str(OUT / f'{name}_{role}_find.png'))
    print(name, role, '錯誤：', errs or '無')
    await b.close()

async def main():
    async with async_playwright() as p:
        for role in ['v', 'j', 's']:
            await shot(p, 'desktop', role, viewport={'width': 1280, 'height': 720})
        await shot(p, 'phone', 'v', viewport={'width': 844, 'height': 390}, device_scale_factor=2, has_touch=True, is_mobile=True)

asyncio.run(main())
