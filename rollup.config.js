import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';
import uglify from 'rollup-plugin-uglify';
import { argv } from 'yargs';

const babelOptions = {
    presets: [ 'es2015-rollup' ],
    plugins: [
        'transform-object-rest-spread',
        'transform-export-extensions'
    ],
    babelrc: false
};

const format = argv.format || argv.f || 'iife';
const compress = argv.uglify;

const dest = {
    amd:  `dist/amd/router5-history${ compress ? '.min' : '' }.js`,
    umd:  `dist/umd/router5-history${ compress ? '.min' : '' }.js`,
    iife: `dist/browser/router5-history${ compress ? '.min' : '' }.js`
}[format];

export default {
    entry: 'modules/index.js',
    format,
    plugins: [ babel(babelOptions), npm({ jsnext: true }) ].concat(compress ? uglify() : []),
    moduleName: 'router5HistoryPlugin',
    moduleId: 'router5HistoryPlugin',
    dest
};
