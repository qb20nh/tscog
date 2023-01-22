import { Glob } from 'glob'
import { promises as fs } from 'fs'

export const listFilesFromPath = async (pattern: string, signal?: AbortSignal): Promise<string[]> =>
  await new Promise<string[]>((resolve, reject) => {
    try {
      const glob = new Glob(pattern, (error, matches) => {
        if (error !== null) {
          reject(error)
        }
        resolve(matches)
      })
      if (signal != null) {
        const onAbort = (): void => {
          glob.abort()
          signal.removeEventListener('abort', onAbort)
        }
        signal.addEventListener('abort', onAbort, { once: true })
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        reject(e)
      } else {
        throw e
      }
    }
  })

listFilesFromPath.timeout = async (pattern: string, timeout: number): Promise<string[]> => {
  const ac = new AbortController()
  const timer = setTimeout(() => {
    ac.abort()
    clearTimeout(timer)
  }, timeout)
  return await listFilesFromPath(pattern, ac.signal)
}

Object.freeze(listFilesFromPath)

export const readFileAsString = async (path: string, encoding: BufferEncoding = 'utf8'): Promise<string> => {
  return await fs.readFile(path, { encoding })
}
