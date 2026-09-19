import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { parseCatalog } from "../src/lib/game/csv.ts";

const base = "http://localhost:3100";
const profile = mkdtempSync(path.join(tmpdir(),"haluun-browser-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",["--headless=new","--no-first-run","--no-default-browser-check","--remote-debugging-port=9227","--user-data-dir="+profile,"about:blank"],{stdio:"ignore",windowsHide:true});
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
let socket;
try {
  let targets;
  for(let i=0;i<60;i++){try{targets=await (await fetch("http://localhost:9227/json/list")).json();if(targets.some(t=>t.type==="page"))break;}catch{} await sleep(200);}
  socket=new WebSocket(targets.find(t=>t.type==="page").webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let seq=0;const pending=new Map();const exceptions=[];
  socket.onmessage=event=>{const m=JSON.parse(event.data);if(m.method==="Runtime.exceptionThrown")exceptions.push(m.params.exceptionDetails.text);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);}};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
  const wait=async expression=>{for(let i=0;i<100;i++){try{if(await evaluate("Boolean("+expression+")"))return;}catch{}await sleep(100);}throw Error("Timed out: "+expression+" | "+await evaluate("document.body.innerText"));};
  const click=async text=>{await evaluate("(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes("+JSON.stringify(text)+"));if(!b||b.disabled)throw Error('Missing enabled button');b.click();})()");};
  const go=async route=>{await send("Page.navigate",{url:base+route});await wait("document.readyState === 'complete'");};
  const viewport=async(width,height)=>{await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<600});await sleep(150);};
  const noOverflow=async()=>assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth"),"Horizontal overflow");
  const shot=async name=>{const result=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});writeFileSync(".next/"+name+".png",Buffer.from(result.data,"base64"));};
  await send("Runtime.enable");await send("Page.enable");
  await viewport(1440,1000);await go("/play");await wait("document.querySelectorAll('a[href^=\"/play/\"]').length===60");
  await noOverflow();await shot("play-desktop");
  for(const width of [320,390,768]){await viewport(width,844);await noOverflow();}
  await shot("play-mobile");
  await evaluate("(()=>{const i=document.querySelector('input[type=search]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'18+');i.dispatchEvent(new Event('input',{bubbles:true}));})()");
  await wait("document.querySelectorAll('a[href^=\"/play/\"]').length===2");
  await evaluate("(()=>{const i=document.querySelector('input[type=search]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'no-matching-category');i.dispatchEvent(new Event('input',{bubbles:true}));})()");
  await wait("document.body.textContent.includes('Ангилал олдсонгүй.')");
  console.log("PASS: category count, search, empty state and 320/390/768/1440 layouts");
  await viewport(390,844);await go("/play/1");await wait("document.body.textContent.includes('Насанд хүрсэн үү?')");
  await click("БИД БҮГД 18 НАС ХҮРСЭН");await wait("document.querySelectorAll('.player-input input').length===2");
  await evaluate("document.querySelectorAll('.player-input input').forEach((i,n)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'Player '+n);i.dispatchEvent(new Event('input',{bubbles:true}));})");
  await click("Тоглогч нэмэх");await wait("document.querySelectorAll('.player-input input').length===3");
  await evaluate("document.querySelectorAll('.remove-player')[2].click()");
  await wait("document.querySelectorAll('.player-input input').length===2"); await click("ТОГЛООМ ЭХЛҮҮЛЭХ");await wait("document.querySelector('.game .playing-card')");
  await noOverflow();
  const source=parseCatalog(readFileSync("src/data/party_game_1800_content_18plus.csv","utf8"));
  const expected=new Set(source.find(c=>c.id==="1").cards.map(c=>c.text));const seen=new Set();
  for(let i=0;i<30;i++){
    await wait("document.querySelector('.playing-card:not(.flipped)') && !document.querySelector('.leaving')");
    await evaluate("document.querySelector('.game .playing-card').click()");
    await wait("document.querySelector('.playing-card.flipped')");
    const text=await evaluate("document.querySelector('.card-content').textContent");
    assert.ok(expected.has(text));assert.ok(!seen.has(text));seen.add(text);
    assert.ok(await evaluate("document.querySelector('progress').value === "+(i+1)));
    if(i===0){
      await sleep(800);await noOverflow();await shot("game-mobile");
      await click("1 SHOT");await wait("document.querySelector('.punishment-dialog[open]')");
      await click("ШИЙТГЭЛ БИЕЛҮҮЛСЭН");
    } else if(i===1) await click("PASS");
    else await click("БИЕЛҮҮЛСЭН");
    if(i<29)await wait("document.querySelector('progress')?.value === "+(i+2));
  }
  await wait("document.querySelector('.results')");assert.equal(seen.size,30);
  assert.ok(await evaluate("document.querySelector('.results').textContent.includes('30 карт')"));
  await click("ДАХИН ТОГЛОХ");await wait("document.querySelector('progress')?.value === 1");
  await click("Дуусгах");await wait("document.querySelector('.exit-dialog[open]')");await click("Үр дүн харах");
  await wait("document.querySelector('.results a[href=\"/play\"]')");
  console.log("PASS: setup, add/remove players, flip, penalty, PASS, 30 unique CSV cards, completion, replay and early exit");
  for(const type of ["question","choice","vote"]){
    const category=source.find(c=>c.types.includes(type));
    await go("/play/"+category.id);await wait("document.querySelector('.setup')");
    assert.ok(!await evaluate("document.body.textContent.includes('Насанд хүрсэн үү?')"));
  }
  assert.equal((await fetch(base+"/play/not-a-category")).status,404);
  assert.equal(exceptions.length,0,exceptions.join(","));
  console.log("PASS: session age confirmation across categories, invalid category 404, no runtime exceptions");
  console.log("Screenshots: .next/play-desktop.png, .next/play-mobile.png, .next/game-mobile.png");
} finally { socket?.close();chrome.kill(); }
