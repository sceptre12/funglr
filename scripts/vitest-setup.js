import { beforeEach as be, afterEach as ae } from 'vitest';
import 'angular';
// angular-mocks 1.3.15 defines module/inject only when window.mocha or window.jasmine exists
let ctx = {};
be(() => { ctx = {}; });
window.mocha = {};
window.beforeEach = (fn) => be(() => fn.call(ctx));
window.afterEach = (fn) => ae(() => fn.call(ctx));
await import('angular-mocks');
