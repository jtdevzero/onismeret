#!/usr/bin/env node
/* Identical spellings must play different languages' recordings and voices. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
let language='it',voices=[{lang:'it-IT'},{lang:'es-ES'},{lang:'en-GB'}],serial=0;
const blobs=new Map(),revoked=[];
const context=vm.createContext({console,Blob,Uint8Array,Promise,setTimeout:()=>0,clearTimeout(){},
  Audio:class{pause(){}},URL:{createObjectURL(blob){const id='blob:test-'+(++serial);blobs.set(id,blob);return id;},revokeObjectURL:id=>revoked.push(id)},
  atob:s=>Buffer.from(s,'base64').toString('binary'),lang:()=>language,LG:()=>({tts:{it:'it-IT',es:'es-ES',en:'en-GB'}[language]}),
  speechSynthesis:{getVoices:()=>voices,cancel(){},speak(){}},document:{addEventListener(){}},S:{settings:{}},AUDIO_IDX:{},IS_WEB:true});
vm.runInContext('let NAVN=0;',context);
for(const file of ['03-recorded-audio.js','06-speech.js','34-accents-british-or-american.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/js',file),'utf8'),context,{filename:file});
const run=s=>vm.runInContext(s,context),encoded=s=>Buffer.from(s).toString('base64');
(async()=>{
  context.data=encoded('Italian recording');const italian=run("clipUrl('la casa',data)");
  assert.equal(run("clipUrl('la casa',data)"),italian);assert.equal(run("cachedClipUrl('la casa')"),italian);
  language='es';context.data=encoded('Spanish recording');const spanish=run("clipUrl('la casa',data)");
  assert.notEqual(spanish,italian);assert.equal(await blobs.get(italian).text(),'Italian recording');assert.equal(await blobs.get(spanish).text(),'Spanish recording');
  assert.equal(run("cachedClipUrl('la casa','it')"),italian);assert.equal(run("cachedClipUrl('la casa')"),spanish);
  language='it';context.data=encoded('Italian recording');assert.equal(run("clipUrl('la casa',data)"),italian);
  context.data=encoded('Updated Italian recording');const updated=run("clipUrl('la casa',data)");assert.notEqual(updated,italian);assert.deepEqual(revoked,[italian]);assert.equal(await blobs.get(updated).text(),'Updated Italian recording');
  language='en';context.data=encoded('English no');const english=run("clipUrl('no',data)");language='it';context.data=encoded('Italian no');assert.notEqual(run("clipUrl('no',data)"),english);
  run('pickVoice()');assert.equal(run('itVoice.lang'),'it-IT');language='es';voices=[];run('pickVoice()');assert.equal(run('itVoice'),null);assert.equal(run('voicesChecked'),false);
  voices=[{lang:'es-ES'}];run('pickVoice()');assert.equal(run('itVoice.lang'),'es-ES');context.speechSynthesis.getVoices=()=>{throw Error('voice catalogue unavailable');};language='en';run('pickVoice()');assert.equal(run('itVoice'),null);
  let finishBundle;context.loadBundle=()=>new Promise(resolve=>finishBundle=resolve);
  language='en';const oldLanguage=run("playKey('acc-en','uk:hello','hello')");language='it';finishBundle({'uk:hello':encoded('English hello')});await oldLanguage;assert.equal(run('player.src'),undefined);
  language='en';const oldView=run("playKey('acc-en','uk:hello','hello')");run('NAVN++');finishBundle({'uk:hello':encoded('English hello')});await oldView;assert.equal(run('player.src'),undefined);
  let rejectPlayback;const spoken=[];context.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};context.speechSynthesis.speak=u=>spoken.push({text:u.text,language:u.lang});context.AUDIO_IDX.ciao='u1';context.loadBundle=async()=>({ciao:encoded('Italian ciao')});context.rejectablePlayback=()=>new Promise((_,reject)=>rejectPlayback=reject);run('player.play=rejectablePlayback');
  language='it';const interrupted=run("say('ciao')");await Promise.resolve();assert.equal(typeof rejectPlayback,'function');
  run('if(sayDone)sayDone();NAVN++;');language='en';rejectPlayback(Error('playback interrupted'));await interrupted;await Promise.resolve();assert.deepEqual(spoken,[],'late rejection after navigation cannot speak an Italian word using the English fallback voice');
  console.log('Audio language isolation: 21 checks passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
