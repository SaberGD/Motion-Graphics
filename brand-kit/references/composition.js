const board=document.querySelector('#artboard'),params=new URLSearchParams(location.search),scene=params.get('scene')||'academy';
const portrait=innerHeight>innerWidth*1.25,square=Math.abs(innerHeight-innerWidth)<10;
board.style.setProperty('--unit',(innerWidth/(portrait||square?1080:1920))+'px');board.classList.toggle('portrait',portrait);board.classList.toggle('square',square);board.classList.toggle('maro',scene==='maro');board.classList.toggle('light',scene==='light');
if(scene==='maro'){
 document.querySelector('#frame-title').textContent='ابدأ بفكرتك.';document.querySelector('#frame-support').textContent='وخلي للتجربة مساحة.';document.querySelector('.eyebrow').textContent='MARO AI / BY SABER GROUP';document.querySelector('#frame-label').textContent='MARO AI';document.querySelector('.website').textContent='ai.sabergroupacademy.com';
}
if(scene==='light'){document.querySelector('#frame-title').textContent='مساحة جديدة لفكرتك.';document.querySelector('#frame-support').textContent='نفس الروح. بتفاصيل أهدى.';}
function smooth(t){
 const target=Math.max(0,Math.min(1,t));let low=0,high=1,u=target;
 const cubic=(x,a,b)=>3*(1-x)*(1-x)*x*a+3*(1-x)*x*x*b+x*x*x;
 for(let i=0;i<24;i++){u=(low+high)/2;if(cubic(u,.16,.3)<target)low=u;else high=u;}
 return cubic(u,1,1);
}
window.setMotionTime=function(seconds){const t=Math.max(0,Math.min(8,seconds));board.style.setProperty('--enter',smooth((t-.1)/.8));board.style.setProperty('--concept',smooth((t-1.35)/.65));board.style.setProperty('--end',smooth((t-4.8)/.6));};
window.renderStaticFrame=function(){board.style.setProperty('--enter',1);board.style.setProperty('--concept',1);board.style.setProperty('--end',scene==='endcard'?1:0);};
window.renderStaticFrame();window.addEventListener('message',event=>{if(event.source!==parent)return;if(event.data?.type==='sg-motion-time'&&Number.isFinite(event.data.time))window.setMotionTime(event.data.time);});
