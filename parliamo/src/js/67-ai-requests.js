/* ============ CANCELLABLE AI REQUESTS ============ */
/* Function-owned storage avoids initialization-order coupling: boot starts before this
   module, but these helpers are hoisted and initialize themselves on first use. */
function aiRequestRegistry(){return aiRequestRegistry.items||(aiRequestRegistry.items=new Set());}
function createAIRequest(valid,options={}){
  const language=lang(),navigation=NAVN,controller=new AbortController(),registry=aiRequestRegistry();
  let cancelled="",finished=false,rejectCancel;
  const interrupted=new Promise((_,reject)=>{rejectCancel=reject;});
  const job={language,navigation,signal:controller.signal,
    owns:()=>language===lang()&&navigation===NAVN&&valid(),
    current:()=>!cancelled&&job.owns(),
    cancel(reason="cancelled"){if(finished||cancelled)return;cancelled=reason;controller.abort();rejectCancel({code:reason});},
    async json(prompt,opts={}){
      try{
        const result=await Promise.race([(async()=>{const sample=await getSample();if(!job.current())throw {code:"stale"};if(!sample)throw {code:"no_ai"};return sample.json(prompt,Object.assign({},opts,{signal:controller.signal}));})(),interrupted]);
        if(!job.current())throw {code:"stale"};return result;
      }catch(error){if(!job.owns())throw {code:"stale"};throw error;}
      finally{finished=true;clearTimeout(timer);registry.delete(job);}
    }
  };
  const timer=setTimeout(()=>job.cancel("timeout"),Number.isFinite(options.timeoutMs)?Math.max(1,options.timeoutMs):45000);
  registry.add(job);return job;
}
function cancelAIRequests(reason="stale"){for(const job of aiRequestRegistry())job.cancel(reason);}
function aiRequestMessage(error){
  if(error&&error.code==="timeout")return "A tanár most lassan válaszol. A kérés leállt; a szöveged megmaradt, próbáld újra.";
  if(error&&error.code==="cancelled")return "A kérést megszakítottad. A szöveged megmaradt.";
  return aiErr(error);
}
function aiRequestBusy(label,cancelId){return `<div class="card stack" role="status"><div class="row"><span class="thinking" aria-hidden="true"><i></i><i></i><i></i></span><span>${esc(label)}</span></div><div><button class="btn ghost" id="${cancelId}">Megszakítás</button></div></div>`;}
