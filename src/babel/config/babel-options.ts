import { StrictOptions } from '@linaria/babel-preset'
import { WrapperPluginOptions } from '../types'
import { getConfigPaths } from './read-path-configs'

export default function getBabelOptions(
  options: Partial<StrictOptions & WrapperPluginOptions>
) {
  if (options.babelOptions) {
    return options
  }
  const { paths, baseUrl } = getConfigPaths()

  if (!paths) {
    return options
  }

  return {
    babelOptions: {
      plugins: [
        [
          'babel-plugin-module-resolver',
          {
            root: [baseUrl || './'],
            alias: Object.keys(paths).reduce((accum, key) => {
              accum[key.replace(/\/\*$/, '')] = paths[key].map((s) =>
                s.replace(/\/\*$/, '')
              )[0]
              return accum
            }, {} as Record<string, string>),
            extensions: ['.tsx', '.ts']
          }
        ]
      ]
    },
    ...options
  }
}
