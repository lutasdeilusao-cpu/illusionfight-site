import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

await page.goto('http://localhost:5173/prototype?tab=board')
await page.waitForTimeout(3000)
await page.screenshot({ path: 'phase2-v2.png', fullPage: false })

await page.goto('http://localhost:5173/prototype?tab=combat')
await page.waitForTimeout(3000)
await page.screenshot({ path: 'phase3-v2.png', fullPage: false })

await browser.close()
