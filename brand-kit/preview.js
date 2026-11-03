const frame=document.querySelector('#motion-frame'),stage=document.querySelector('.motion-stage'),slider=document.querySelector('#time'),output=document.querySelector('#time-output'),play=document.querySelector('#play');
let playing=false,started=0,current=0,raf;
function fit(){frame.style.transform=`scale(${stage.clientWidth/1280})`;}
function draw(t){current=Math.max(0,Math.min(8,t));slider.value=current;output.value=current.toFixed(2)+' / 8.00s';frame.contentWindow.postMessage({type:'sg-motion-time',time:current},'*');}
function pause(){playing=false;cancelAnimationFrame(raf);play.lastChild.textContent='تشغيل';}
function tick(now){if(!playing)return;draw((now-started)/1000);if(current>=8){pause();return;}raf=requestAnimationFrame(tick);}
play.addEventListener('click',()=>{if(playing){pause();return;}if(current>=8)current=0;playing=true;play.lastChild.textContent='إيقاف';started=performance.now()-current*1000;raf=requestAnimationFrame(tick);});
document.querySelector('#replay').addEventListener('click',()=>{pause();draw(0);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)play.click();});
slider.addEventListener('input',()=>{pause();draw(Number(slider.value));});frame.addEventListener('load',()=>{fit();draw(0);});new ResizeObserver(fit).observe(stage);fit();
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
