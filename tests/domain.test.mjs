import test from 'node:test';
import assert from 'node:assert/strict';
import {serviceDates,serviceInstant,calendarFile,safeCSV,validatePlan,updateGuest,chicagoDay} from '../dist/domain.mjs';
test('next dates use Chicago, including before/after service starts',()=>{
 assert.equal(serviceDates('sunday',1,new Date('2026-11-01T15:59:00Z'))[0],'2026-11-01');
 assert.equal(serviceDates('sunday',1,new Date('2026-11-01T16:00:00Z'))[0],'2026-11-08');
 assert.equal(serviceDates('friday',1,new Date('2026-10-31T00:29:00Z'))[0],'2026-10-30');
 assert.equal(serviceDates('friday',1,new Date('2026-10-31T00:30:00Z'))[0],'2026-11-06');
 assert.equal(chicagoDay(new Date('2026-10-29T01:00:00Z')),'2026-10-28');
});
test('calendar resolves Chicago daylight saving correctly',()=>{
 assert.equal(serviceInstant('sunday','2026-10-25').toISOString(),'2026-10-25T15:00:00.000Z');
 assert.equal(serviceInstant('sunday','2026-11-01').toISOString(),'2026-11-01T16:00:00.000Z');
 assert.equal(serviceInstant('friday','2026-10-30').toISOString(),'2026-10-31T00:30:00.000Z');
 assert.equal(serviceInstant('friday','2026-11-06').toISOString(),'2026-11-07T01:30:00.000Z');
 const ics=calendarFile('friday','2026-11-06');assert.match(ics,/DTSTART:20261107T013000Z/);assert.match(ics,/one hour as a planning placeholder/);
});
test('visit validation respects optional contact and rejects old or mismatched dates',()=>{
 const now=new Date('2026-10-28T18:00:00Z'),v={name:'Demo Guest',service:'friday',date:'2026-10-30',channel:'none'};
 assert.deepEqual(validatePlan(v,now),{});
 assert.ok(validatePlan({...v,date:'2026-10-25'},now).date);
 assert.ok(validatePlan({...v,service:'sunday'},now).date);
 assert.ok(validatePlan({...v,channel:'email',contact:'demo@example.com'},now).consent);
 assert.ok(validatePlan({...v,channel:'email',contact:'bad',consent:true},now).contact);
 assert.deepEqual(validatePlan({...v,channel:'email',contact:'demo@example.com',consent:true},now),{});
 assert.ok(validatePlan({...v,question:'x'.repeat(501)},now).question);
});
test('CSV guards formulas and escapes quote/comma/newline text',()=>{
 const csv=safeCSV([['=HYPERLINK("x")','@bad','hello,\nworld','normal']]);
 assert.match(csv,/"'=HYPERLINK\(""x""\)"/);assert.match(csv,/"'@bad"/);assert.match(csv,/"hello,\nworld"/);
});
test('guest history persists assignment and attendance; cancel releases host',()=>{
 const g={id:'a',status:'Planned',host:'Host A',history:[]},now=new Date('2026-10-28T12:00:00Z');
 const attended=updateGuest(g,{status:'Attended'},now);assert.equal(attended.attendedAt,now.toISOString());assert.equal(g.attendedAt,undefined);
 const canceled=updateGuest(attended,{status:'Cancelled'},now);assert.equal(canceled.host,'Unassigned');assert.equal(canceled.history.length,2);
});

test('department task validation rejects cross-team and paused assignments',async()=>{
 const {validateTask,validateLeader,departmentSummary}=await import('../dist/domain.mjs');
 const members=[{id:'a',departmentId:'welcome',status:'Active'},{id:'b',departmentId:'media',status:'Active'},{id:'c',departmentId:'welcome',status:'Paused'}];
 const task={title:'Welcome hosts',departmentId:'welcome',assigneeId:'a',status:'To do',priority:'High',due:'2026-11-01'};
 assert.deepEqual(validateTask(task,members),{});
 assert.ok(validateTask({...task,assigneeId:'b'},members).assigneeId);
 assert.ok(validateTask({...task,assigneeId:'c'},members).assigneeId);
 assert.ok(validateTask({...task,due:'2026-02-31'},members).due);
 assert.ok(validateTask({...task,status:'Invalid'},members).status);
 assert.ok(validateLeader({name:'',email:'bad',department:''}).name);
 const result=departmentSummary({members,tasks:[task,{...task,title:'Done work',status:'Done'}]},'welcome','2026-11-03');
 assert.equal(result.members,1);assert.equal(result.done,1);assert.equal(result.overdue,1);
});
