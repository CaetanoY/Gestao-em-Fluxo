'use strict';
(()=>{
 let theme='dark';
 try{theme=localStorage.getItem('frota-theme')||'dark'}catch{}
 function apply(value){theme=value==='light'?'light':'dark';document.documentElement.dataset.theme=theme;const button=document.getElementById('themeToggle');if(button){button.textContent=theme==='dark'?'☀':'☾';button.setAttribute('aria-label',theme==='dark'?'Ativar tema claro':'Ativar tema escuro');button.title=theme==='dark'?'Ativar tema claro':'Ativar tema escuro';button.setAttribute('aria-pressed',String(theme==='dark'));}}
 apply(theme);
 document.addEventListener('DOMContentLoaded',async()=>{
  if(window.frota){try{const config=await window.frota.config();apply(config.theme)}catch{}}
  document.getElementById('themeToggle').onclick=async()=>{const previous=theme;apply(theme==='dark'?'light':'dark');try{if(window.frota)await window.frota.setTheme(theme);else localStorage.setItem('frota-theme',theme)}catch{apply(previous);document.getElementById('themeToggle').title='Não foi possível salvar o tema. Tente novamente.'}};
 });
})();
