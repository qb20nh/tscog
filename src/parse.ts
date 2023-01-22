const escapeLiteral = (s: string): string =>
  s.replace(/[.\\[^\]()*+?{}|$]/g, '\\$&')

const escapeRegExp = (regexParts: TemplateStringsArray, ...literalParts: string[]): string => {
  return regexParts.raw.map(
    (regexPart, i) => [regexPart, escapeLiteral(literalParts[i] ?? '')]
  ).flat().join('')
}

export const getMatcher = (startDirective: string, endDirective: string, terminatingDirective: string): RegExp => {
  const r = escapeRegExp`(?<beforeLot>(((?<indent>[ \t]*)([^\s]*\n\k<indent>)?)?(?<prefix>\s?[^\s]+\s*)|(?<indent2>[ \t]*)(?<prefix2>[^\s]+\s*))${startDirective}\s*\n(?<generator>((\k<indent>|\k<indent2>)?(\k<prefix>|\k<prefix2>)[^\n]*\n)*?)(\k<indent>|\k<indent2>)?(\k<prefix>|\k<prefix2>)${endDirective}\s*(?:[^\s]+|\n[^\n]*)\n)(?<lot>(?:[^\n]*\n)*?)(?<terminator>[^\n]*${terminatingDirective}[^\n]*(\n|$))`
  return new RegExp(r, 'g')
}
