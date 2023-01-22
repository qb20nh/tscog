import { listFilesFromPath, readFileAsString } from './io'
import { getGeneratorBlocks } from './build'

export const main = async (): Promise<void> => {
  const files = await listFilesFromPath('./src/**/*.ts')
  files.forEach((file) => {
    void (async (file) => {
      const content = await readFileAsString(file)
      const filename = file.split(/[^\\](\/)/g)?.pop()
      if (filename === undefined) {
        throw new Error('Cannot parse file name')
      }
      console.log(filename, getGeneratorBlocks(content, '@cog', '@start', '@end'))
    })(file)
  })
}
