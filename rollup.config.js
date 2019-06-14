import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'
import { eslint } from 'rollup-plugin-eslint'

const commonConfig = {
  input: ['src/index.js', 'src/logMq.js'],
  output: {
    dir: './dist',
    format: 'cjs',
  },
  plugins: [
    json(),
    nodeResolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
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
  external: ['mongoose', 'bluebird', 'amqplib'],
}

const {
  input, output, plugins, external,
} = commonConfig

const developmentConfig = {
  input,
  output: { ...output, sourcemap: true },
  plugins,
  external,
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
  experimentalOptimizeChunks: true,
  external,
}

const config = process.env.NODE_ENV === 'development' ? developmentConfig : productionConfig

export default config
