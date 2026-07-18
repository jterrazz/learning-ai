import { intelligence } from '@jterrazz/intelligence/oxlint';
import { oxlint } from '@jterrazz/typescript';
import { defineConfig } from 'oxlint';

export default defineConfig({
    extends: [oxlint.node, oxlint.hexagonal],
    jsPlugins: intelligence.jsPlugins,
    rules: {
        ...intelligence.rules,
        'import/exports-last': 'off',
        'typescript/parameter-properties': 'off',
    },
});
