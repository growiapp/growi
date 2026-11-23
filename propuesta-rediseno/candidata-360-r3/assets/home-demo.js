/* F8.9B · Home: escena de Centro Ribera (Home A). Usa el motor Nar (narrar.js). */
(function(){
  "use strict";
  if (!document.querySelector("[data-ha]") || !window.Nar) return;
  var root=document.querySelector("[data-ha]"), stg=root.querySelector("[data-stg]"), cap=root.querySelector("[data-cap]"), sr=root.querySelector("[data-sr]"), inp=root.querySelector("[data-inp]"), nav=root.querySelector("[data-nav]");
  var MSG="Hola, quiero turno para el sábado a la mañana. Me molesta la rodilla.";
  var CAP=["Tu sitio presenta el negocio y facilita la consulta.","Con un toque en «Pedir turno», te escriben por WhatsApp.","Vos respondés, acordás el horario y lo anotás."],FIN="Listo: el turno de Julián quedó confirmado, sábado 11:15.";
  var th=null;
  function fit(){ var sc=root.querySelector(".ha-scr"), sw=sc.clientWidth, sh=sc.clientHeight, k=sw/375, imgH=1300*k, off=Math.max(0,Math.min(1162*k-.8*sh, imgH-sh)); stg.style.setProperty("--off",off+"px"); stg.style.setProperty("--cta",(1162*k-off)+"px"); }
  fit(); if("ResizeObserver" in window) new ResizeObserver(fit).observe(root); else addEventListener("resize",fit);
  var N=MSG.length, car='<span class="ha-car"></span>';
  function render(S){
    stg.dataset.a=S.a; stg.dataset.c=S.c; stg.dataset.tap=S.tap; stg.dataset.tk=S.tk; stg.dataset.sc=S.sc; stg.dataset.send=S.send;
    root.dataset.a=S.a; root.dataset.tk=S.tk; root.dataset.sc=S.sc; root.dataset.c=S.c;
    [].forEach.call(nav.querySelectorAll("[data-i]"),function(b){ if(+b.dataset.i===S.a-1) b.setAttribute("aria-current","step"); else b.removeAttribute("aria-current"); });
    cap.textContent = CAP[S.a-1]; sr.textContent = S.tk ? FIN : CAP[S.a-1];
    /* tipeo: el texto se arma carácter a carácter con el cursor al final; el campo crece hacia arriba dentro del teléfono (su altura sigue al contenido) */
    if(S.c===1){ inp.innerHTML=""; inp.appendChild(document.createTextNode(MSG.slice(0,S.typed))); inp.insertAdjacentHTML("beforeend",car); }
    else inp.textContent="";
    if(S.c===1){ inp.style.height="auto"; inp.style.height=inp.scrollHeight+"px"; } else inp.style.height="";
  }
  var T=[[0,{a:1,c:0,tap:0,tk:0,sc:0,typed:0,send:0}],[1700,{sc:1}],[4800,{tap:1}],[5500,{a:2}],[6300,{c:1,typed:0}]];
  var t=6700; for(var k=1;k<=N;k++){ var ch=MSG.charAt(k-1); t+=30+(k%7===0?28:0)+((ch==="."||ch===",")?190:0); T.push([t,{typed:k}]); }
  t+=500; T.push([t,{send:1}]); t+=650; T.push([t,{send:0,c:2,typed:0}]);
  t+=1000; T.push([t,{a:3,c:3}]); t+=1300; T.push([t,{c:4}]); t+=1300; T.push([t,{c:5}]); t+=1100; T.push([t,{c:6}]); t+=1300; T.push([t,{c:7}]); t+=1100; T.push([t,{tk:1}]);
  var B={a:1,c:0,tap:0,tk:0,sc:0,typed:0,send:0};
  var nar=Nar({root:root,stage:stg,nav:nav,pp:root.querySelector("[data-pp]"),render:render,init:B,timeline:T,total:t+3400,
    stable:[B,{a:2,c:2,tap:0,tk:0,sc:1,typed:0,send:0},{a:3,c:7,tap:0,tk:1,sc:1,typed:0,send:0}]});
  (window.GrowiNar = window.GrowiNar || {}).home = nar;   // solo para pruebas
})();
