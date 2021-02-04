import { NodePath, types, PluginObj, template } from '@babel/core'
import { EvalCache } from '@linaria/babel-preset'
import writeCss from './babel-visitor-write-css'

import type {
  LinariaTransformOptions,
  WrapperPluginOptions,
  WrapperPluginState
} from './types'
import { getHash } from './util'

const cache = new Map<string, { hash: string; cssFilename?: string }>()

export default function plugin(
  {
    types: t
  }: {
    types: typeof types
  },
  options: WrapperPluginOptions & Partial<LinariaTransformOptions>
): PluginObj<WrapperPluginState> {
  return {
    name: 'babel-preset-next-linaria',
    visitor: {
      Program: {
        enter(nodePath: NodePath<types.Program>, state: WrapperPluginState) {
          const filename = state.file.opts.filename
          const hash = getHash(state.file.code)
          const cached = cache.get(filename)
          if (cached && cached.hash === hash) {
            if (cached.cssFilename) {
              const importUseStyling = template.ast`require('${cached.cssFilename}')`
              nodePath.unshiftContainer('body', importUseStyling)
            }
            return
          }
          cache.set(filename, { hash })
          state.hash = hash
          state.options = options
          EvalCache.clearForFile(filename)
        },
        exit(nodePath: NodePath<types.Program>, state: WrapperPluginState) {
          if (!state.hash) {
            return
          }
          writeCss(nodePath, state, t)
          if (state.cssFilename) {
            cache.set(state.file.opts.filename, {
              hash: state.hash,
              cssFilename: state.cssFilename
            })
            const importUseStyling = template.ast`require('${state.cssFilename}')`
            nodePath.unshiftContainer('body', importUseStyling)
          }
        }
      }
    }
  }
}
