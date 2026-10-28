import {cp, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const target=path.join(root,'docs');
await mkdir(target,{recursive:true});
await cp(path.join(root,'dist'),target,{recursive:true});
await writeFile(path.join(target,'.nojekyll'),'');
console.log('GitHub Pages build ready: docs/ (publish main branch, /docs folder)');
