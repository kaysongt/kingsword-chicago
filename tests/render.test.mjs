import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as domain from '../dist/domain.mjs';
function harness(){
 const elements=new Map();
 function element(id){if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){},contains(){return false;}},querySelector(){return null;},addEventListener(){},scrollIntoView(){}});return elements.get(id);}
 const events={},storage=new Map(),location={href:'http://localhost:4173/',hash:'#/',origin:'http://localhost:4173',pathname:'/'};
 const context=vm.createContext({...domain,console,URLSearchParams,URL,Blob,Intl,Date,Math,JSON,crypto:{randomUUID:()=>`test-${storage.size}`},setTimeout,clearTimeout,
 document:{querySelector:element,addEventListener:(name,cb)=>{(events[name]??=[]).push(cb);},body:{classList:{add(){},remove(){}}},activeElement:null},
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},location,
 window:{scrollTo(){},addEventListener(){},print(){}},navigator:{}});
 const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'');
 vm.runInContext(source+'\nglobalThis.hooks={render,guests:()=>guests,filteredGuests,guestDrawer,saveGuest,seed,e,inviteLink,workspace:()=>workspace,handleWorkspaceSubmit,officeWorkspace};',context);
 return {context,elements,element,location,events,hooks:context.hooks};
}
test('every public and office route renders its key content',()=>{
 const h=harness();
 const routes=[['/','Your church office, connected.'],['/welcome','Faith grows here.'],['/visit/sunday','See you sunday.'],['/visit/friday','See you friday.'],['/plan','Plan your visit'],['/office','Your church office, connected.'],['/office/departments','Departments & responsibilities'],['/office/team','Your team, in one place.'],['/office/tasks','Turn plans into progress.'],['/office/leaders','A workspace for every leader.'],['/office/guests','Guests &amp; follow-up'],['/office/calendar','The next six weeks'],['/office/invitations','A personal invitation'],['/office/settings','A working beginning.']];
 for(const [route,expected] of routes){h.location.hash='#'+route;h.hooks.render();assert.ok(h.element('#app').innerHTML.includes(expected.replace('&amp;','&')),route);}
 assert.equal(h.hooks.guests().length,5);
});
test('guest text is escaped, source tags are bounded, and unknown routes recover',()=>{
 const h=harness();const g=h.hooks.guests()[0];h.hooks.saveGuest({...g,name:'<img src=x onerror=alert(1)>'});h.location.hash='#/office/guests';h.hooks.render();
 assert.ok(!h.element('#app').innerHTML.includes('<img src=x'));
 assert.ok(h.element('#app').innerHTML.includes('&lt;img'));
 h.location.hash='#/plan?service=invalid&source=%3Cscript%3E';h.hooks.render();assert.match(h.element('#app').innerHTML,/value="Service page"/);
 h.location.hash='#/missing';h.hooks.render();assert.match(h.element('#app').innerHTML,/Let’s get you back/);
});
test('guest planning is persisted and appears in the staff queue without contact',()=>{
 const h=harness(),data={source:'Service page',name:'New Demo Visitor',service:'sunday',date:domain.serviceDates('sunday')[0],channel:'none',contact:'',question:'Parking?',hostRequested:'on'};
 const fields=Object.fromEntries(Object.keys(data).map(k=>[k,{value:data[k],setAttribute(){},focus(){}}]));
 const errorBox={innerHTML:''};const form={id:'plan-form',querySelectorAll:()=>[],querySelector:()=>errorBox,elements:{namedItem:k=>fields[k]}};
 h.context.FormData=class{*[Symbol.iterator](){yield*Object.entries(data);}};
 h.element('#overlay').contains=()=>false;
 for(const handler of h.events.submit)handler({target:form,preventDefault(){}});
 const saved=h.hooks.guests().find(g=>g.name===data.name);assert.ok(saved);assert.equal(saved.channel,'none');assert.equal(saved.consent,false);assert.equal(saved.host,'Unassigned');
 assert.match(h.element('#plan-card').innerHTML,/Demo visit saved/);
 h.location.hash='#/office/guests';h.hooks.render();assert.match(h.element('#app').innerHTML,/New Demo Visitor/);
});
test('office assignment, attendance, follow-up, and handoff persist across renders',()=>{
 const h=harness(),id=h.hooks.guests()[0].id;
 const submit=(formId,data)=>{
  h.context.FormData=class{*[Symbol.iterator](){yield*Object.entries(data);}};
  for(const handler of h.events.submit)handler({target:{id:formId},preventDefault(){}});
 };
 submit('guest-update',{id,host:'Host C',status:'Planned'});
 assert.equal(h.hooks.guests().find(g=>g.id===id).host,'Host C');
 submit('guest-update',{id,host:'Host C',status:'Attended'});
 assert.ok(h.hooks.guests().find(g=>g.id===id).attendedAt);
 submit('follow-up-form',{id,outcome:'No response — try again'});
 assert.equal(h.hooks.guests().find(g=>g.id===id).followedUpAt,undefined);
 submit('follow-up-form',{id,outcome:'Contact completed'});
 assert.ok(h.hooks.guests().find(g=>g.id===id).followedUpAt);
 submit('follow-up-form',{id,outcome:'Connect handoff confirmed'});
 const guest=h.hooks.guests().find(g=>g.id===id);assert.equal(guest.status,'Connected');assert.ok(guest.history.some(h=>h.text==='Connect handoff confirmed'));
});

test('leader demo creation, team roster management, task assignment, and office oversight work end to end',()=>{
 const h=harness();
 function submit(id,data){h.context.FormData=class{*[Symbol.iterator](){yield*Object.entries(data);}};h.hooks.handleWorkspaceSubmit({id,querySelector:()=>({innerHTML:''})});}
 submit('leader-form',{name:'Demo Ministry Leader',email:'newleader@example.com',department:'Hospitality'});
 let ws=h.hooks.workspace();const leader=ws.leaders.find(l=>l.email==='newleader@example.com');assert.ok(leader);assert.equal(ws.currentLeaderId,leader.id);assert.equal(ws.departments.length,3);
 h.location.hash='#/office/team';h.hooks.render();assert.match(h.element('#app').innerHTML,/Demo Ministry Leader/);
 submit('member-form',{id:'',departmentId:leader.departmentId,name:'New Team Member',email:'member@example.com',role:'Service coordinator',status:'Active'});
 ws=h.hooks.workspace();const member=ws.members.find(m=>m.email==='member@example.com');assert.ok(member);
 submit('task-form',{id:'',departmentId:leader.departmentId,title:'Confirm service team',description:'Demo responsibility',assigneeId:member.id,due:'2026-11-01',priority:'High',status:'To do'});
 ws=h.hooks.workspace();const task=ws.tasks.find(t=>t.title==='Confirm service team');assert.ok(task);assert.equal(task.assigneeId,member.id);
 submit('task-form',{...task,status:'Done'});assert.equal(h.hooks.workspace().tasks.find(t=>t.id===task.id).status,'Done');
 h.location.hash='#/office/tasks';h.hooks.render();assert.match(h.element('#app').innerHTML,/Confirm service team/);
 // Reject an assignment into another department while in the leader's demo view.
 const before=ws.members.length;submit('member-form',{id:'',departmentId:'media',name:'Outside team',email:'outside@example.com',role:'Other',status:'Active'});assert.equal(ws.members.length,before);
});

test('new department profile creates a team; duplicate email does not create another leader',()=>{
 const h=harness();let data={name:'Facilities Demo',email:'facility-demo@example.com',department:'Service Setup'};
 const form={id:'leader-form',querySelector:()=>({innerHTML:''})};
 h.context.FormData=class{*[Symbol.iterator](){yield*Object.entries(data);}};
 h.hooks.handleWorkspaceSubmit(form);const ws=h.hooks.workspace();assert.equal(ws.departments.length,4);assert.ok(ws.members.some(m=>m.email===data.email));const count=ws.leaders.length;
 h.hooks.handleWorkspaceSubmit(form);assert.equal(ws.leaders.length,count);
});
