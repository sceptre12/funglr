import { defineConfig } from 'vitest/config';
export default defineConfig({
	test: { environment: 'jsdom', globals: true, include: ['app/**/test/*.spec.js'], setupFiles: ['scripts/vitest-setup.js'] }
});
