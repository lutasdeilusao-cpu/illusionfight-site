import re

with open('src/pages/Tamagoshi/screens/Passear.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix obstacle emojis - use car, rock, tree, SUV, pickup
c = c.replace(
    "e: ['*','O','V','X','#'][Math.floor(Math.random() * 5)]",
    "e: ['\U0001F697','\U0001FAA8','\U0001F333','\U0001F699','\U0001F6FB'][Math.floor(Math.random() * 5)]"
)

# Fix obstacle font size and add emoji font
c = c.replace(
    "ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'",
    "ctx.font = '32px \"Segoe UI Emoji\",\"Apple Color Emoji\",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'"
)

# Spawn obstacles faster (frame 5 instead of 40)
c = c.replace(
    "if (s.frame - (s.lastObs || 0) > Math.max(40, 90 - (s.stage - 1) * 5)) {",
    "if (s.frame - (s.lastObs || 0) > Math.max(5, 90 - (s.stage - 1) * 5)) {"
)

# Fix car emoji font
c = c.replace(
    "ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'",
    "ctx.font = '32px \"Segoe UI Emoji\",\"Apple Color Emoji\",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'"
)

with open('src/pages/Tamagoshi/screens/Passear.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed OK')
