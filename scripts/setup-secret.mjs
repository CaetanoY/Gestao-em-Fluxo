import {passwordHash} from '../server/auth.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
const password=process.env.FROTA_ADMIN_PASSWORD;
if(!password||password.length<10)throw new Error('Defina FROTA_ADMIN_PASSWORD com a senha administrativa (mínimo 10 caracteres).');
const hash=await passwordHash(password);
await writeFile('.dev.vars','ADMIN_PASSWORD_HASH='+hash+'\n');
await mkdir('secrets',{recursive:true});await writeFile('secrets/admin-hash.txt',hash);
console.log('Hash local preparado. Os arquivos de credenciais são ignorados pelo Git.');
