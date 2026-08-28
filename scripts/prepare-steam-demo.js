import { copyFile, mkdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const executableName = 'IllusionFightDemo.exe'
const source = resolve('src-tauri', 'target', 'release', executableName)
const destinationDirectory = resolve('steam', 'content')
const destination = resolve(destinationDirectory, executableName)

try {
  await stat(source)
} catch {
  throw new Error(`Executável desktop não encontrado: ${source}`)
}

await mkdir(destinationDirectory, { recursive: true })
await copyFile(source, destination)

console.log(`[STEAM] Demo preparada em: ${destination}`)
