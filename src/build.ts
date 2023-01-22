/**
 * Build process
 *
 * 1. Read files by glob pattern
 * 2. For each file,
 *   a. Scan content for generator blocks
 *   b. If found, parse and write temporary generate files
 *   c. Invoke command with temporary file as argument
 *   d. write stdout of the program to lots with parsed positions
 *   e. remove temporary file
 * 3. Report status
 */

import { getMatcher } from './parse'

import 'core-js/actual/string'

export const getGeneratorBlocks = (contentString: string, startDirective: string, endDirective: string, terminatingDirective: string): GeneratorBlock[] => {
  const matcher = getMatcher(startDirective, endDirective, terminatingDirective)
  return [...contentString.matchAll(matcher)]
    .map(
      ({ groups: { indent2 = '', indent = indent2, prefix2 = '', prefix = prefix2, generator = '', lot = '', beforeLot = '' } = {}, index = -1 }) => {
        if (index < 0) {
          throw new Error('Cannot find generator block')
        }
        return {
          position: index + beforeLot.length, // skip generator block itself
          length: lot.length - 1, // exclude last newline
          indent,
          generator:
            ('\n' + generator)
              .replaceAll('\n' + indent + prefix, '\n')
              .slice(1)
        }
      }
    )
}

export const transformFile = (contentString: string, output: string, generator: GeneratorBlock): string => {
  return ''
}
