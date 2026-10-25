import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = await (await fetch('http://127.0.0.1:9340/json/list')).json();
const target = targets.find(item => item.type === 'page');
if (!target) throw new Error('Headless Chrome page not found');

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const pending = new Map();
const runtimeErrors = [];
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params);
  if (message.id && pending.has(message.id)) {
    const handler = pending.get(message.id);
    pending.delete(message.id);
    message.error ? handler.reject(new Error(JSON.stringify(message.error))) : handler.resolve(message.result);
  }
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  pending.set(requestId, { resolve, reject });
  ws.send(JSON.stringify({ id: requestId, method, params }));
});
const evaluate = async expression => {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const waitFor = async (expression, label) => {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out: ${label}`);
};
const setValue = (selector, value) => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const navigate = async url => { await call('Page.navigate', { url }); await waitFor(`document.readyState==='complete'`, url); };

await call('Page.enable');
await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await evaluate(`localStorage.clear()`);
await navigate('http://127.0.0.1:3000/login');
await waitFor(`document.querySelector('#username')`, 'login form');

// Participant acceptance path from the assignment.
await setValue('#username', 'student');
await setValue('#password', 'Student@123');
await evaluate(`document.querySelector('#username').form.requestSubmit()`);
await waitFor(`location.pathname==='/quizzes' && document.querySelectorAll('.quiz-card').length>0`, 'participant quiz list');
await evaluate(`(()=>{const card=[...document.querySelectorAll('.quiz-card')].find(e=>e.textContent.includes('Web Development Fundamentals'));card.querySelector('.quiz-action').click();return true})()`);
await waitFor(`location.pathname.endsWith('/play') && document.querySelectorAll('.option-button').length>0`, 'take quiz');
for (const [question, correctIndex] of [1, 2, 1, 2].entries()) {
  await evaluate(`document.querySelectorAll('.option-button')[${correctIndex}].click()`);
  if (question < 3) await click('.quiz-controls .btn-primary');
  else await click('.quiz-controls .btn-success');
  if (question < 3) await waitFor(`document.querySelector('.question-count').textContent.includes('Question ${question + 2}')`, `question ${question + 2}`);
}
await waitFor(`location.pathname.endsWith('/result') && document.querySelector('.score-ring strong')?.textContent==='100%'`, '100 percent result');
const resultShot = await call('Page.captureScreenshot', { format: 'png' });
await fs.writeFile(path.join(root, 'verification-participant.png'), Buffer.from(resultShot.data, 'base64'));

// Admin pages and protected management routes.
await evaluate(`localStorage.clear()`);
await navigate('http://127.0.0.1:3000/login');
await waitFor(`document.querySelector('#username')`, 'admin login form');
await setValue('#username', 'admin');
await setValue('#password', 'Admin@123');
await evaluate(`document.querySelector('#username').form.requestSubmit()`);
await waitFor(`location.pathname==='/quizzes'`, 'admin quiz list');
await navigate('http://127.0.0.1:3000/admin');
await waitFor(`document.querySelectorAll('.stat-card').length===3`, 'admin overview');
await navigate('http://127.0.0.1:3000/admin/questions');
await waitFor(`document.querySelector('.editor-panel') && document.querySelectorAll('.record-row').length>=4`, 'question management');
await navigate('http://127.0.0.1:3000/admin/users');
await waitFor(`document.body.textContent.includes('student') && document.body.textContent.includes('admin')`, 'user management');
const adminShot = await call('Page.captureScreenshot', { format: 'png' });
await fs.writeFile(path.join(root, 'verification-admin.png'), Buffer.from(adminShot.data, 'base64'));

// Mobile layout check.
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await evaluate(`localStorage.clear()`);
await navigate('http://127.0.0.1:3000/login');
await waitFor(`document.querySelector('.auth-screen')`, 'mobile login');
const mobileShot = await call('Page.captureScreenshot', { format: 'png' });
await fs.writeFile(path.join(root, 'verification-mobile.png'), Buffer.from(mobileShot.data, 'base64'));

if (runtimeErrors.length) throw new Error(`Browser runtime errors: ${JSON.stringify(runtimeErrors)}`);
console.log(JSON.stringify({ participantQuiz: '100%', adminOverview: true, adminQuestions: true, adminUsers: true, mobile: true, runtimeErrors: 0 }));
await call('Browser.close');
ws.close();
