'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type Detail = { employee: { id:string; employee_code:string; name:string; email:string; department:string; designation:string }; cycle:string; kpis:Array<{name:string;target:number;achieved:number|null;score:number|null;weight:number}>; attendance:{present:number;absent:number;leave:number;total:number;score:number}; reviews:Array<{type:string;score:number;status:string}>; monthly:{overallScore:number;eligible:boolean;finalized:boolean;components:Record<string,number>;weights:Record<string,number>}|null; history:Array<{cycle:string;score:number;eligible:boolean}> };

export default function EmployeePerformancePage(){
 const {employeeId}=useParams<{employeeId:string}>(); const params=useSearchParams(); const cycle=params.get('cycle')||new Date().toISOString().slice(0,7); const [data,setData]=useState<Detail|null>(null); const [error,setError]=useState('');
 useEffect(()=>{let cancelled=false; fetch(`/api/performance/employee?employeeId=${encodeURIComponent(employeeId)}&cycle=${encodeURIComponent(cycle)}`,{cache:'no-store'}).then(async r=>{const j=await r.json();if(!r.ok)throw new Error(j.error||'Unable to load performance');return j.data}).then(d=>{if(!cancelled)setData(d)}).catch(e=>{if(!cancelled)setError(e.message)});return()=>{cancelled=true}},[employeeId,cycle]);
 if(error)return <main className="shell"><section className="card"><strong>Performance unavailable</strong><p className="muted">{error}</p></section></main>;
 if(!data)return <main className="shell"><section className="card"><p className="muted">Loading performance…</p></section></main>;
 return <main className="shell"><header className="topbar"><div><p className="eyebrow">Employee performance</p><h1>{data.employee.name}</h1><p className="muted">{data.employee.employee_code} · {data.employee.designation} · {data.employee.department}</p></div><form><input type="month" name="cycle" defaultValue={data.cycle}/></form></header>
 <section className="grid"><article className="card"><p className="muted">Overall score</p><strong>{data.monthly?.overallScore?.toFixed(2)??'—'}</strong><p className="muted">{data.monthly?.finalized?'Finalized':'Not finalized'}</p></article><article className="card"><p className="muted">Eligibility</p><strong>{data.monthly?.eligible?'Eligible':'Not eligible'}</strong></article><article className="card"><p className="muted">Attendance</p><strong>{data.attendance.score.toFixed(1)}</strong><p className="muted">{data.attendance.present}/{data.attendance.total} present</p></article></section>
 <section className="card"><p className="eyebrow">KPI performance · {data.cycle}</p><div className="table">{data.kpis.map(k=><div className="table-row" key={k.name}><span>{k.name}</span><span>Target {k.target}</span><span>Achieved {k.achieved??'—'}</span><strong>{k.score==null?'—':k.score.toFixed(1)}</strong></div>)}</div></section>
 <section className="card"><p className="eyebrow">Reviews</p><div className="table">{data.reviews.map((r,i)=><div className="table-row" key={`${r.type}-${i}`}><span>{r.type}</span><span>{r.status}</span><strong>{r.score.toFixed(1)}</strong></div>)}{!data.reviews.length&&<p className="muted">No approved reviews.</p>}</div></section>
 <section className="card"><p className="eyebrow">Performance history</p><div className="table">{data.history.map(h=><div className="table-row" key={h.cycle}><span>{h.cycle}</span><strong>{h.score.toFixed(2)}</strong><span>{h.eligible?'Eligible':'Not eligible'}</span></div>)}</div></section>
 </main>;
}
