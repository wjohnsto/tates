import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'dist/index.js',
    output: {
        file: 'index.js',
        format: 'cjs',
        exports: 'named',
    },
    external: (id) => /^mintility/.test(id),
    plugins: [resolve(), commonjs(), terser({
        module: true
    })]
};
