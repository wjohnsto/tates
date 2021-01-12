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
    external: (id) => /^lodash/.test(id),
    plugins: [resolve({
        customResolveOptions: {
            // @ts-ignore
            isRequire: true,
        }
    }), commonjs(), terser({
        module: true
    })]
};
