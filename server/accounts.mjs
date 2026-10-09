import {digest,passwordHash,verifyPassword} from './auth.mjs';
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});
const userCookie=(token,req,clear=false)=>`frota_user=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear?0:43200}${new URL(req.url).protocol==='https:'?'; Secure':''}`;
export async function currentUser(req,env){const token=req.headers.get('Cookie')?.match(/(?:^|;\s*)frota_user=([^;]+)/)?.[1];if(!token)return null;return env.DB.prepare('SELECT u.id,u.name,u.email FROM users u JOIN user_sessions s ON s.user_id=u.id WHERE s.hash=? AND s.expires_at>? AND NOT EXISTS (SELECT 1 FROM deleted_accounts d WHERE d.user_id=u.id)').bind(await digest(token),Date.now()).first();}
export async function accountRoutes(req,env,{body,limit,ip}){
 const path=new URL(req.url).pathname;if(!path.startsWith('/api/account/'))return null;
 if(['/api/account/register','/api/account/login'].includes(path)&&req.method==='POST'){
  await limit(env,'account:'+ip,15,900);const d=await body(req),email=String(d.email||'').trim().toLowerCase();
  if(email.length>160||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof d.password!=='string'||d.password.length>200)return json({error:'Informe e-mail e senha válidos.'},400);
  let user;
  if(path.endsWith('/register')){
   const name=String(d.name||'').trim();if(!name||name.length>100||d.password.length<8)return json({error:'Preencha seu nome e uma senha com pelo menos 8 caracteres.'},400);
   const id=crypto.randomUUID(),hash=await passwordHash(d.password);
   const result=await env.DB.prepare('INSERT OR IGNORE INTO users(id,name,email,password_hash,created_at) VALUES (?,?,?,?,?)').bind(id,name,email,hash,new Date().toISOString()).run();
   if(!result.meta.changes)return json({error:'Cadastro não concluído. Tente entrar com seu e-mail ou use outro endereço.'},409);
   user={id,name,email};
  }else{
   const found=await env.DB.prepare('SELECT id,name,email,password_hash FROM users WHERE email=? AND NOT EXISTS (SELECT 1 FROM deleted_accounts d WHERE d.user_id=users.id)').bind(email).first();
   if(!found||!await verifyPassword(d.password,found.password_hash))return json({error:'E-mail ou senha incorretos.'},401);
   user={id:found.id,name:found.name,email:found.email};
  }
  const token=crypto.randomUUID()+crypto.randomUUID();await env.DB.prepare('DELETE FROM user_sessions WHERE expires_at<?').bind(Date.now()).run();
  await env.DB.prepare('INSERT INTO user_sessions(hash,user_id,expires_at) VALUES (?,?,?)').bind(await digest(token),user.id,Date.now()+43200000).run();return json({user},200,{'Set-Cookie':userCookie(token,req)});
 }
 const user=await currentUser(req,env);if(!user)return json({error:'Entre na sua conta para continuar.'},401);
 if(path==='/api/account/me'&&req.method==='GET')return json({user});
 if(path==='/api/account/logout'&&req.method==='POST'){const token=req.headers.get('Cookie')?.match(/(?:^|;\s*)frota_user=([^;]+)/)?.[1];await env.DB.prepare('DELETE FROM user_sessions WHERE hash=?').bind(await digest(token)).run();return json({ok:true},200,{'Set-Cookie':userCookie('',req,true)});}
 if(path==='/api/account/requests'&&req.method==='GET'){const rows=await env.DB.prepare("SELECT payload FROM requests WHERE json_extract(payload,'$.userId')=? ORDER BY created_at DESC LIMIT 200").bind(user.id).all();return json({items:rows.results.map(x=>{const r=JSON.parse(x.payload);return {id:r.id,date:r.date,returnDate:r.returnDate||r.date,vehicle:r.vehicle,start:r.start,end:r.end,allDay:!!r.allDay,status:r.status}})});}
 if(path==='/api/account/notifications'&&req.method==='GET'){const rows=await env.DB.prepare('SELECT id,request_id,status,vehicle,date,created_at FROM notifications WHERE user_id=? AND seen_at IS NULL ORDER BY created_at LIMIT 50').bind(user.id).all();return json({items:rows.results});}
 if(path==='/api/account/notifications/seen'&&req.method==='POST'){const d=await body(req);if(!Array.isArray(d.ids)||d.ids.length>50||d.ids.some(x=>typeof x!=='string'||x.length>100))return json({error:'Avisos inválidos.'},400);if(d.ids.length)await env.DB.prepare('UPDATE notifications SET seen_at=? WHERE user_id=? AND id IN ('+d.ids.map(()=>'?').join(',')+')').bind(new Date().toISOString(),user.id,...d.ids).run();return json({ok:true});}
 return json({error:'Rota não encontrada.'},404);
}
export async function decisionNotification(env,trip){if(!trip.userId)return;await env.DB.prepare('INSERT INTO notifications(id,user_id,request_id,status,vehicle,date,created_at) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),trip.userId,trip.id,trip.status==='Agendada'?'Aprovada':trip.status,trip.vehicle,trip.date,new Date().toISOString()).run();}
export async function adminAccounts(req,env,{body}){
 const path=new URL(req.url).pathname;
 if(path==='/api/users'&&req.method==='GET'){const rows=await env.DB.prepare('SELECT id,name,email,created_at FROM users WHERE NOT EXISTS (SELECT 1 FROM deleted_accounts d WHERE d.user_id=users.id) ORDER BY name').all();return json({users:rows.results});}
 const match=path.match(/^\/api\/users\/([^/]+)$/);if(!match||req.method!=='PATCH')return null;
 const d=await body(req);if(d.action==='delete'){const id=decodeURIComponent(match[1]);if(!await env.DB.prepare('SELECT id FROM users WHERE id=? AND NOT EXISTS (SELECT 1 FROM deleted_accounts d WHERE d.user_id=users.id)').bind(id).first())return json({error:'Conta não encontrada.'},404);await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO deleted_accounts(user_id,deleted_at) VALUES (?,?)').bind(id,new Date().toISOString()),env.DB.prepare('DELETE FROM user_sessions WHERE user_id=?').bind(id),env.DB.prepare('INSERT INTO audit(request_id,action,created_at) VALUES (?,?,?)').bind(id,'login excluído pela administração',new Date().toISOString())]);return json({ok:true});}if(typeof d.password!=='string'||d.password.length<8||d.password.length>200)return json({error:'Defina uma senha com 8 a 200 caracteres.'},400);
 const id=decodeURIComponent(match[1]);if(!await env.DB.prepare('SELECT id FROM users WHERE id=? AND NOT EXISTS (SELECT 1 FROM deleted_accounts d WHERE d.user_id=users.id)').bind(id).first())return json({error:'Conta não encontrada.'},404);
 await env.DB.batch([env.DB.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(await passwordHash(d.password),id),env.DB.prepare('DELETE FROM user_sessions WHERE user_id=?').bind(id)]);
 await env.DB.prepare('INSERT INTO audit(request_id,action,created_at) VALUES (?,?,?)').bind(id,'senha da conta redefinida pela administração',new Date().toISOString()).run();return json({ok:true});
}
