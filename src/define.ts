import type { Plugin, PluginContext, TransformPluginContext, SourceDescription } from 'rollup'
import type { FilterPattern } from '@rollup/pluginutils'

import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import astMatcher from 'ast-matcher'
import escapeStringRegexp from 'escape-string-regexp'

export interface DefineOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  replacements?: Record<string, string | ((key: string) => string)>
}

type Edit = [number, number]
type AstNode = { start: number; end: number }

export default function define({
  include = ['**/*.{svelte,tsx,ts,mjs,jsx,js,cjs}'],
  exclude,
  replacements = {},
}: DefineOptions = {}): Plugin {
  const filter = createFilter(include, exclude)

  const keys = Object.keys(replacements)
  let matchers: ReturnType<typeof astMatcher>[]

  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
  const firstpass = new RegExp(`(?:${keys.map(escapeStringRegexp).join('|')})`, 'g')

  return {
    name: 'define',
    transform,
    renderChunk(code, chunk) {
      return transform.call(this, code, chunk.fileName)
    },
  }

  function transform(
    this: { parse: TransformPluginContext['parse']; warn: TransformPluginContext['warn'] },
    code: string,
    id: string,
  ): SourceDescription | null {
    if (keys.length === 0) return null
    if (!filter(id)) return null
    if (code.search(firstpass) === -1) return null

    const parse = (code: string, source = code): ReturnType<PluginContext['parse']> => {
      try {
        return this.parse(code, undefined) // eslint-disable-line unicorn/no-useless-undefined
      } catch (error) {
        ;(error as Error).message += ` in ${source}`
        throw error
      }
    }

    const ast = parse(code, id)

    if (!matchers) {
      matchers = keys.map((key) => astMatcher(parse(key)))
    }

    const magicString = new MagicString(code)
    const edits: Edit[] = []

    matchers.forEach((matcher, index) => {
      for (const { node } of (matcher(ast) || []) as { node: AstNode }[]) {
        if (markEdited(node, edits)) {
          const replacement = replacements[keys[index]]

          magicString.overwrite(
            node.start,
            node.end,
            typeof replacement === 'function' ? replacement(keys[index]) : replacement,
          )
        }
      }
    })

    if (edits.length === 0) return null

    return {
      code: magicString.toString(),
      map: magicString.generateMap({ source: code, includeContent: true, hires: true }),
    }
  }
}

function markEdited(node: AstNode, edits: Edit[]): number | false {
  for (const [start, end] of edits) {
    if ((start <= node.start && node.start < end) || (start < node.end && node.end <= end)) {
      return false // Already edited
    }
  }

  // Not edited
  return edits.push([node.start, node.end])
}
