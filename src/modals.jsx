// ---------- Modals ----------
function Modals(p) {
  const { modal, close } = p;
  switch (modal.kind) {
    case 'denied': return <DeniedModal {...p}/>;
    case 'submitted': return <SubmittedModal {...p}/>;
    case 'timesheets': return <TimesheetsModal {...p}/>;
    case 'attendance': return <AttendanceModal {...p}/>;
    case 'insp': return <InspModal {...p}/>;
    case 'assign': return <AssignModal {...p}/>;
    case 'users': return <UsersModal {...p}/>;
    case 'settings': return <SettingsModal {...p}/>;
    case 'access': return <AccessModal {...p}/>;
    case 'wsinfo': return <Modal title="Google Workspace" onClose={close} footer={<button className="btn primary" onClick={close}>Got it</button>}>
      <p className="muted">Your time records and inspection submissions are saved to your company's Google Workspace (Sheets & Drive) automatically. Integration settings are managed by your administrator.</p>
      <div className="sync-banner" style={{marginTop:14,marginBottom:0}}><Icon n="info" size="sm"/>Prototype — no live connection is established.</div>
    </Modal>;
    default: return null;
  }
}

function DeniedModal({ modal, close, user }) {
  return (
    <Modal title={null} onClose={close}>
      <div className="denied" style={{padding:'28px 8px 8px'}}>
        <div className="ic"><Icon n="lock" size="lg"/></div>
        <h3>Access restricted</h3>
        <p><b style={{color:'var(--ink)'}}>{modal.action}</b> isn't available for your role. {modal.why}</p>
        <div className="row" style={{justifyContent:'center',gap:10,marginBottom:8}}><span className="muted" style={{fontSize:13}}>Signed in as</span><RoleTag role={user.role}/></div>
        <div className="row" style={{justifyContent:'center',gap:10,marginTop:18}}>
          <button className="btn" onClick={close}>Close</button>
          <button className="btn primary" onClick={()=>{close(); window.__whToastReq && window.__whToastReq();}}>OK</button>
        </div>
      </div>
    </Modal>
  );
}

function SubmittedModal({ modal, close, go }) {
  const r = modal.rec;
  return (
    <Modal title={null} onClose={close}>
      <div style={{textAlign:'center',padding:'20px 4px 4px'}}>
        <div className="success-ic"><Icon n="check"/></div>
        <h3 style={{fontSize:19,fontWeight:600}}>Inspection submitted</h3>
        <p className="muted" style={{margin:'6px 0 18px'}}>{r.id} has been recorded and added to inspection history.</p>
        <div className="card" style={{textAlign:'left',padding:16,boxShadow:'none'}}>
          <dl className="kv">
            <dt>Inspection</dt><dd style={{fontWeight:600}}>{r.title}</dd>
            <dt>Location</dt><dd>{r.loc}</dd>
            <dt>Responsible</dt><dd>{r.who}</dd>
            <dt>Result</dt><dd className="row"><Status s={r.status}/><span className="num muted">{r.score}</span></dd>
            <dt>Photos</dt><dd>{r.photos} attached</dd>
            <dt>Sync</dt><dd className="row"><span className="dot amber"/>Queued for Google Sheets</dd>
          </dl>
        </div>
        <div className="row" style={{justifyContent:'center',gap:10,marginTop:18,flexWrap:'wrap'}}>
          <button className="btn" onClick={close}>New inspection</button>
          <button className="btn primary" onClick={()=>{close();go('ops','history');}}>View in history<Icon n="arrowR" size="xs"/></button>
        </div>
      </div>
    </Modal>
  );
}

function TimesheetsModal({ close, perms, user, timesheets, setTimesheets, clock, now, toast }) {
  const [tab, setTab] = React.useState(perms.approve?'team':'mine');
  const todayH = clockWorkedSec(clock, now)/3600;
  const days = WH_WEEK.map(d=>d.today?{...d,h:todayH,in:clock.inAt!=null?fmtClock(clock.inAt/60):'—',out:clock.status==='out'&&clock.outAt?fmtClock(clock.outAt/60):'—',brk:Math.round(clockBreakSec(clock,now)/60)}:d).filter(d=>!d.future);
  const setStatus = (id, s) => { setTimesheets(ts=>ts.map(t=>t.id===id?{...t,status:s}:t)); toast(s==='approved'?'Timesheet approved':'Returned for review'); };
  const pend = timesheets.filter(t=>t.status!=='approved');
  return (
    <Modal wide title="Timesheets · Week of Nov 9 – 13" onClose={close} footer={<button className="btn" onClick={close}>Close</button>}>
      <div className="seg" style={{marginBottom:16}}>
        <button className={tab==='mine'?'on':''} onClick={()=>setTab('mine')}>My timesheet</button>
        <button className={tab==='team'?'on':''} onClick={()=>perms.approve?setTab('team'):toast('Team timesheets are restricted to Managers & Administrators','err')}>{!perms.approve && <Icon n="lock" size="xs" className="lk"/>}Team approvals {perms.approve && pend.length>0 && <span className="status pending" style={{padding:'0 6px'}}>{pend.length}</span>}</button>
      </div>
      {tab==='mine' ? <>
        <table className="tbl">
          <thead><tr><th>Day</th><th>In</th><th>Out</th><th>Break</th><th style={{textAlign:'right'}}>Hours</th></tr></thead>
          <tbody>{days.map(d=><tr key={d.d}><td><b>{d.d}</b> <span className="muted">{d.date}</span>{d.today && <span className="status review" style={{marginLeft:8}}>Today</span>}</td><td className="num">{d.in}</td><td className="num">{d.out}</td><td className="num">{d.brk}m</td><td className="num" style={{textAlign:'right',fontWeight:600}}>{d.h.toFixed(2)}</td></tr>)}</tbody>
        </table>
        <div className="row" style={{justifyContent:'space-between',marginTop:14,padding:'12px 14px',background:'var(--bg)',borderRadius:12}}>
          <span>Week total <b className="num" style={{marginLeft:6}}>{days.reduce((a,d)=>a+d.h,0).toFixed(2)}h</b></span>
          <button className="btn sm primary" onClick={()=>toast('Timesheet submitted for approval')}><Icon n="send" size="xs"/>Submit for approval</button>
        </div>
      </> : <>
        <table className="tbl">
          <thead><tr><th>Employee</th><th>Hours</th><th>Overtime</th><th>Status</th><th style={{textAlign:'right'}}>Action</th></tr></thead>
          <tbody>{timesheets.map(t=>(
            <tr key={t.id}><td><b>{t.name}</b></td><td className="num">{t.hours.toFixed(2)}</td><td className="num">{t.ot?`+${t.ot.toFixed(1)}h`:'—'}</td><td><Status s={t.status}/></td>
              <td style={{textAlign:'right'}}>{t.status==='approved'?<button className="btn sm ghost" onClick={()=>setStatus(t.id,'pending')}>Undo</button>:<div className="row" style={{justifyContent:'flex-end',gap:6}}><button className="btn sm" onClick={()=>setStatus(t.id,'review')}>Query</button><button className="btn sm primary" onClick={()=>setStatus(t.id,'approved')}><Icon n="check" size="xs"/>Approve</button></div>}</td></tr>))}</tbody>
        </table>
        <div className="row" style={{justifyContent:'flex-end',marginTop:14}}><button className="btn sm blue" disabled={!pend.length} onClick={()=>{ setTimesheets(ts=>ts.map(t=>({...t,status:'approved'}))); toast(`${pend.length} timesheets approved`); }}>Approve all pending</button></div>
      </>}
    </Modal>
  );
}

function AttendanceModal({ modal, close, staff, setStaff, toast }) {
  const [f, setF] = React.useState(modal.filter||'all');
  const [sel, setSel] = React.useState(modal.focus||null);
  const list = staff.filter(s=>f==='all'||(f==='present'&&['in','break','late'].includes(s.status))||(f==='absent'&&s.status==='absent')||(f==='out'&&s.status==='out'));
  const p = staff.find(s=>s.id===sel);
  return (
    <Modal wide title="Attendance review · Today" onClose={close} footer={<><button className="btn" onClick={()=>toast('Attendance exported to Google Sheets (simulated)')}><Icon n="sheet" size="sm"/>Export to Sheets</button><button className="btn primary" onClick={close}>Done</button></>}>
      <div className="row" style={{gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {[['all','All',staff.length],['present','Present',staff.filter(s=>['in','break','late'].includes(s.status)).length],['absent','Absent',staff.filter(s=>s.status==='absent').length],['out','Clocked out',staff.filter(s=>s.status==='out').length]].map(([k,l,n])=><button key={k} className={`chip ${f===k?'on':''}`} onClick={()=>setF(k)}>{l} <span className="num" style={{opacity:.7}}>{n}</span></button>)}
      </div>
      {p && <div className="card" style={{padding:14,marginBottom:14,boxShadow:'none',background:'var(--blue-50)',borderColor:'#D3E0F6'}}>
        <div className="row" style={{gap:12}}><Avatar p={p} size="lg"/><div style={{flex:1}}><div style={{fontWeight:600}}>{p.name}</div><div className="fs">{p.role} · {p.dept} · {p.site}</div></div><Status s={p.status}/></div>
        <div className="row" style={{gap:8,marginTop:12,flexWrap:'wrap'}}>
          {p.status==='absent' && <button className="btn sm" onClick={()=>{ setStaff(st=>st.map(s=>s.id===p.id?{...s,note:'Excused · approved by manager'}:s)); toast(`${p.name.split(' ')[0]} marked excused`); }}>Mark excused</button>}
          {p.status==='late' && <button className="btn sm" onClick={()=>{ setStaff(st=>st.map(s=>s.id===p.id?{...s,status:'in'}:s)); toast('Late arrival acknowledged'); }}>Acknowledge late</button>}
          <button className="btn sm" onClick={()=>toast(`Reminder sent to ${p.name.split(' ')[0]} via Google Chat (simulated)`)}>Send reminder</button>
          <button className="btn sm ghost" onClick={()=>setSel(null)}>Close</button>
        </div>
      </div>}
      <table className="tbl">
        <thead><tr><th>Employee</th><th className="hide-sm">Dept</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
        <tbody>{list.map(s=>(
          <tr key={s.id} className="click" onClick={()=>setSel(s.id)} style={sel===s.id?{background:'var(--blue-50)'}:null}>
            <td><div className="person"><Avatar p={s} size="sm"/><div><div className="nm">{s.name}</div><div className="sb">{s.note||s.role}</div></div></div></td>
            <td className="hide-sm muted">{s.dept}</td><td className="num">{s.inAt}</td><td className="num">{s.outAt||'—'}</td><td><Status s={s.status}/></td>
          </tr>))}</tbody>
      </table>
    </Modal>
  );
}

function InspModal({ modal, close, perms, toast, user }) {
  const r = modal.rec; const c = catOf(r.cat);
  const items = c.items.slice(0, r.items).map((t,i)=>({t, r: i < r.items - r.failed - (r.status==='attention'?1:0) ? 'passed' : r.status==='attention'?'attention':'failed'}));
  const [state, setState] = React.useState(r.reviewed||null);
  return (
    <Modal wide title={`${r.id} · ${r.title}`} onClose={close} footer={<>
      <button className="btn" onClick={()=>toast('PDF saved to Google Drive › Inspections (simulated)')}><Icon n="file" size="sm"/>Export PDF</button>
      {perms.approve ? (state ? <span className="status approved" style={{alignSelf:'center'}}>Reviewed by {user.first}</span> : <><button className="btn" onClick={()=>{setState('returned');toast('Returned to employee for correction');}}>Return</button><button className="btn primary" onClick={()=>{setState('ok');r.reviewed='ok';toast('Inspection review signed off');}}><Icon n="check" size="sm"/>Sign off review</button></>) : <button className="btn primary" onClick={close}>Close</button>}
    </>}>
      <div className="row" style={{gap:10,marginBottom:14,flexWrap:'wrap'}}><Status s={r.status}/><span className="muted">{c.name}</span><span className="faint">·</span><span className="muted">{r.loc}</span></div>
      <dl className="kv" style={{marginBottom:16}}>
        <dt>Assigned employee</dt><dd>{r.who}</dd>
        <dt>Submitted</dt><dd className="num">{r.date} · {r.time}</dd>
        <dt>Score</dt><dd className="num">{r.score}</dd>
      </dl>
      <div className="eyebrow" style={{marginBottom:4}}>Checklist</div>
      {items.map((x,i)=><div key={i} className={`ck-item r-${x.r}`} style={{padding:'9px 0'}}><span className="ck-n num">{i+1}</span><span className="ck-t">{x.t}</span><Status s={x.r} label={({passed:'Passed',failed:'Failed',attention:'Needs attention'})[x.r]}/></div>)}
      <div className="eyebrow" style={{margin:'16px 0 6px'}}>Notes</div>
      <p className="muted" style={{fontSize:13.5}}>{r.notes || (r.status==='failed'?'Hydraulic seep at mast cylinder; horn intermittent. Unit tagged out of service and maintenance notified.':r.status==='attention'?'Minor issue flagged for follow-up within 48h. No immediate hazard.':'All items checked and compliant. No follow-up required.')}</p>
      {(r.status!=='passed' || r.photos) && <><div className="eyebrow" style={{margin:'16px 0 8px'}}>Evidence</div><div className="photos" style={{gridTemplateColumns:'repeat(4,1fr)'}}><div className="ph"><img src="assets/insp2.jpg" alt=""/></div></div></>}
    </Modal>
  );
}

function AssignModal({ close, staff, setAssigned, toast }) {
  const [cat, setCat] = React.useState('safety');
  const [who, setWho] = React.useState(staff[0].name);
  const [loc, setLoc] = React.useState(WH_LOCATIONS[0]);
  const [due, setDue] = React.useState('Nov 16');
  const [title, setTitle] = React.useState('');
  const save = () => { const s=staff.find(x=>x.name===who); setAssigned(a=>[...a,{ id:`A-${316+a.length}`, cat, title:title||`${catOf(cat).name} check`, loc, who, uid:s.id, due, status:'scheduled' }]); toast(`Inspection assigned to ${who}`); close(); };
  return (
    <Modal title="Assign inspection" onClose={close} footer={<><button className="btn" onClick={close}>Cancel</button><button className="btn primary" onClick={save}>Assign</button></>}>
      <div className="grid" style={{gap:14}}>
        <div className="field"><label>Title</label><input className="inp" value={title} onChange={e=>setTitle(e.target.value)} placeholder={`${catOf(cat).name} check`}/></div>
        <div className="field"><label>Category</label><select className="inp" value={cat} onChange={e=>setCat(e.target.value)}>{WH_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="field"><label>Assign to</label><select className="inp" value={who} onChange={e=>setWho(e.target.value)}>{staff.map(s=><option key={s.id}>{s.name}</option>)}</select></div>
        <div className="row" style={{gap:14}}>
          <div className="field" style={{flex:1}}><label>Location</label><select className="inp" value={loc} onChange={e=>setLoc(e.target.value)}>{WH_LOCATIONS.map(l=><option key={l}>{l}</option>)}</select></div>
          <div className="field" style={{width:140}}><label>Due</label><select className="inp" value={due} onChange={e=>setDue(e.target.value)}>{['Today, 17:00','Nov 14','Nov 16','Nov 18','Nov 20'].map(d=><option key={d}>{d}</option>)}</select></div>
        </div>
      </div>
    </Modal>
  );
}

function UsersModal({ close, users, setUsers, toast, user }) {
  const [inv, setInv] = React.useState('');
  return (
    <Modal wide title="Manage users & roles" onClose={close} footer={<button className="btn primary" onClick={close}>Done</button>}>
      <p className="muted" style={{marginBottom:14,fontSize:13.5}}>Accounts are provisioned from Google Workspace. Changing a role updates what that person can see on next sign-in.</p>
      <table className="tbl">
        <thead><tr><th>User</th><th className="hide-sm">Email</th><th>Role</th></tr></thead>
        <tbody>{users.map(u=>(
          <tr key={u.id}><td><div className="person"><Avatar p={u} size="sm"/><span className="nm">{u.name}</span></div></td><td className="hide-sm muted">{u.email}</td>
            <td><select className="inp" style={{height:36,width:160}} value={u.role} disabled={u.id===user.id} onChange={e=>{ const r=e.target.value; setUsers(us=>us.map(x=>x.id===u.id?{...x,role:r}:x)); toast(`${u.name} is now ${({admin:'an Administrator',manager:'a Manager',employee:'an Employee'})[r]}`); }}>
              <option value="admin">Administrator</option><option value="manager">Manager</option><option value="employee">Employee</option></select></td></tr>))}</tbody>
      </table>
      <div className="ck-add" style={{marginTop:16}}>
        <input className="inp" placeholder="name@tuckerops.com" value={inv} onChange={e=>setInv(e.target.value)}/>
        <button className="btn primary" style={{height:44}} onClick={()=>{ if(!/@tuckerops\.com$/.test(inv)){toast('Use a tuckerops.com Google account','err');return;} const nm=inv.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); setUsers(us=>[...us,{id:'n'+Date.now(),name:nm,email:inv,role:'employee'}]); setInv(''); toast(`Invited ${inv}`); }}><Icon n="plus" size="sm"/>Invite</button>
      </div>
    </Modal>
  );
}

function SettingsModal({ close, perms, toast, deny }) {
  const [s, setS] = React.useState({ geo:true, remind:true, autoBreak:false, offline:true });
  const rows = [
    ['remind','Clock-out reminders','Notify me if I\'m still clocked in after shift end', false],
    ['offline','Offline mode','Queue records when the tablet loses connection', false],
    ['geo','Require location for clock-in','Organisation policy · Administrators only', true],
    ['autoBreak','Auto-deduct 30 min break','Organisation policy · Administrators only', true],
  ];
  return (
    <Modal title="Settings" onClose={close} footer={<button className="btn primary" onClick={close}>Done</button>}>
      {rows.map(([k,t,d,org])=>{ const locked = org && !perms.manageUsers; return (
        <div key={k} className="ck-item">
          <div style={{flex:1}}><div style={{fontWeight:500}} className="row">{t}{locked && <Icon n="lock" size="xs" className="faint"/>}</div><div className="fs">{d}</div></div>
          <button className={`toggle ${s[k]?'on':''} ${locked?'ro':''}`} onClick={()=>{ if(locked){ deny('Organisation settings','Company-wide policies can only be changed by Administrators.'); return; } setS(x=>({...x,[k]:!x[k]})); toast('Setting saved'); }}/>
        </div>);})}
    </Modal>
  );
}

function AccessModal({ close, user, roleKey }) {
  const caps = [
    ['Clock in / out & personal timesheet', ['admin','manager','employee']],
    ['Complete assigned inspections', ['admin','manager','employee']],
    ['View own submission history', ['admin','manager','employee']],
    ['Review team attendance', ['admin','manager']],
    ['Approve timesheets', ['admin','manager']],
    ['Create & assign inspections to others', ['admin','manager']],
    ['View all inspection records', ['admin','manager']],
    ['Operational analytics', ['admin','manager']],
    ['View Google Workspace integration', ['admin','manager']],
    ['Configure integrations & settings', ['admin']],
    ['Manage users & roles', ['admin']],
  ];
  return (
    <Modal wide title="Access & permissions" onClose={close} footer={<button className="btn primary" onClick={close}>Close</button>}>
      <table className="tbl">
        <thead><tr><th>Capability</th>{['admin','manager','employee'].map(r=><th key={r} style={{textAlign:'center',color:r===roleKey?'var(--blue)':undefined}}>{({admin:'Admin',manager:'Manager',employee:'Employee'})[r]}</th>)}</tr></thead>
        <tbody>{caps.map(([t,rs])=><tr key={t}><td>{t}</td>{['admin','manager','employee'].map(r=><td key={r} style={{textAlign:'center',background:r===roleKey?'var(--blue-50)':undefined}}>{rs.includes(r)?<Icon n="check" size="sm" className="" />:<span className="faint">—</span>}</td>)}</tr>)}</tbody>
      </table>
    </Modal>
  );
}

Object.assign(window,{Modals});
