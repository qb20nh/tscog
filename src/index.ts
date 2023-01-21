interface GeneratorBlock {
  generator: string
  indent: string
  index: number
}

const escapeLiteral = (s: string) => s.replace(/[.\\[^\]()*+?{}|$]/g, '\\$&')

const escapeRegExp = (regexParts: TemplateStringsArray, ...literalParts: string[]) => {
  return regexParts.raw.map((rp, i) => [rp.replaceAll('\\', '\\\\'), escapeLiteral(literalParts[i] ?? '')]).flat().join('')
}

const getMatcher = (startDirective: string, endDirective: string, terminatingDirective: string) => {
  const r = escapeRegExp`(?<indent>[ \t]*)(?<prefix>[^\s]+\s*)${startDirective}\s*\n\s*(?<generator>(?:\k<prefix>[^\n]*\n)+)\k<prefix>${endDirective}\s*(?:[^\s]+|\n[^\n]*)\n(?<lot>(?:[^\n]*\n)+)(?<terminator>[^\n]*${terminatingDirective}[^\n]*\n)`
  return new RegExp(r, 'g')
}

export const getGeneratorBlocks = (raw: string, startDirective: string, endDirective: string, terminatingDirective: string): GeneratorBlock[] => {
  const matcher = getMatcher(startDirective, endDirective, terminatingDirective)
  return [...raw.matchAll(matcher)]
    .map(
      ({groups: {indent = '', prefix, generator} = {}, index = -1})=>
        ({index, indent, generator: ('\n'+generator).replaceAll('\n'+prefix, '\n').slice(1)})
    )
}
