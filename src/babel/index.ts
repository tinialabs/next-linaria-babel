/**
 * File defines babel preset for Linaria.
 * It uses ./extract function that is an entry point for styles extraction.
 * It also bypass babel options defined in Linaria config file with it's defaults (see ./utils/loadOptions).
 */

import linariaPreset from '@linaria/babel-preset'
import type { PluginOptions as LinariaPluginOptions } from '@linaria/babel-preset'
import type { ConfigAPI } from '@babel/core'
import wrapperPlugin from './babel-plugin-linaria-wrapper'
import { WrapperPluginOptions } from './types'
import getBabelOptions from './config/babel-options'

export default function nextLinariaBabelPreset(
  babel: ConfigAPI,
  options: LinariaPluginOptions & WrapperPluginOptions
) {
  const refinedOptions = {
    displayName: process.env.NODE_ENV === 'production' ? false : true,
    sourceMap: process.env.NODE_ENV !== 'production',
    ...getBabelOptions(options)
  }
  const { plugins } = linariaPreset(
    babel,
    refinedOptions as LinariaPluginOptions
  ) as {
    plugins: any[][]
  }

  if (plugins) {
    plugins.push([wrapperPlugin, refinedOptions as WrapperPluginOptions])
    return { plugins }
  } else {
    return {}
  }
}
