import * as path from 'path'
import * as fs from 'fs'
import { NodePath, types } from '@babel/core'
import mkdirp from 'mkdirp'
import normalize from 'normalize-path'
import type { WrapperPluginState } from './types'
import linariaGenerateCss from './linaria-generate-css'

/**
 * Get Css modules for tailwind classes and write to linaria cache
 */
export default function writeCss(
  nodePath: NodePath<types.Program>,
  state: WrapperPluginState,
  t: typeof types
) {
  const {
    cacheDirectory = './.linaria-cache',
    extension = '.linaria.module.css'
  } = state.options || {}

  const root = process.cwd()
  const resourcePath = state.file.opts.filename
  const baseOutputFileName = resourcePath.replace(/\.[^.]+$/, extension)

  const outputFilename = normalize(
    path.join(
      path.isAbsolute(cacheDirectory)
        ? cacheDirectory
        : path.join(process.cwd(), cacheDirectory),
      resourcePath.includes(root)
        ? path.relative(root, baseOutputFileName)
        : baseOutputFileName
    )
  )

  const result = linariaGenerateCss(state.file.code, state.file.metadata, {
    ...state.options,
    filename: path.relative(process.cwd(), resourcePath),
    outputFilename
  })

  if (result.cssText) {
    state.cssFilename = path.relative(
      path.dirname(resourcePath),
      outputFilename
    )

    let { cssText } = result

    if (state.options.sourceMap) {
      cssText += `/*# sourceMappingURL=data:application/json;base64,${Buffer.from(
        result.cssSourceMapText || ''
      ).toString('base64')}*/`
    }

    // Read the file first to compare the content
    // Write the new content only if it's changed
    // This will prevent unnecessary WDS reloads
    let currentCssText

    try {
      mkdirp.sync(path.dirname(outputFilename))
      currentCssText = fs.readFileSync(outputFilename, 'utf-8')
    } catch (e) {
      // Ignore error
    }

    if (currentCssText !== cssText) {
      fs.writeFileSync(outputFilename, cssText)
    }
  }
}
