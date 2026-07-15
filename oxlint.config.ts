import { oxlint } from '@jterrazz/typescript';
import { defineConfig } from 'oxlint';

export default defineConfig({
    extends: [oxlint.node, oxlint.hexagonal],
    rules: {
        'import/exports-last': 'off',
        'typescript/parameter-properties': 'off',
    },
});
