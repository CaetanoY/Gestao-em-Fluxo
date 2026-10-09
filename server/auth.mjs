const enc=new TextEncoder();
export const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export async function digest(value){return hex(await crypto.subtle.digest('SHA-256',enc.encode(value)))}
export async function passwordHash(password,salt=crypto.randomUUID()){
 const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
 const hash=hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256));
 return `pbkdf2:${salt}:${hash}`;
}
export async function verifyPassword(password,stored){if(typeof password!=='string'||password.length>200||!stored)return false;const parts=stored.split(':');if(parts.length!==3||parts[0]!=='pbkdf2')return false;const hash=await passwordHash(password,parts[1]);let diff=hash.length^stored.length;for(let i=0;i<stored.length;i++)diff|=(hash.charCodeAt(i)||0)^stored.charCodeAt(i);return diff===0}
