const { terser } = require('rollup-plugin-terser');

module.exports = {
  // this function will run for each entry/format/env combination

  rollup(config, options) {
    if (options.format === 'esm' || options.env === 'production') {
      config.plugins.push(terser({
        sourcemap: true,
        module:    true,
        compress:  {
          'keep_fargs':   false,
          'pure_getters': true,
          'hoist_funs':   true,
          toplevel:       true,
          passes:         2
        },
        mangle: {
          properties: {
            regex: /_$/u
          }
        },
        output: {
          comments: false
        },
        nameCache: {}
      }));
    }

    return config;
  }
};
