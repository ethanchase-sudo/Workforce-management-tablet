// ---------- App shell ----------
const SIM_START = 10*3600 + 24*60; // 10:24 local sim time
const INIT_CLOCKS = {
  u1: { status:'out', inAt:null, outAt:null, breakSec:0 },
  u2: { status:'in', inAt:6*3600+45*60, breakSec:0 },
  u3: { status:'in', inAt:7*3600+2*60, breakSec:15*60 },
};

function Login({ onLogin }) {
  const roles = [
    { k:'admin', perm:'Full access · users, roles, integrations' },
    { k:'manager', perm:'Attendance, approvals, inspections, analytics' },
    { k:'employee', perm:'Own time, assigned inspections, own history' },
  ];
  return (
    <div id="login">
      <div className="lg-brand">
        <div className="logo"><span className="logo-mark">W</span>Workforce Hub<span style={{color:'#7F92AF',fontWeight:400}}>· Tucker Operations</span></div>
        <div><h1>Time, inspections and operations — in one place.</h1><p>Sign in with your company Google account. What you see is based on the role assigned by your administrator.</p></div>
        <div className="lg-foot"><span>v2.4 · Internal use only</span><span>Support: ops-it@tuckerops.com</span></div>
      </div>
      <div className="lg-panel">
        <div className="lg-card">
          <div className="logo" style={{marginBottom:28,color:'var(--navy-900)'}}><span className="logo-mark">W</span>Workforce Hub</div>
          <h2>Sign in</h2>
          <div className="sub">Use your tuckerops.com Google Workspace account.</div>
          <button className="g-btn" onClick={()=>onLogin('employee')}><span className="g-dot"/>Continue with Google</button>
          <div className="lg-div">Demo · choose an account</div>
          {roles.map(r=>{ const u=WH_USERS[r.k]; return (
            <button key={r.k} className="acct" onClick={()=>onLogin(r.k)}>
              <img className="av lg" src={u.photo} alt=""/>
              <div className="meta"><div className="row" style={{gap:8}}><span className="nm">{u.name}</span><RoleTag role={r.k}/></div><div className="em">{u.email}</div><div className="perm">{r.perm}</div></div>
              <Icon n="chevR" className="faint"/>
            </button>);})}
          <div className="lg-note"><Icon n="info" size="sm"/>Prototype — Google authentication is simulated. No account data leaves this page.</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [roleKey, setRoleKey] = React.useState(()=>localStorage.getItem('wh_role'));
  const [screen, setScreen] = React.useState(()=>localStorage.getItem('wh_screen')||'dash');
  const [opsTab, setOpsTab] = React.useState(()=>localStorage.getItem('wh_tab')||'new');
  const [now, setNow] = React.useState(SIM_START);
  const [clocks, setClocks] = React.useState(INIT_CLOCKS);
  const [staff, setStaff] = React.useState(WH_STAFF);
  const [inspections, setInspections] = React.useState(WH_INSPECTIONS);
  const [assigned, setAssigned] = React.useState(WH_ASSIGNED);
  const [activity, setActivity] = React.useState(WH_ACTIVITY);
  const [timesheets, setTimesheets] = React.useState(WH_TIMESHEETS);
  const [notifs, setNotifs] = React.useState(WH_NOTIFS);
  const [modal, setModal] = React.useState(null);
  const [pop, setPop] = React.useState(null);
  const [toasts, setToasts] = React.useState([]);
  const [prefill, setPrefill] = React.useState(null);
  const [toggles, setToggles] = React.useState({sso:true,sheets:true,drive:true});
  const [sync, setSync] = React.useState({ last:'Today 10:00', queued:3, running:false, log:[
    { ok:true, t:'Timesheets synced to Sheets', s:'14 rows updated', time:'10:00' },
    { ok:true, t:'4 inspection photos uploaded to Drive', s:'/Operations/Inspections/2026/11', time:'09:14' },
    { ok:true, t:'Inspection log synced', s:'INS-2481 appended', time:'09:13' },
  ]});
  const [sheetRows, setSheetRows] = React.useState(WH_SHEET_ROWS.map(c=>({cells:c})));
  const [users, setUsers] = React.useState([WH_USERS.admin, WH_USERS.manager, WH_USERS.employee, {id:'s2',name:'Sofia Marchetti',email:'s.marchetti@tuckerops.com',role:'employee',photo:'assets/p4.jpg'},{id:'s5',name:'Luis Ortega',email:'l.ortega@tuckerops.com',role:'manager'},{id:'s4',name:'Priya Raman',email:'p.raman@tuckerops.com',role:'employee'}]);

  React.useEffect(()=>{ const t=setInterval(()=>setNow(n=>n+1),1000); return ()=>clearInterval(t); },[]);
  React.useEffect(()=>{ roleKey?localStorage.setItem('wh_role',roleKey):localStorage.removeItem('wh_role'); },[roleKey]);
  React.useEffect(()=>{ localStorage.setItem('wh_screen',screen); localStorage.setItem('wh_tab',opsTab); },[screen,opsTab]);

  const toast = (msg, kind) => { const id=Math.random(); setToasts(t=>[...t,{id,msg,kind}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000); };

  if (!roleKey) return <><Login onLogin={k=>{ setRoleKey(k); setScreen('dash'); toast(`Signed in as ${WH_USERS[k].name} · ${WH_USERS[k].roleLabel}`); }}/><Toasts list={toasts}/></>;

  const user = WH_USERS[roleKey];
  const perms = WH_PERMS[roleKey];
  const clock = clocks[user.id];
  const tm = fmtClock(now/60);

  const deny = (action, why) => setModal({ kind:'denied', action, why });
  const go = (s, tab) => {
    if (s==='ops' && tab==='analytics' && !perms.analytics) return deny('Reports & Analytics','Analytics contain team-wide attendance and performance data, available to Managers and Administrators.');
    if (s==='ops' && tab==='integrations' && !perms.integrations) return deny('Google Workspace settings','Integration settings are available to Managers (read-only) and Administrators.');
    setScreen(s); if (tab) setOpsTab(tab); setPop(null);
    const c=document.querySelector('.content'); if(c) c.scrollTop=0;
  };
  const setTab = k => go('ops', k);

  const onClock = action => {
    setClocks(cs=>{ const c={...cs[user.id]};
      if (action==='in') { if (c.outAt) { c.breakSec=(c.breakSec||0)+(now-c.outAt); } else { c.inAt=now; c.breakSec=0; } c.status='in'; c.outAt=null; }
      if (action==='out') { if (c.status==='break') c.breakSec+=now-c.breakStart; c.status='out'; c.outAt=now; }
      if (action==='break') { c.status='break'; c.breakStart=now; }
      if (action==='resume') { c.breakSec+=now-c.breakStart; c.status='in'; }
      return {...cs,[user.id]:c}; });
    const msg = { in:'Clocked in', out:'Clocked out', break:'Break started', resume:'Break ended' }[action];
    setStaff(st=>st.map(s=>s.id===user.id?{...s,status:action==='out'?'out':action==='break'?'break':'in',inAt:s.inAt==='—'?tm:s.inAt}:s));
    if (action==='in'||action==='out') setActivity(a=>[{ type:action, t:`You ${action==='in'?'clocked in':'clocked out'}`, s:`${user.site==='All sites'?'Head Office':user.site} · ${tm}`, time:tm, uid:user.id, self:true }, ...a]);
    setSync(s=>({...s,queued:s.queued+1}));
    toast(`${msg} at ${tm}`);
  };

  const onSubmit = data => {
    const n = Math.max(...inspections.map(i=>+i.id.split('-')[1]))+1;
    const rec = { id:`INS-${n}`, cat:data.cat, title:data.title, loc:data.loc, who:data.who, uid: data.who===user.name?user.id:(staff.find(s=>s.name===data.who)?.id||'x'), date:'Nov 13, 2026', time:tm, status:data.status, score:data.score, items:data.items, failed:data.failed, notes:data.notes, photos:data.photos, fresh:true };
    setInspections(xs=>[rec, ...xs.map(x=>({...x,fresh:false}))]);
    if (data.assignedId) setAssigned(a=>a.filter(x=>x.id!==data.assignedId));
    setActivity(a=>[{ type:data.status==='failed'?'fail':'insp', t:`${rec.id} ${rec.title} submitted`, s:`${rec.who} · ${STATUS_LABEL[rec.status]} ${rec.score}`, time:tm, uid:user.id }, ...a]);
    setSync(s=>({...s,queued:s.queued+1+(data.photos?1:0)}));
    setPrefill(null);
    setModal({ kind:'submitted', rec });
  };

  const startAssigned = a => { setPrefill({...a}); go('ops','new'); toast(`Loaded ${a.title}`); };
  window.__whStartAssigned = startAssigned;
  window.__whAssign = () => perms.assign ? setModal({kind:'assign'}) : deny('Assign inspection','Only Managers and Administrators can assign inspections.');

  const runSync = () => {
    setSync(s=>({...s,running:true}));
    setTimeout(()=>{
      setSync(s=>({...s,running:false,queued:0,last:`Today ${fmtClock(now/60)}`,log:[{ok:true,t:`${s.queued||1} records synced to Sheets`,s:'Timesheets & Inspection log tabs',time:fmtClock(now/60)},...s.log]}));
      const c=clocks.u3; 
      setSheetRows(r=>[{cells:['2026-11-13',user.name,clock.inAt!=null?fmtClock(clock.inAt/60):'—',clock.status==='out'&&clock.outAt?fmtClock(clock.outAt/60):'—',clock.status==='out'&&clock.outAt?(clockWorkedSec(clock,now)/3600).toFixed(2):'In progress',user.site==='All sites'?'Head Office':user.site],fresh:true},...r.map(x=>({...x,fresh:false}))].slice(0,7));
      toast('Sync complete (simulated)');
    }, 1600);
  };

  const openTs = () => setModal({kind:'timesheets'});
  const openAttendance = (filter, focus) => perms.attendance ? setModal({kind:'attendance', filter, focus}) : deny('Team attendance','Attendance records of other employees are private. Only Managers and Administrators can review them.');
  const unread = notifs.filter(n=>n.unread && (!n.priv||perms.allRecords)).length;

  const navItems = [
    { k:'dash', l:'Dashboard', ic:'home', on:()=>go('dash') },
    { k:'ops', l:'Inspections', ic:'clipboard', on:()=>go('ops', opsTab==='analytics'||opsTab==='integrations'?'new':opsTab), act: screen==='ops'&&(opsTab==='new'||opsTab==='history') },
    { k:'an', l:'Analytics', ic:'chart', on:()=>go('ops','analytics'), act: screen==='ops'&&opsTab==='analytics', locked:!perms.analytics },
    { k:'ws', l:'Workspace', ic:'cloud', on:()=>go('ops','integrations'), act: screen==='ops'&&opsTab==='integrations', locked:!perms.integrations },
  ];
  const hour = Math.floor(now/3600);

  return (
    <div id="app">
      <nav className="rail">
        <span className="logo-mark">W</span>
        {navItems.filter(n=>!n.locked).map(n=>(
          <button key={n.k} className={`nav-btn ${(n.act ?? screen===n.k)?'on':''}`} onClick={n.on}><Icon n={n.ic}/>{n.l}</button>))}
        {perms.manageUsers && <button className="nav-btn" onClick={()=>setModal({kind:'users'})}><Icon n="users"/>Users</button>}
        <span className="spacer"/>
        <button className="nav-btn" onClick={()=>setModal({kind:'settings'})}><Icon n="settings"/>Settings</button>
      </nav>
      <div className="main">
        <header className="topbar">
          <div className="hello">
            <h1>Good {hour<12?'morning':hour<17?'afternoon':'evening'}, {user.first}</h1>
            <div className="date">Friday, November 13, 2026 · <span className="num">{tm}</span></div>
          </div>
          <button className="ws-pill" onClick={()=>perms.integrations?go('ops','integrations'):setModal({kind:'wsinfo'})}>
            <span className={`dot ${sync.running?'amber':''}`}/><span className="lbl">Google Workspace · {sync.running?'syncing…':`synced ${sync.last.replace('Today ','')}`}</span>
          </button>
          <button className="icon-btn" onClick={e=>{ const r=e.currentTarget.getBoundingClientRect(); setPop(pop?.kind==='notif'?null:{kind:'notif',top:r.bottom+8,right:window.innerWidth-r.right}); }} aria-label="Notifications">
            <Icon n="bell"/>{unread>0 && <span className="badge-n">{unread}</span>}
          </button>
          <button className="me" onClick={e=>{ const r=e.currentTarget.getBoundingClientRect(); setPop(pop?.kind==='me'?null:{kind:'me',top:r.bottom+8,right:window.innerWidth-r.right}); }}>
            <Avatar p={user}/>
            <div className="meta" style={{textAlign:'left'}}><div className="nm">{user.name}</div><RoleTag role={user.role}/></div>
            <Icon n="chevD" size="sm" className="faint"/>
          </button>
        </header>
        <main className="content" data-screen-label={screen==='dash'?'01 Dashboard':'02 Inspections & Analytics'}>
          <div className="content-inner">
            {screen==='dash'
              ? <DashboardScreen user={user} perms={perms} clock={clock} nowSec={now} onClock={onClock} go={go} deny={deny} openTs={openTs} openAttendance={openAttendance} staff={staff} inspections={inspections} assigned={assigned} activity={activity} startAssigned={startAssigned}/>
              : <OpsScreen tab={opsTab} setTab={setTab} user={user} perms={perms} go={go} deny={deny} toast={toast} staff={staff} assigned={assigned} inspections={inspections} prefill={prefill} onSubmit={onSubmit} onView={rec=>setModal({kind:'insp',rec})} sync={sync} onSync={runSync} toggles={toggles} setToggle={k=>{setToggles(t=>({...t,[k]:!t[k]})); toast('Integration setting updated (demo)');}} sheetRows={sheetRows}/>}
          </div>
        </main>
      </div>

      {pop && <div style={{position:'fixed',inset:0,zIndex:54}} onClick={()=>setPop(null)}/>}
      {pop?.kind==='notif' && <div className="pop" style={{top:pop.top,right:pop.right}}>
        <div className="pop-h"><span>Notifications</span><button className="link" onClick={()=>setNotifs(n=>n.map(x=>({...x,unread:false})))}>Mark all read</button></div>
        {notifs.filter(n=>!n.priv||perms.allRecords).map((n,i)=>(
          <div key={i} className={`notif ${n.unread?'unread':''}`} onClick={()=>{ setNotifs(ns=>ns.map(x=>x===n?{...x,unread:false}:x)); setPop(null);
            if(n.go==='timesheets') openTs(); else if(n.go==='assigned') go(perms.attendance?'ops':'dash', perms.attendance?'new':undefined); else if(n.go==='integrations') perms.integrations?go('ops','integrations'):setModal({kind:'wsinfo'}); else go('ops',n.go); }}>
            <span className={`dot ${n.unread?'blue':'gray'}`} style={{marginTop:6}}/>
            <div style={{flex:1}}><div className="ft">{n.t}</div><div className="fs">{n.s}</div></div><span className="fs">{n.time}</span>
          </div>))}
      </div>}
      {pop?.kind==='me' && <div className="pop" style={{top:pop.top,right:pop.right,width:300}}>
        <div style={{padding:16,display:'flex',gap:12,alignItems:'center',borderBottom:'1px solid var(--line-2)'}}><Avatar p={user} size="lg"/><div><div style={{fontWeight:600}}>{user.name}</div><div className="fs">{user.title}</div><div className="fs">{user.email}</div></div></div>
        <div style={{padding:'8px 16px 4px'}} className="eyebrow">Switch demo role</div>
        {['admin','manager','employee'].map(k=><button key={k} className="menu-it" onClick={()=>{ setRoleKey(k); setPop(null); setPrefill(null); if(screen==='ops'&&((opsTab==='analytics'&&!WH_PERMS[k].analytics)||(opsTab==='integrations'&&!WH_PERMS[k].integrations))) setOpsTab('new'); toast(`Now viewing as ${WH_USERS[k].roleLabel}`); }}>
          <Avatar p={WH_USERS[k]} size="sm"/><span style={{flex:1}}>{WH_USERS[k].name}</span>{k===roleKey?<Icon n="check" size="sm" className="" />:<RoleTag role={k}/>}</button>)}
        <div className="sep" style={{margin:'6px 0'}}/>
        <button className="menu-it" onClick={()=>{setPop(null);setModal({kind:'access'});}}><Icon n="shield" size="sm"/>My access & permissions</button>
        <button className="menu-it" onClick={()=>{ setRoleKey(null); setPop(null); }}><Icon n="logout" size="sm"/>Sign out</button>
      </div>}

      {modal && <Modals modal={modal} close={()=>setModal(null)} setModal={setModal} user={user} perms={perms} staff={staff} setStaff={setStaff} timesheets={timesheets} setTimesheets={setTimesheets} clock={clock} now={now} toast={toast} go={go} deny={deny} users={users} setUsers={setUsers} assigned={assigned} setAssigned={setAssigned} roleKey={roleKey}/>}
      <Toasts list={toasts}/>
    </div>
  );
}

function Toasts({ list }) {
  return <div className="toasts">{list.map(t=><div key={t.id} className={`toast ${t.kind||''}`}><Icon n={t.kind==='err'?'alert':'check'} size="sm"/>{t.msg}</div>)}</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
