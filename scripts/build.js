'use strict';
// Build for funglr: Node 22, no Ruby, no gulp. Writes build/.
// Rules (contracts/module-layout.md@3a30feff...):
//  scripts   app/**/js/**/*.js (not specs): *Module.js first, then *Config.js, then the rest, each group in path order -> build/js/main.js
//  templates app/**/*.html (every template a templateUrl names, e.g. app/user/profile.html,
//            app/auth/login.html, app/main/include/**), copied to build/<same relative path>
//  styles    styles/sass/main.scss (partials under styles/sass and app/**/styles/_*.scss are pulled in by it) -> build/css/main.min.css
const fs = require('fs');
const path = require('path');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'build');

function walk(dir, acc) {
	if (!fs.existsSync(dir)) { return acc; }
	fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
		const full = path.join(dir, e.name);
		if (e.isDirectory()) { walk(full, acc); } else { acc.push(full); }
	});
	return acc;
}

function rel(f) { return path.relative(root, f).split(path.sep).join('/'); }

function scriptFiles() {
	const all = walk(path.join(root, 'app'), []).map(rel).filter(function (f) {
		return /^app\/(?:.*\/)?js\/.*\.js$/.test(f) && !/\.spec\.js$/.test(f);
	}).sort();
	const mods = all.filter(function (f) { return /Module\.js$/.test(f); });
	const cfgs = all.filter(function (f) { return /Config\.js$/.test(f) && mods.indexOf(f) < 0; });
	const rest = all.filter(function (f) { return mods.indexOf(f) < 0 && cfgs.indexOf(f) < 0; });
	return mods.concat(cfgs, rest);
}

function templateFiles() {
	return walk(path.join(root, 'app'), []).map(rel).filter(function (f) { return /\.html$/.test(f); }).sort();
}

function build() {
	fs.mkdirSync(path.join(out, 'js'), { recursive: true });
	fs.mkdirSync(path.join(out, 'css'), { recursive: true });

	const scripts = scriptFiles();
	const js = scripts.map(function (f) { return fs.readFileSync(path.join(root, f), 'utf8'); }).join(';\n');
	fs.writeFileSync(path.join(out, 'js', 'main.js'), js + '\n');

	const templates = templateFiles();
	templates.forEach(function (f) {
		const dest = path.join(out, f);
		fs.mkdirSync(path.dirname(dest), { recursive: true });
		fs.copyFileSync(path.join(root, f), dest);
	});

	const css = sass.compile(path.join(root, 'styles/sass/main.scss'), { style: 'compressed', quietDeps: true, silenceDeprecations: ['import', 'global-builtin', 'color-functions'] });
	fs.writeFileSync(path.join(out, 'css', 'main.min.css'), css.css);

	console.log('build: ' + scripts.length + ' scripts, ' + templates.length + ' templates, css ' + css.css.length + ' bytes -> build/');
}

module.exports = { build: build, scriptFiles: scriptFiles, templateFiles: templateFiles };

if (require.main === module) { build(); }
