import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'
import { eslint } from 'rollup-plugin-eslint'

const commonConfig = {
  input: 'src/index.js',
  output: {
    dir: './dist',
    format: 'cjs',
    chunkFileNames: '[name].js',
  },
  plugins: [
    json(),
    nodeResolve({
      dedupe: ['readable-stream'],
    }),
    commonjs({
      include: './node_modules/**',
    }),
    eslint({
      include: ['./src/**'],
      exclude: ['./node_modules/**'],
      throwOnError: true,
      throwOnWarning: true,
    }),
    babel({
      exclude: './node_modules/**',
      runtimeHelpers: true,
    }),
  ],
}

const { input, output, plugins } = commonConfig

const developmentConfig = {
  input,
  output: { ...output, sourcemap: true },
  plugins,
}

const productionConfig = {
  input,
  output,
  plugins: plugins.concat([
    terser({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      },
      sourcemap: false,
    }),
  ]),
  experimentalCodeSplitting: true,
  experimentalDynamicImport: true,
}

const config = process.env.NODE_ENV === 'development' ? developmentConfig : productionConfig

export default config
