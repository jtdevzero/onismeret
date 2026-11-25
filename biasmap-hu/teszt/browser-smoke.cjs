/* Run against the served preview in GitHub Actions: full runtime + SVG smoke. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const url = process.env.BIASMAP_PREVIEW_URL || 'http://127.0.0.1:8765/biasmap-hu/teszt/';
(async () => {
  const browser = await chromium.launch({ headless:true });
  try {
    for (const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:640}]) {
      const page = await browser.newPage({viewport});
      const errors = [];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(url,{waitUntil:'domcontentloaded'});
      const result = await page.evaluate(async () => {
        const keys = Object.values(ANIM_FOR);
        const missing = Object.keys(window.BiasMapRemaining || {});
        const firstLoaded = await BiasAnim.load(missing[0]);
        const fail = [];
        const host = document.createElement('div');
        document.body.append(host);
        for (const key of keys) {
          try {
            if (!await BiasAnim.load(key)) throw new Error('script failed to load');
            if (!BiasAnim.mount(host,key,{lang:'hu',still:true})) throw new Error('mount returned null');
            const root = host.shadowRoot;
            if (!root.querySelector(`.bp[data-scene="${key}"] svg.bp-svg`)) throw new Error('SVG not found');
            if (!root.querySelector('.bp-svg [data-k]')) throw new Error('SVG scene empty');
            if (!root.querySelector('.bp-text')) throw new Error('caption missing');
          } catch (e) { fail.push(`${key}: ${e.message}`); }
        }
        const pilots = Object.values(window.BiasMapPremium || {});
        const premiumSet = new Set(pilots);
        const stories = missing.filter(key => !premiumSet.has(key));
        if(window.BiasMapCraftedCount!==137) fail.push(`only ${window.BiasMapCraftedCount} crafted scenes`);
        for (const key of stories) {
          try {
            const player=BiasAnim.mount(host,key,{lang:'hu',autoplay:false});
            if (!player || player.starts.length!==6) throw new Error('six-beat story missing');
            if (player.total<25000 || player.total>35000) throw new Error(`duration ${player.total}`);
            for (const i of [0,1,2,3,4,5]) {
              player.seek(player.ends[i]);
              if (host.shadowRoot.querySelector('.bp-no').textContent!==`${i+1}/6`) throw new Error(`step ${i+1} not selected`);
              const drawing=host.shadowRoot.querySelector('.bp-svg');
              if (!drawing || drawing.querySelectorAll('[data-k]').length!==6) throw new Error(`stage ${i+1} SVG malformed`);
            }
            if (!host.shadowRoot.querySelector('.bp-svg .sb-card, .bp-svg .sb-hot, .bp-svg .craft-icon')) throw new Error('semantic art missing');
            if (window.BiasAnim.SCENES[key].svg().includes('craft-icon') &&
                !host.shadowRoot.querySelector('.bp-svg .craft-icon')) throw new Error('curated pictogram missing');
            if (!host.shadowRoot.querySelector('style')?.textContent.includes('radial-gradient')) throw new Error('cinematic style missing');
            const stage=host.shadowRoot.querySelector('.bp-stage');
            if (getComputedStyle(stage).borderTopLeftRadius!=='22px') throw new Error('cinematic stage style not applied');
            player.destroy();
          } catch (e) { fail.push(`story ${key}: ${e.message}`); }
        }
        for (const key of pilots) {
          try {
            const player = BiasAnim.mount(host,key,{lang:'hu',autoplay:false});
            if (!player || player.starts.length !== 6) throw new Error('premium timeline missing');
            if (player.total < 25000 || player.total > 35000) throw new Error(`duration ${player.total}`);
            for (let i=0;i<6;i++) {
              player.seek(player.ends[i]);
              if (host.shadowRoot.querySelector('.bp-no').textContent !== `${i+1}/6`) throw new Error(`step ${i+1} not selected`);
              if (!host.shadowRoot.querySelector('.bp-svg [data-k]')) throw new Error('story drawing missing');
            }
            player.destroy();
          } catch (e) { fail.push(`premium ${key}: ${e.message}`); }
        }
        // The thematic network is accessible and navigates to another bias.
        openBias(BIASES[0]);
        await Promise.resolve();
        const relation=document.querySelector('.connection-map');
        if (!relation || !relation.querySelector('[data-i]')) fail.push('thematic network missing');
        else {
          const target=Number(relation.querySelector('[data-i]').dataset.i);
          relation.querySelector('[data-i]').click();
          await Promise.resolve();
          if (current?.b?.i!==target) fail.push('thematic network navigation failed');
        }
        closePanel();
        host.remove();
        return {videos:VIDEOS.length,biases:keys.length,missing:missing.length,
          pilots:pilots.length,stories:stories.length,firstLoaded,fail,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
      });
      assert.equal(result.biases,188,`bias count ${viewport.width}`);
      assert.equal(result.missing,142,`new bias count ${viewport.width}`);
      assert.equal(result.videos,216,`video count ${viewport.width}`);
      assert.equal(result.pilots,5,'premium pilot count');
      assert.equal(result.stories,137,'thematic storyboard count');
      assert.ok(result.firstLoaded,'new scene bundle could not load');
      assert.deepEqual(result.fail,[],'not all animations render');
      assert.deepEqual(errors,[],'JavaScript page errors');
      assert.ok(result.scrollWidth <= result.viewport+5,`horizontal overflow ${viewport.width}: ${result.scrollWidth}`);
      console.log(`PASS browser ${viewport.width}px: 188 SVG scenes, 216 videos`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
