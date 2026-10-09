import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {handle} from './api.mjs';
import {resolve,extname} from 'node:path';
import {adapter} from './sqlite-adapter.mjs';
const root=resolve(import.meta.dirname,'..');await mkdir(resolve(root,'.wrangler/local'),{recursive:true});
const database=new DatabaseSync(resolve(root,'.wrangler/local/frota.sqlite'));
database.exec(await readFile(resolve(root,'migrations/0001_initial.sql'),'utf8'));
database.exec(await readFile(resolve(root,'migrations/0002_accounts.sql'),'utf8'));
database.exec(await readFile(resolve(root,'migrations/0003_deleted_accounts.sql'),'utf8'));
let vars={};try{for(const line of (await readFile(resolve(root,'.dev.vars'),'utf8')).split(/\r?\n/)){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m)vars[m[1]]=m[2].replace(/^"|"$/g,'')}}catch{}
const env={DB:adapter(database),...vars,ASSETS:{async fetch(request){let path=new URL(request.url).pathname;if(path==='/')path='/index.html';const target=resolve(root,'web','.'+decodeURIComponent(path));if(!target.startsWith(resolve(root,'web')+'/')&&!target.startsWith(resolve(root,'web')+'\\'))return new Response('Not found',{status:404});try{const content=await readFile(target);return new Response(content,{headers:{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'})[extname(target)]||'application/octet-stream'}})}catch{return new Response('Not found',{status:404})}}}};
const server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const url='http://'+req.headers.host+req.url;const response=await handle(new Request(url,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)}),env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))}catch{res.writeHead(500);res.end('Server error')}});
server.listen(Number(process.env.PORT||8080),'127.0.0.1',()=>console.log('Frota local: http://localhost:'+(process.env.PORT||8080)));
