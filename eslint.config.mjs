import js from '@eslint/js';
import globals from 'globals';
import {defineConfig,globalIgnores} from 'eslint/config';
import quality from './eslint-rules/index.cjs';
export default defineConfig([
 globalIgnores(['node_modules/**','dist/**','.wrangler/**','tooling/**','legacy/**','*.js','*.py']),
 {files:['server/**/*.mjs','scripts/**/*.mjs','desktop/**/*.cjs','tests/**/*.mjs'],languageOptions:{globals:{...globals.node,...globals.worker}}},
 {files:['web/*.js'],languageOptions:{sourceType:'script',globals:{...globals.browser,status:'off'}}},
 {files:['web/app.js'],languageOptions:{globals:{downloadBlob:'readonly',weeklyPrintHTML:'readonly'}}},
 {files:['web/exportacoes.js'],languageOptions:{globals:{tripCovers:'readonly',wholeDayOn:'readonly',tripTime:'readonly',$:'readonly',esc:'readonly',admin:'readonly',items:'readonly',status:'readonly',week:'readonly',day:'readonly',shift:'readonly',todayISO:'readonly'}},rules:{'no-control-regex':'off'}},
 js.configs.recommended,
 {files:['server/**/*.mjs','desktop/**/*.cjs','web/*.js','scripts/**/*.mjs','tests/**/*.mjs'],plugins:{quality},rules:{'no-empty':['error',{allowEmptyCatch:true}],'no-unused-vars':['error',{caughtErrors:'none',varsIgnorePattern:'^([$]|esc|admin|items|status|week|day|shift|todayISO|downloadBlob|weeklyPrintHTML|makeWorkbook)$'}],'quality/max-lines':['error',{max:350}],'quality/no-direct-console':['warn',{logger:'server/logger.mjs'}],'quality/no-direct-data-access':['error',{modules:['node:sqlite','../server/sqlite-adapter.mjs','./sqlite-adapter.mjs'],bindings:['DB','database','db'],layers:['/web/']}]}},
 {files:['eslint-rules/*.cjs'],languageOptions:{sourceType:'commonjs',globals:globals.node}},
 {files:['scripts/verify-toolkit.mjs'],rules:{'no-unused-vars':'off'}},
 {files:['web/exportacoes.js'],rules:{'no-control-regex':'off'}}
]);
