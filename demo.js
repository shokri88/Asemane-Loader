'use strict';
const studies=[['draw','ترسیم خطوط','LINE BY LINE','خطوط لوگو به ترتیب باز می‌شوند؛ سپس نام استودیو.'],['assemble','ساخت فرم','FORM ASSEMBLY','اجزای لوگو از دو سمت به فرم اصلی می‌رسند.'],['weave','بافت خطوط','LINE WEAVE','حرکت متناوب خطوط، با نوشته‌ای آرام در پایین.'],['pulse','موج در فرم','FORM RHYTHM','موجی ظریف از بالای نشان تا کلمات زیر لوگو.'],['type','امضای نوشتاری','WORD REVEAL','نشان ثابت؛ سه واژه با ریتمی نرم آشکار می‌شوند.'],['signature','امضای آسمانه','ASMANE SIGNATURE','ساخت مرحله‌ای نشان، سپس ظاهرشدن نوشته.']];
studies.push(
['converge','همگرایی','EDGE CONVERGENCE','ورود از چهار جهت؛ خروج با پخش خطوط و کلمات.'],
['crosswind','باد متقاطع','CROSSWIND','خطوط از دو سوی صفحه؛ نوشته از مسیر مخالف.'],
['cascade','آبشار فرم','FORM CASCADE','خطوط از بالا و نوشته از پایین؛ بازگشت به لبه‌ها.'],
['spiral','چرخش و اتصال','ORBITAL ASSEMBLY','ورود چرخشی اجزا؛ خروج شعاعی به اطراف صفحه.'],
['letters','موج نوشتار','TYPE IN MOTION','موجی از قطعات نوشته؛ همراه با ورود خطوط از کناره‌ها.'],
['blueprint','محورهای معماری','AXIS BLUEPRINT','ورود روی محورهای افقی و عمودی؛ خروج معکوس.']
);
studies.push(
['fold','تا شدن کاغذ','PAPER FOLD','خطوط مانند صفحات معماری باز می‌شوند؛ نوشته در ادامه.'],
['blinds','پرده‌های عمودی','VERTICAL BLINDS','نوارهای لوگو از لبه می‌چرخند و کنار هم می‌نشینند.'],
['mosaic','قطعات معلق','FLOATING MOSAIC','قطعات کوچک با چرخش مستقل تصویر را کامل می‌کنند.'],
['iris','گشودن روزنه','IRIS REVEAL','لوگو از روزنه‌های دایره‌ایِ متحرک آشکار می‌شود.'],
['pendulum','تعادل خطوط','PENDULUM','اجزا با تاب خوردن آرام به تعادل می‌رسند.'],
['ribbon','نوارهای سیال','FLUID RIBBONS','نوارهای افقی با پیچش و کشیدگی به فرم اصلی می‌رسند.']
);
let theme='light',speed=3.6,preview=null,exitButton=null,returnFocus=null,toastTimer,previewTimer,exitTimer,finishButton;
const instances=[];
function closePreview(){clearTimeout(previewTimer);clearTimeout(exitTimer);finishButton?.remove();finishButton=null;if(!preview)return;preview.destroy();preview=null;exitButton.remove();exitButton=null;document.querySelector('.wrap').inert=false;returnFocus?.focus();}
function openPreview(variant,button){closePreview();returnFocus=button;preview=AsmaneLoader.create({variant,theme,speed,autoHide:false,maxWait:60000});document.querySelector('.wrap').inert=true;exitButton=document.createElement('button');exitButton.className='exit-preview';exitButton.textContent='بستن پیش‌نمایش · Esc';exitButton.onclick=closePreview;document.body.append(exitButton);exitButton.focus();previewTimer=setTimeout(closePreview,59000);
if (preview.element.classList.contains('asm-scene')) {
 finishButton=document.createElement('button');finishButton.className='exit-preview asm-finish';finishButton.textContent='بارگذاری تمام شد ← پخش به اطراف';
 finishButton.onclick=()=>{finishButton.disabled=true;finishButton.textContent='در حال خروج…';preview.hide();exitTimer=setTimeout(closePreview,preview.timings.entrance+preview.timings.exit+150);};
 document.body.append(finishButton);
}
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePreview();});
function toast(message){document.querySelector('.toast')?.remove();clearTimeout(toastTimer);const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=message;document.body.append(el);toastTimer=setTimeout(()=>el.remove(),2400);}
async function copyCode(variant){const code=`<link rel="stylesheet" href="preloader.css">\n<script src="preloader.js"><\/script>\n<script>\n  AsmaneLoader.create({ variant: '${variant}', theme: '${theme}', speed: ${speed} });\n<\/script>`;try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(code);else{const t=document.createElement('textarea');t.value=code;t.style.cssText='position:fixed;left:-9999px';document.body.append(t);t.select();const success=document.execCommand('copy');t.remove();if(!success)throw Error();}toast('کد اتصال کپی شد');}catch{toast('کپی در این مرورگر مجاز نیست؛ کد را از README بردارید.');}}
studies.forEach(([variant,title,en,description],index)=>{const card=document.createElement('article');card.className='card';card.innerHTML=`<div class="canvas"><span class="number">${String(index+1).padStart(2,'0')}</span></div><div class="meta"><div class="meta-top"><h2>${title}</h2><span class="english">${en}</span></div><p>${description}</p><div class="actions"><button class="preview">نمایش تمام‌صفحه <span>↗</span></button><button class="copy">کپی کد</button></div></div>`;document.querySelector('#grid').append(card);instances.push(AsmaneLoader.create({variant,target:card.querySelector('.canvas'),inline:true,size:118,speed}));card.querySelector('.preview').onclick=e=>openPreview(variant,e.currentTarget);card.querySelector('.copy').onclick=()=>copyCode(variant);});
document.querySelectorAll('[data-theme]').forEach(button=>{if(button.tagName!=='BUTTON')return;button.onclick=()=>{theme=button.dataset.theme;document.body.classList.toggle('dark',theme==='dark');document.querySelectorAll('.seg button').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});instances.forEach(i=>i.element.dataset.theme=theme);};});
document.querySelector('#speed').onchange=e=>{speed=Number(e.target.value);instances.forEach(i=>{i.element.style.setProperty('--asm-speed',speed+'s');i.element.style.setProperty('--scene-in',speed+'s');});};
document.querySelector('#pause').onclick=e=>{const paused=document.body.classList.toggle('paused');e.target.textContent=paused?'ادامه حرکت':'توقف حرکت';e.target.setAttribute('aria-pressed',String(paused));};
