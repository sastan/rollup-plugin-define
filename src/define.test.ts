import type { RollupOutput, OutputChunk, OutputAsset } from 'rollup'

import { rollup } from 'rollup'
import { stripIndent } from 'common-tags'

import define from './define'

test('defines common replacements', async () => {
  const bundle = await rollup({
    input: 'main.js',
    plugins: [
      define({
        replacements: {
          'process.env.NODE_ENV': '"production"',
          'typeof window': '"object"',
          'process.browser': 'true',
        },
      }),
      {
        name: 'main.js',
        resolveId(id) {
          return id
        },
        load(importee) {
          if (importee === 'main.js') {
            return stripIndent`
              export const NODE_ENV = process.env.NODE_ENV
              export const HAS_WINDOW = typeof window === 'object'
              export const IS_BROWSER = process.browser
            `
          }
        },
      },
    ],
  })

  const chunk = getOutputFromGenerated(await bundle.generate({ format: 'es' }))

  expect(chunk.code.trim()).toBe(stripIndent`\
    const NODE_ENV = "production";
    const HAS_WINDOW = "object" === 'object';
    const IS_BROWSER = true;

    export { HAS_WINDOW, IS_BROWSER, NODE_ENV };
  `)
})

test('skips if no replacements', async () => {
  const bundle = await rollup({
    input: 'main.js',
    plugins: [
      define({
        replacements: {},
      }),
      {
        name: 'main.js',
        resolveId(id) {
          return id
        },
        load(importee) {
          if (importee === 'main.js') {
            return stripIndent`
              export const NODE_ENV = process.env.NODE_ENV
              export const HAS_WINDOW = typeof window === 'object'
              export const IS_BROWSER = process.browser
            `
          }
        },
      },
    ],
  })

  const chunk = getOutputFromGenerated(await bundle.generate({ format: 'es' }))

  expect(chunk.code.trim()).toBe(stripIndent`\
    const NODE_ENV = process.env.NODE_ENV;
    const HAS_WINDOW = typeof window === 'object';
    const IS_BROWSER = process.browser;

    export { HAS_WINDOW, IS_BROWSER, NODE_ENV };
  `)
})

test('uses first matching replacements', async () => {
  const bundle = await rollup({
    input: 'main.js',
    plugins: [
      define({
        replacements: {
          'process.env.NODE_ENV': '"development"',
          'process.env': '{}',
        },
      }),
      {
        name: 'main.js',
        resolveId(id) {
          return id
        },
        load(importee) {
          if (importee === 'main.js') {
            return stripIndent`
              export const PORT = process.env.PORT
              export const NODE_ENV = process.env.NODE_ENV
              export const ENV = process.env
            `
          }
        },
      },
    ],
  })

  const chunk = getOutputFromGenerated(await bundle.generate({ format: 'es' }))

  expect(chunk.code.trim()).toBe(stripIndent`\
    const PORT = {}.PORT;
    const NODE_ENV = "development";
    const ENV = {};

    export { ENV, NODE_ENV, PORT };
  `)
})
function getOutputFromGenerated(generated: RollupOutput): OutputChunk {
  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
  const chunk = generated.output.find(isChunk)

  if (chunk) return chunk

  throw new Error('No chunk found')
}

function isChunk(chunk: OutputChunk | OutputAsset): chunk is OutputChunk {
  return chunk.type === 'chunk' && chunk.isEntry
}
