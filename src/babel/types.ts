import type { PluginPass } from '@babel/core'
import type { LinariaMetadata } from '@linaria/babel-preset'

export type {
  PluginOptions as LinariaOptions,
  Options as LinariaTransformOptions
} from '@linaria/babel-preset'

export type PreprocessorFn = (selector: string, cssText: string) => string
export type Preprocessor = 'none' | 'stylis' | PreprocessorFn | void

export interface WrapperPluginOptions {
  sourceMap: boolean
  cacheDirectory: string
  preprocessor: Preprocessor
  extension: string
}

export type WrapperPluginState = PluginPass & {
  cache: Map<string, string>
  options: WrapperPluginOptions
  hash: string
  cssFilename?: string
  file: {
    opts: {
      filename: string
    }
    metadata: babel.BabelFileMetadata & {
      linaria: LinariaMetadata
    }
  }
}
