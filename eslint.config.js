'use strict';

const browser = { window: 'readonly', document: 'readonly', console: 'readonly', angular: 'readonly', Firebase: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly', alert: 'readonly', confirm: 'readonly', FileReader: 'readonly', Image: 'readonly', Audio: 'readonly', localStorage: 'readonly', location: 'readonly' };
const node = { require: 'readonly', module: 'writable', process: 'readonly', __dirname: 'readonly', console: 'readonly' };
const spec = { describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly', inject: 'readonly', module: 'readonly', vi: 'readonly' };
const rules = { 'no-console': 'warn', 'no-unused-vars': 'warn' };

module.exports = [
	{ ignores: ['build/**', 'node_modules/**', 'bower_components/**', 'styles/css/**'] },
	{ files: ['app/**/*.js'], languageOptions: { ecmaVersion: 'latest', sourceType: 'script', globals: browser }, rules: rules },
	{ files: ['app/**/test/*.spec.js'], languageOptions: { globals: Object.assign({}, browser, spec) } },
	{ files: ['scripts/*.js', 'eslint.config.js', 'gulpfile.js'], ignores: ['scripts/vitest-setup.js'], languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs', globals: node }, rules: rules },
	{ files: ['scripts/vitest-setup.js', 'vitest.config.js'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: browser }, rules: rules }
];
