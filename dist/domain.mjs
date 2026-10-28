export const TIMEZONE = 'America/Chicago';
export const SERVICES = {
 sunday: {name:'Sunday service',day:0,hour:10,minute:0,time:'10:00 AM',eyebrow:'A new week. A fresh beginning.',description:'Come for the Word. Stay for the community. Make space for worship, biblical teaching, and a place to grow.',short:'Worship, the Word, and a place to belong.'},
 friday: {name:'Friday service',day:5,hour:19,minute:30,time:'7:30 PM',eyebrow:'Make room for what matters.',description:'Step out of the week and into community. Join us at KingsWord Chicago for our Friday gathering.',short:'End your week in faith and community.'}
};
export function chicagoDay(now=new Date()) {return new Intl.DateTimeFormat('en-CA',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function chicagoParts(now=new Date()) {return Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));}
export function shiftDay(day,n){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function serviceDates(kind,count=6,now=new Date()) {
 const s=SERVICES[kind];if(!s) return [];
 const p=chicagoParts(now),today=`${p.year}-${p.month}-${p.day}`;
 const weekday=new Date(today+'T12:00:00Z').getUTCDay();let days=(s.day-weekday+7)%7;
 if(days===0 && (+p.hour*60 + +p.minute)>=s.hour*60+s.minute) days=7;
 return Array.from({length:count},(_,i)=>shiftDay(today,days+i*7));
}
export function dateLabel(day,opts={month:'short',day:'numeric'}) {return new Intl.DateTimeFormat('en-US',{...opts,timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'));}
export function serviceInstant(kind,day){
 const s=SERVICES[kind];let value=Date.UTC(...[+day.slice(0,4),+day.slice(5,7)-1,+day.slice(8,10),s.hour,s.minute]);
 // Resolve the civil time in Chicago, rather than assuming CST throughout the year.
 const target=value;for(let i=0;i<3;i++){const p=chicagoParts(new Date(value));const actual=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute);value+=target-actual;}
 return new Date(value);
}
export function calendarFile(kind,day){const start=serviceInstant(kind,day),end=new Date(start.getTime()+60*60*1000);const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//KingsWord Chicago//Visit Planner//EN','BEGIN:VEVENT',`UID:${kind}-${day}@kingsword-visit-preview`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:KingsWord Chicago - ${SERVICES[kind].name}`,'LOCATION:4250 W Walton Street\\, Chicago IL 60651','DESCRIPTION:Calendar holds one hour as a planning placeholder. Service end time is not confirmed. See church for schedule changes.','END:VEVENT','END:VCALENDAR'].join('\r\n');}
export function safeCSV(rows){return rows.map(row=>row.map(v=>{let s=String(v??'');if(/^[\s]*[=+@\-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
export function validatePlan(v,now=new Date()){
 const errors={};if(!v.name?.trim()||v.name.trim().length>100)errors.name='Enter a name of up to 100 characters.';
 if(!SERVICES[v.service])errors.service='Choose a service.';
 if(!serviceDates(v.service,6,now).includes(v.date)) errors.date='Choose an upcoming service date.';
 if(!['email','phone','none'].includes(v.channel))errors.channel='Choose how you would like to be contacted.';
 if(v.channel==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.contact||''))errors.contact='Enter a valid email address.';
 if(v.channel==='phone'&&(v.contact||'').replace(/\D/g,'').length<10)errors.contact='Enter a phone number with at least 10 digits.';
 if(v.channel!=='none'&&!v.consent)errors.consent='Choose permission to contact you, or select no contact.';
 if((v.question||'').length>500)errors.question='Keep arrival questions under 500 characters.';
 return errors;
}
export function updateGuest(guest,changes,now=new Date()){
 const g={...guest,...changes,updatedAt:now.toISOString()};
 if(changes.status==='Attended'&&!g.attendedAt)g.attendedAt=now.toISOString();
 if(changes.status==='Cancelled')g.host='Unassigned';
 g.history=[{at:now.toISOString(),text:changes.status?`Status changed to ${changes.status}.`:changes.host?`Host assigned: ${changes.host}.`:'Visit details updated.'},...(guest.history||[])];return g;
}

export const TASK_STATUSES=['To do','In progress','Done'];
export function validateLeader(values){
 const errors={};
 if(!values.name?.trim()||values.name.trim().length>100)errors.name='Enter a leader name of up to 100 characters.';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email||''))errors.email='Enter a sample email address.';
 if(!values.department?.trim()||values.department.trim().length>70)errors.department='Enter a department name of up to 70 characters.';
 return errors;
}
export function validateTask(values,members){
 const errors={};
 if(!values.title?.trim()||values.title.trim().length>140)errors.title='Enter a task title of up to 140 characters.';
 if(!TASK_STATUSES.includes(values.status))errors.status='Choose a task status.';
 if(!['Normal','High'].includes(values.priority))errors.priority='Choose a priority.';
 if(values.due && (!/^\d{4}-\d{2}-\d{2}$/.test(values.due)||Number.isNaN(new Date(values.due+'T12:00:00Z').getTime())||new Date(values.due+'T12:00:00Z').toISOString().slice(0,10)!==values.due))errors.due='Choose a valid due date.';
 if(values.assigneeId&&!members.some(m=>m.id===values.assigneeId&&m.departmentId===values.departmentId&&m.status==='Active'))errors.assigneeId='Choose an active member of this department.';
 if((values.description||'').length>500)errors.description='Keep task details under 500 characters.';
 return errors;
}
export function departmentSummary(workspace,departmentId,today){
 const tasks=workspace.tasks.filter(t=>!departmentId||t.departmentId===departmentId);
 return {members:workspace.members.filter(m=>(!departmentId||m.departmentId===departmentId)&&m.status==='Active').length,total:tasks.length,open:tasks.filter(t=>t.status!=='Done').length,done:tasks.filter(t=>t.status==='Done').length,overdue:tasks.filter(t=>t.status!=='Done'&&t.due&&t.due<today).length};
}
