import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all page entry assets resolve inside the GitHub project path',()=>{
 const html=read('docs/index.html'),base='https://kaysongt.github.io/kingsword-chicago/';
 const resources=[...html.matchAll(/(?:href|src)="(\.[^"]+)"/g)].map(m=>m[1]);
 assert.equal(resources.length,4);
 for(const resource of resources){const url=new URL(resource,base);assert.ok(url.pathname.startsWith('/kingsword-chicago/'));assert.ok(fs.existsSync(new URL('../docs/'+resource,import.meta.url)));}
 assert.ok(!/(?:href|src)="\//.test(html));
 assert.match(read('docs/app.js'),/src="\.\/assets\/mark.svg"/);
 const manifest=JSON.parse(read('docs/manifest.webmanifest'));assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.icons[0].src,'./assets/mark.svg');
});
test('checked-in Pages assets match source and retain public demo disclosure',()=>{
 for(const file of ['index.html','app.js','domain.mjs','styles.css','manifest.webmanifest','assets/mark.svg'])assert.equal(read('docs/'+file),read('dist/'+file),file);
 assert.equal(read('docs/.nojekyll'),'');assert.match(read('docs/app.js'),/PUBLIC DEMO/);assert.doesNotMatch(read('docs/app.js'),/intended to stay owner-private/);
 const preview=read('KingsWord-Preview.html');assert.doesNotMatch(preview,/<script[^>]+src=/);assert.doesNotMatch(preview,/<link[^>]+stylesheet/);assert.match(preview,/PUBLIC DEMO/);
});
