(function(){
'use strict';
var themes=[{id:'forest',name:'森林',icon:'🌿'},{id:'night',name:'暮夜',icon:'☾'}];
function setupThemes(){
var button=document.createElement('button');button.type='button';button.className='hz-theme-toggle';
var status=document.createElement('span');status.className='hz-sr-only';status.setAttribute('aria-live','polite');
var header=document.querySelector('.page-header');(header||document.body).appendChild(button);document.body.appendChild(status);
function current(){var id=document.documentElement.dataset.theme;return Math.max(0,themes.findIndex(function(t){return t.id===id;}));}
function update(index,announce){var theme=themes[index];document.documentElement.dataset.theme=theme.id;button.textContent=theme.icon+' 配色：'+theme.name;button.setAttribute('aria-label','切换网站配色，当前：'+theme.name);button.title='下一套配色：'+themes[(index+1)%themes.length].name;if(announce)status.textContent='已切换到'+theme.name+'配色';try{localStorage.setItem('horizon-theme',theme.id);}catch(e){}}
update(current(),false);button.addEventListener('click',function(){update((current()+1)%themes.length,true);});
}
function decorateText(){
var scoreRe=/⭐️\s*(\d+(?:\.\d+)?)\/10/;
document.querySelectorAll('.main-content h2,.main-content h3,.main-content li').forEach(function(el){var m=el.innerHTML.match(scoreRe);if(!m)return;var value=parseFloat(m[1]);var tier=value>=9?'high':value>=7?'good':value>=5?'mid':'low';el.innerHTML=el.innerHTML.replace(scoreRe,'<span class="score-badge" data-tier="'+tier+'">'+m[1]+'</span>');});
document.querySelectorAll('.main-content p').forEach(function(p){var text=p.textContent.trim();if(/^(Tags|标签)\s*:/.test(text))p.classList.add('tag-line');if(/^(rss|reddit|github|hackernews|hn|telegram)\s*·/i.test(text))p.classList.add('source-line');});
}
function setupMedia(){
document.querySelectorAll('.hz-native-video').forEach(function(video){video.addEventListener('play',function(){video.classList.add('is-playing');});video.addEventListener('ended',function(){video.classList.remove('is-playing');});});
document.querySelectorAll('.hz-video-play').forEach(function(button){button.addEventListener('click',function(){var holder=button.closest('.hz-video');var id=holder&&holder.dataset.youtubeId;if(!id||!/^[A-Za-z0-9_-]{11}$/.test(id))return;var frame=document.createElement('iframe');frame.title=button.getAttribute('aria-label')||'来源视频';frame.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1';frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';holder.classList.add('is-playing');holder.replaceChildren(frame);});});
document.querySelectorAll('.hz-media img').forEach(function(img){function unavailable(){if(img.closest('.hz-video')){img.style.opacity='0';return;}var label=document.createElement('span');label.className='hz-image-unavailable';label.textContent='来源图片暂时无法加载，点击查看原文 ↗';img.replaceWith(label);}img.addEventListener('error',unavailable,{once:true});if(img.complete&&img.naturalWidth===0)unavailable();});
}
function setupMobileRefresh(){
if(!window.matchMedia||!window.matchMedia('(pointer: coarse)').matches)return;
var notice=document.createElement('div');notice.className='hz-pull-refresh';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');notice.textContent='↓ 下拉刷新';
document.body.appendChild(notice);
var button=document.createElement('button');button.type='button';button.className='hz-refresh-button';button.textContent='↻ 刷新';button.setAttribute('aria-label','重新加载最新新闻');
document.body.appendChild(button);
var startY=null,tracking=false,pull=0,refreshing=false;
function reset(){tracking=false;startY=null;pull=0;notice.classList.remove('is-visible','is-ready');}
function reload(){
 if(refreshing)return;
 refreshing=true;notice.classList.add('is-visible');notice.classList.remove('is-ready');notice.textContent='正在获取最新内容…';
 button.disabled=true;button.textContent='刷新中…';
 var url=new URL(window.location.href);
 url.searchParams.set('_refresh',String(Date.now()));
 window.location.replace(url.toString());
}
button.addEventListener('click',reload);
document.addEventListener('touchstart',function(event){
 if(refreshing||event.touches.length!==1||window.scrollY>2)return;
 if(event.target.closest('button,a,input,textarea,select,video,iframe,.hz-video'))return;
 startY=event.touches[0].clientY;tracking=true;pull=0;
},{passive:true});
document.addEventListener('touchmove',function(event){
 if(!tracking||event.touches.length!==1)return;
 var delta=event.touches[0].clientY-startY;
 if(window.scrollY>2||delta<0){reset();return;}
 pull=Math.min(120,delta);
 if(pull>=14){
   if(event.cancelable)event.preventDefault();
   notice.classList.add('is-visible');
   notice.classList.toggle('is-ready',pull>=72);
   notice.textContent=pull>=72?'↑ 松开刷新':'↓ 继续下拉刷新';
 }
},{passive:false});
document.addEventListener('touchend',function(){
 if(!tracking)return;
 if(pull>=72){reload();return;}
 reset();
},{passive:true});
document.addEventListener('touchcancel',reset,{passive:true});
}
document.addEventListener('DOMContentLoaded',function(){decorateText();setupThemes();setupMedia();setupMobileRefresh();});
})();
