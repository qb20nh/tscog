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

class Annotation {
  constructor(readonly name: string) {}
}
type BasicStringCoercibleTypes = string | number | object | boolean | bigint
type StringTagFunction = (s: TemplateStringsArray, ...args: (BasicStringCoercibleTypes|Annotation)[]) => (opts: string) => RegExp
type Annotator = (name: string) => Annotation
type Evaluator = (
  tag: StringTagFunction,
  sep: Annotator
) => RegExp | ((opts: string) => RegExp)

/**
 * is this even possible?
 * T: tag function
 * g: make new group
 * @example
 * createRegExp(
 *   (T, g, {keepWhiteSpace: s, comment: _}) =>
 *     T`${g('protocol')}(?:(?:(https?|ftp):)?\/\/)
 *       ${g('user:pass')}(?:([^:\n\r]+):([^@\n\r]+)@)?$
 *       ${g('domain')}(?:(?:www\.)?([^\/\n\r]+))
 *       ${g('request')}(\/[^?\n\r]+)?
 *       ${g('query')}(\?[^#\n\r]*)?
 *       ${g('anchor')}(#?[^\n\r]*)?${s}
 *       no trimming newline${s}
 *       ${s.end}no trimming whitespace${s}
 *       ${s.end}combine options
 *       ${g('some group name')}explicit g.end${g.end}`('gmu')
 * )
 */
export const createRegExp = (evaluator: Evaluator) => {
  const sep = (name: string) => Object.freeze(new Annotation(name))
  const escapeLiteral = (s: BasicStringCoercibleTypes) =>
    s.toString().replace(/[.\\[^\]()*+?{}|$]/g, '\\$&')
  const tag = (regexParts: TemplateStringsArray, ...literalParts: (BasicStringCoercibleTypes|Annotation)[]) => (opts: string) =>
    new RegExp(regexParts.raw.map(
      (part, index) => {
        const literal = literalParts[index]
        if (literal instanceof Annotation) {
          return part
        }
        return [part, escapeLiteral(literal ?? '')]
      }
    ).flat().join(''), opts)

  const result = evaluator(tag, sep)
  if (typeof result === 'function') {
    return result('')
  }
  return result
}
