// ---------- Screen 2: Inspections & Analytics ----------
const PHOTO_POOL = ['assets/insp2.jpg'];

function NewInspection({ user, perms, staff, assigned, prefill, onSubmit, deny, toast }) {
  const [cat, setCat] = React.useState(prefill?.cat || 'safety');
  const [title, setTitle] = React.useState(prefill?.title || '');
  const [date, setDate] = React.useState('2026-11-13');
  const [loc, setLoc] = React.useState(prefill?.loc || WH_LOCATIONS[0]);
  const [who, setWho] = React.useState(prefill?.who || user.name);
  const [items, setItems] = React.useState(()=>catOf(prefill?.cat||'safety').items.map((t,i)=>({id:i,t,r:null})));
  const [newItem, setNewItem] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [photos, setPhotos] = React.useState([]);
  const [tried, setTried] = React.useState(false);
  const fileRef = React.useRef();

  React.useEffect(()=>{ if(prefill){ setCat(prefill.cat); setTitle(prefill.title); setLoc(prefill.loc); setWho(prefill.who); setItems(catOf(prefill.cat).items.map((t,i)=>({id:i,t,r:null}))); } },[prefill]);

  const pickCat = id => { setCat(id); setItems(catOf(id).items.map((t,i)=>({id:i,t,r:null}))); };
  const setR = (id,r) => setItems(xs=>xs.map(x=>x.id===id?{...x,r:x.r===r?null:r}:x));
  const addItem = () => { if(!newItem.trim()) return; setItems(xs=>[...xs,{id:Date.now(),t:newItem.trim(),r:null}]); setNewItem(''); };
  const counts = { passed:items.filter(x=>x.r==='passed').length, failed:items.filter(x=>x.r==='failed').length, attention:items.filter(x=>x.r==='attention').length };
  const done = counts.passed+counts.failed+counts.attention;
  const complete = done===items.length && items.length>0;
  const outcome = counts.failed?'failed':counts.attention?'attention':'passed';

  const onFiles = e => {
    const fs=[...e.target.files].slice(0,6-photos.length);
    fs.forEach(f=>{ const r=new FileReader(); r.onload=()=>setPhotos(p=>[...p,r.result]); r.readAsDataURL(f); });
    e.target.value='';
  };
  const addSample = () => { if(photos.length>=6) return; setPhotos(p=>[...p, PHOTO_POOL[0]]); toast('Sample evidence photo attached'); };
  const chooseWho = v => { if(!perms.assign && v!==user.name){ deny('Assign to another employee','Only Managers and Administrators can assign inspections to other employees.'); return; } setWho(v); };

  const submit = () => {
    setTried(true);
    if (!complete) { toast(`Rate all checklist items (${items.length-done} remaining)`, 'err'); return; }
    if (!title.trim()) { toast('Add an inspection title', 'err'); return; }
    if ((counts.failed||counts.attention) && !notes.trim()) { toast('Add notes describing failed or flagged items', 'err'); return; }
    onSubmit({ cat, title:title.trim(), loc, who, date, items:items.length, failed:counts.failed, status:outcome, score:`${counts.passed}/${items.length}`, photos:photos.length, notes, assignedId:prefill?.id });
    setItems(catOf(cat).items.map((t,i)=>({id:i,t,r:null}))); setTitle(''); setNotes(''); setPhotos([]); setTried(false);
  };

  const people = perms.assign ? [user.name, ...staff.map(s=>s.name).filter(n=>n!==user.name)] : [user.name];
  const myAssigned = perms.allRecords ? assigned : assigned.filter(a=>a.uid===user.id);

  return (
    <div className="grid new-grid">
      <div className="grid" style={{gap:18}}>
        <div className="card">
          <div className="card-h"><h3>Inspection details</h3>{prefill && <span className="status review">From assignment {prefill.id}</span>}</div>
          <div className="card-b">
            <div className="field" style={{marginBottom:14}}><label>Category</label>
              <div className="cat-grid">{WH_CATEGORIES.map(c=>(
                <button key={c.id} className={`cat ${cat===c.id?'on':''}`} onClick={()=>pickCat(c.id)}>
                  <span className="ci"><Icon n={c.icon}/></span><span className="cn">{c.name}</span><span className="cc">{c.items.length} default items</span>
                </button>))}</div>
            </div>
            <div className="field" style={{marginBottom:14}}><label>Inspection title</label>
              <input className="inp" value={title} onChange={e=>setTitle(e.target.value)} placeholder={`e.g. ${catOf(cat).name} check — ${loc.split(' · ')[1]||loc}`} style={tried&&!title.trim()?{borderColor:'var(--red)'}:null}/>
            </div>
            <div className="form-row">
              <div className="field"><label>Date</label><input type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)}/></div>
              <div className="field"><label>Location</label><select className="inp" value={loc} onChange={e=>setLoc(e.target.value)}>{WH_LOCATIONS.map(l=><option key={l}>{l}</option>)}</select></div>
              <div className="field"><label>Responsible employee {!perms.assign && <Icon n="lock" size="xs" className="faint"/>}</label>
                <select className="inp" value={who} onChange={e=>chooseWho(e.target.value)} onMouseDown={e=>{ if(!perms.assign){ e.preventDefault(); deny('Assign to another employee','Only Managers and Administrators can assign inspections to other employees.'); } }}>
                  {people.map(p=><option key={p}>{p}</option>)}
                </select></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>Checklist</h3><span className="muted num" style={{fontSize:13}}>{done}/{items.length} rated</span>
            <button className="btn sm ghost" onClick={()=>setItems(xs=>xs.map(x=>({...x,r:'passed'})))}><Icon n="check" size="xs"/>Pass all</button>
          </div>
          <div className="card-b" style={{paddingTop:12}}>
            <div className="progress" style={{marginBottom:6}}>
              <i style={{width:`${counts.passed/Math.max(1,items.length)*100}%`,background:'var(--green)'}}/>
              <i style={{width:`${counts.attention/Math.max(1,items.length)*100}%`,background:'var(--amber)'}}/>
              <i style={{width:`${counts.failed/Math.max(1,items.length)*100}%`,background:'var(--red)'}}/>
            </div>
            {items.map((x,i)=>(
              <div key={x.id} className={`ck-item ${x.r?'r-'+x.r:''}`} style={tried&&!x.r?{background:'var(--red-bg)',margin:'0 -10px',padding:'12px 10px',borderRadius:10}:null}>
                <span className="ck-n num">{i+1}</span>
                <span className="ck-t">{x.t}</span>
                <div className="ck-opts">
                  <button className={`ck-o passed ${x.r==='passed'?'on':''}`} onClick={()=>setR(x.id,'passed')}><Icon n="check" size="xs"/>Pass</button>
                  <button className={`ck-o attention ${x.r==='attention'?'on':''}`} onClick={()=>setR(x.id,'attention')}><Icon n="alert" size="xs"/>Attention</button>
                  <button className={`ck-o failed ${x.r==='failed'?'on':''}`} onClick={()=>setR(x.id,'failed')}><Icon n="x" size="xs"/>Fail</button>
                </div>
                <button className="ck-x" title="Remove item" onClick={()=>setItems(xs=>xs.filter(y=>y.id!==x.id))}><Icon n="trash" size="xs"/></button>
              </div>))}
            <div className="ck-add">
              <input className="inp" placeholder="Add a custom checklist item…" value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addItem()}/>
              <button className="btn" style={{height:44}} onClick={addItem}><Icon n="plus" size="sm"/>Add</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>Notes & evidence</h3></div>
          <div className="card-b">
            <div className="field" style={{marginBottom:16}}><label>Notes and observations {(counts.failed||counts.attention)?<span style={{color:'var(--red)'}}>· required for flagged items</span>:null}</label>
              <textarea className="inp" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Describe findings, corrective actions taken, or follow-up required…"/></div>
            <div className="field"><label>Photo attachments <span className="faint">· {photos.length}/6</span></label>
              <div className="photos" style={{gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))'}}>
                {photos.map((p,i)=><div key={i} className="ph"><img src={p} alt=""/><button className="rm" onClick={()=>setPhotos(ps=>ps.filter((_,j)=>j!==i))}><Icon n="x" size="xs"/></button></div>)}
                {photos.length<6 && <div className="ph-add" onClick={()=>fileRef.current.click()}><Icon n="camera"/>Take / upload</div>}
                {photos.length<6 && <div className="ph-add" onClick={addSample}><Icon n="plus"/>Sample photo</div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles}/>
            </div>
          </div>
        </div>
      </div>

      <div className="grid" style={{gap:18,position:'sticky',top:0}}>
        <div className="card">
          <div className="card-h"><h3>Summary</h3></div>
          <div className="card-b">
            <div className="summary-row"><span className="muted">Category</span><b>{catOf(cat).name}</b></div>
            <div className="summary-row"><span className="muted">Location</span><b>{loc}</b></div>
            <div className="summary-row"><span className="muted">Responsible</span><b>{who}</b></div>
            <div className="sep"/>
            <div className="summary-row"><span className="row"><span className="dot"/>Passed</span><b className="num">{counts.passed}</b></div>
            <div className="summary-row"><span className="row"><span className="dot amber"/>Needs attention</span><b className="num">{counts.attention}</b></div>
            <div className="summary-row"><span className="row"><span className="dot red"/>Failed</span><b className="num">{counts.failed}</b></div>
            <div className="summary-row"><span className="row"><span className="dot gray"/>Unrated</span><b className="num">{items.length-done}</b></div>
            <div className="summary-row"><span className="row"><Icon n="camera" size="xs"/>Photos</span><b className="num">{photos.length}</b></div>
            <div className="sep"/>
            <div className="summary-row" style={{alignItems:'center'}}><span className="muted">Projected outcome</span>{complete?<Status s={outcome}/>:<Status s="pending" label="Incomplete"/>}</div>
            <button className="btn lg blue" style={{width:'100%',marginTop:14}} onClick={submit}><Icon n="send" size="sm"/>Submit Inspection</button>
            <div className="fs" style={{marginTop:10,textAlign:'center'}}>Saved to records · queued for Google Sheets sync</div>
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>{perms.allRecords?'Open assignments':'Your assignments'}</h3><span className="muted num">{myAssigned.length}</span></div>
          <div className="card-b" style={{paddingTop:6}}>
            {myAssigned.length===0 && <div className="muted" style={{padding:'12px 0'}}>Nothing outstanding.</div>}
            {myAssigned.slice(0,5).map(a=>(
              <div key={a.id} className="feed-it" onClick={()=>window.__whStartAssigned(a)}>
                <span className="feed-ic insp"><Icon n={catOf(a.cat).icon} size="sm"/></span>
                <div style={{flex:1,minWidth:0}}><div className="ft">{a.title}</div><div className="fs">{perms.allRecords?a.who+' · ':''}Due {a.due}</div></div>
                <Icon n="chevR" size="sm" className="faint"/>
              </div>))}
            {perms.assign && <button className="btn sm" style={{marginTop:8,width:'100%'}} onClick={()=>window.__whAssign()}><Icon n="plus" size="xs"/>Assign inspection</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function History({ user, perms, inspections, onView }) {
  const [q, setQ] = React.useState('');
  const [f, setF] = React.useState('all');
  let list = perms.allRecords ? inspections : inspections.filter(i=>i.uid===user.id);
  list = list.filter(i=>(f==='all'||i.status===f) && (i.title+i.who+i.id+i.loc).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="card">
      <div className="card-b">
        <div className="hist-tools">
          <div className="search"><Icon n="search" size="sm" className="faint"/><input placeholder="Search by ID, title, employee, location…" value={q} onChange={e=>setQ(e.target.value)}/></div>
          {[['all','All'],['passed','Passed'],['attention','Needs attention'],['failed','Failed']].map(([k,l])=><button key={k} className={`chip ${f===k?'on':''}`} onClick={()=>setF(k)}>{l}</button>)}
          <span className="muted" style={{marginLeft:'auto',fontSize:13}}>{perms.allRecords?'All employees':'Showing your submissions only'}</span>
        </div>
        <table className="tbl">
          <thead><tr><th>ID</th><th>Inspection</th><th className="hide-sm">Assigned employee</th><th className="hide-sm">Submitted</th><th>Score</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.length===0 && <tr><td colSpan="7" className="muted" style={{textAlign:'center',padding:32}}>No inspections match.</td></tr>}
            {list.map(i=>(
              <tr key={i.id} className="click" onClick={()=>onView(i)} style={i.fresh?{background:'oklch(0.97 0.04 155)'}:null}>
                <td className="num muted">{i.id}</td>
                <td><div style={{fontWeight:600}}>{i.title}</div><div className="fs">{catOf(i.cat).name} · {i.loc}</div></td>
                <td className="hide-sm">{i.who}</td>
                <td className="hide-sm num muted">{i.date.replace(', 2026','')} · {i.time}</td>
                <td className="num">{i.score}</td>
                <td><Status s={i.status}/></td>
                <td><Icon n="chevR" size="sm" className="faint"/></td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Analytics({ inspections, assigned }) {
  const [period, setPeriod] = React.useState('week');
  const [dept, setDept] = React.useState('All');
  const [view, setView] = React.useState('attendance');
  const A = WH_ANALYTICS[period];
  const dm = dept==='All'?1:({Warehouse:.37,Maintenance:.24,Quality:.17,Logistics:.14,Safety:.08})[dept];
  const extra = period==='week' ? inspections.filter(i=>i.fresh) : [];
  const passed = Math.round(A.passed*dm) + extra.filter(i=>i.status==='passed').length;
  const failed = Math.round(A.failed*dm) + extra.filter(i=>i.status==='failed').length;
  const att = Math.round(A.attention*dm) + extra.filter(i=>i.status==='attention').length;
  const pend = dept==='All' ? (period==='week'?assigned.length:A.pending) : Math.max(1,Math.round(A.pending*dm));
  const total = passed+failed+att;
  const rate = Math.round(total/(total+pend)*100);
  const hours = Math.round(A.hours*dm);
  const pPass = passed/Math.max(1,total)*100, pAtt = att/Math.max(1,total)*100;
  const maxDept = Math.max(...A.byDept.map(d=>d.v));
  return (
    <div className="grid" style={{gap:18}}>
      <div className="row" style={{flexWrap:'wrap',gap:10}}>
        <div className="seg">{[['week','Week'],['month','Month'],['quarter','Quarter']].map(([k,l])=><button key={k} className={period===k?'on':''} onClick={()=>setPeriod(k)}>{l}</button>)}</div>
        <select className="inp" style={{width:180,height:42}} value={dept} onChange={e=>setDept(e.target.value)}>{['All','Warehouse','Maintenance','Quality','Logistics','Safety'].map(d=><option key={d} value={d}>{d==='All'?'All departments':d}</option>)}</select>
        <span className="muted" style={{marginLeft:'auto',fontSize:13}}>{A.label} · {dept==='All'?'All departments':dept}</span>
      </div>
      <div className="grid an-grid">
        <div className="card stat" onClick={()=>setView('attendance')}><div className="k"><Icon n="users" size="sm"/>Attendance rate</div><div className="v num">{A.attendance}<small>%</small></div><div className="d">Target 95%</div></div>
        <div className="card stat" onClick={()=>setView('hours')}><div className="k"><Icon n="clock" size="sm"/>Total hours worked</div><div className="v num">{hours.toLocaleString()}<small>h</small></div><div className="d">{A.hoursD} vs previous</div></div>
        <div className="card stat"><div className="k"><Icon n="check" size="sm"/>Completion rate</div><div className="v num">{rate}<small>%</small></div><div className="progress" style={{marginTop:8}}><i style={{width:rate+'%',background:'var(--blue)'}}/></div></div>
        <div className="card stat"><div className="k"><Icon n="clipboard" size="sm"/>Pending inspections</div><div className="v num">{pend}</div><div className="d">{total} completed</div></div>
      </div>
      <div className="grid an-2">
        <div className="card">
          <div className="card-h"><h3>{view==='attendance'?'Employee attendance':'Hours by department'}</h3>
            <div className="seg"><button className={view==='attendance'?'on':''} onClick={()=>setView('attendance')}>Attendance</button><button className={view==='hours'?'on':''} onClick={()=>setView('hours')}>Hours</button></div>
          </div>
          <div className="card-b">
            {view==='attendance' ? <>
              <div className="chart-bars">{A.att.map(d=>(
                <div key={d.l} className="cb-col" title={`${d.p}% present`}>
                  <span className="fs num">{d.p}%</span>
                  <div className="cb-stack" style={{height:'80%'}}>
                    <i style={{height:`${d.p}%`,background:'var(--navy-700)'}}/><i style={{height:`${d.la}%`,background:'var(--amber)'}}/><i style={{height:`${d.a}%`,background:'var(--red)'}}/>
                  </div>
                  <span className="cb-l">{d.l}</span>
                </div>))}</div>
              <div className="legend" style={{marginTop:14}}><span><i style={{background:'var(--navy-700)'}}/>Present</span><span><i style={{background:'var(--amber)'}}/>Late</span><span><i style={{background:'var(--red)'}}/>Absent</span></div>
            </> : <div style={{padding:'6px 0'}}>{A.byDept.map(d=>(
              <div key={d.l} className="hbar" style={{opacity:dept==='All'||dept===d.l?1:.35}}><span className="l">{d.l}</span><span className="t"><i style={{width:`${d.v/maxDept*100}%`,background:'var(--blue)'}}/></span><span className="v num">{d.v.toLocaleString()}h</span></div>))}</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Inspection outcomes</h3></div>
          <div className="card-b">
            <div className="donut-wrap">
              <div className="donut" style={{background:`conic-gradient(var(--green) 0 ${pPass}%, var(--amber) 0 ${pPass+pAtt}%, var(--red) 0 100%)`}}>
                <div><div><div className="v num">{Math.round(pPass)}%</div><div className="fs">passed</div></div></div>
              </div>
              <div style={{flex:1}}>
                <div className="summary-row"><span className="row"><span className="dot"/>Passed</span><b className="num">{passed}</b></div>
                <div className="summary-row"><span className="row"><span className="dot amber"/>Needs attention</span><b className="num">{att}</b></div>
                <div className="summary-row"><span className="row"><span className="dot red"/>Failed</span><b className="num">{failed}</b></div>
                <div className="summary-row"><span className="row"><span className="dot gray"/>Pending</span><b className="num">{pend}</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Integrations({ perms, sync, onSync, toggles, setToggle, deny, sheetRows }) {
  const edit = perms.integrationsEdit;
  const tg = k => edit ? setToggle(k) : deny('Change integration settings','Only Administrators can configure Google Workspace integrations. Managers have read-only access.');
  return (
    <div>
      <div className="sync-banner"><Icon n="info" size="sm"/><div><b>Prototype preview.</b> This shows how Workforce Hub would sync with your organisation's Google Workspace. No live connection has been established — sync actions are simulated.</div></div>
      <div className="grid sync-grid">
        <div className="card svc">
          <div className="svc-h"><span className="svc-logo acct"><Icon n="key"/></span><div><div className="t">Google Account sign-in</div><div className="s">SSO · tuckerops.com</div></div><button className={`toggle on ${edit?'':'ro'}`} onClick={()=>tg('sso')}/></div>
          <div className="svc-meta"><span>Domain: <b>tuckerops.com</b></span><span>Roles mapped from: <b>Google Groups</b></span><span>Status: <Status s="review" label="Configured (demo)"/></span></div>
        </div>
        <div className="card svc">
          <div className="svc-h"><span className="svc-logo sheets"><Icon n="sheet"/></span><div><div className="t">Google Sheets</div><div className="s">Timesheets & inspection log</div></div><button className={`toggle ${toggles.sheets?'on':''} ${edit?'':'ro'}`} onClick={()=>tg('sheets')}/></div>
          <div className="svc-meta"><span>Workbook: <b>WorkforceHub_Records_2026</b></span><span>Last sync: <b className="num">{sync.last}</b></span><span>Queued: <b className="num">{sync.queued} records</b></span></div>
        </div>
        <div className="card svc">
          <div className="svc-h"><span className="svc-logo drive"><Icon n="folder"/></span><div><div className="t">Google Drive</div><div className="s">Inspection photos & PDFs</div></div><button className={`toggle ${toggles.drive?'on':''} ${edit?'':'ro'}`} onClick={()=>tg('drive')}/></div>
          <div className="svc-meta"><span>Folder: <b>/Operations/Inspections/2026</b></span><span>Stored: <b className="num">1,284 files · 3.2 GB</b></span><span>Retention: <b>7 years</b></span></div>
        </div>
      </div>
      <div className="grid an-2" style={{marginTop:18}}>
        <div className="card">
          <div className="card-h"><h3>Sheets preview · Timesheets tab</h3>
            <button className="btn sm primary" onClick={onSync} disabled={sync.running||!toggles.sheets}><Icon n="refresh" size="xs" className={sync.running?'spin':''}/>{sync.running?'Syncing…':'Sync now'}</button></div>
          <div className="card-b">
            <div className="sheet">
              <div className="sheet-bar"><Icon n="sheet" size="sm" style={{color:'#1E8E4E'}}/>WorkforceHub_Records_2026 › Timesheets</div>
              <div style={{overflowX:'auto'}}><table>
                <thead><tr><th className="rn"></th><th>A · Date</th><th>B · Employee</th><th>C · In</th><th>D · Out</th><th>E · Hours</th><th>F · Site</th></tr></thead>
                <tbody>{sheetRows.map((r,i)=><tr key={i} className={r.fresh?'new':''}><td className="rn">{i+2}</td>{r.cells.map((c,j)=><td key={j} className={j>=2&&j<=4?'num':''}>{c}</td>)}</tr>)}</tbody>
              </table></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Sync log</h3><span className="row fs"><span className={`dot ${sync.running?'amber':''}`}/>{sync.running?'In progress':'Healthy'}</span></div>
          <div className="card-b" style={{paddingTop:6}}>
            <div className="feed">{sync.log.map((l,i)=>(
              <div key={i} className="feed-it" style={{cursor:'default'}}>
                <span className={`feed-ic ${l.ok?'in':'sys'}`}><Icon n={l.ok?'check':'refresh'} size="sm"/></span>
                <div style={{flex:1}}><div className="ft">{l.t}</div><div className="fs">{l.s}</div></div><span className="fs num">{l.time}</span>
              </div>))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Denied({ title, msg, go }) {
  return <div className="card denied"><div className="ic"><Icon n="lock" size="lg"/></div><h3>{title}</h3><p>{msg}</p><button className="btn primary" onClick={()=>go('dash')}>Back to dashboard</button></div>;
}

function OpsScreen(props) {
  const { tab, setTab, perms, user, go } = props;
  const tabs = [
    { k:'new', l:'New Inspection', ic:'clipboard' },
    { k:'history', l:perms.allRecords?'Inspection History':'My Submissions', ic:'history' },
    { k:'analytics', l:'Analytics', ic:'chart', locked:!perms.analytics },
    { k:'integrations', l:'Google Workspace', ic:'cloud', locked:!perms.integrations },
  ];
  const visible = tabs.filter(t=>!t.locked || true);
  return (
    <div>
      <div className="page-h">
        <div className="grow"><div className="eyebrow">Inspections & Analytics</div><h2>{tabs.find(t=>t.k===tab).l}</h2></div>
        <div className="seg ops-tabs">{visible.map(t=><button key={t.k} className={tab===t.k?'on':''} onClick={()=>setTab(t.k)}><Icon n={t.locked?'lock':t.ic} size="xs" className={t.locked?'lk':''}/>{t.l}</button>)}</div>
      </div>
      {tab==='new' && <NewInspection {...props}/>}
      {tab==='history' && <History {...props}/>}
      {tab==='analytics' && (perms.analytics ? <Analytics {...props}/> : <Denied go={go} title="Analytics restricted" msg={`Your role (${user.roleLabel}) can't view team-wide attendance or performance analytics. Ask your manager if you need a report.`}/>)}
      {tab==='integrations' && (perms.integrations ? <Integrations {...props}/> : <Denied go={go} title="Integration settings restricted" msg="Google Workspace configuration is limited to Managers (read-only) and Administrators."/>)}
    </div>
  );
}

Object.assign(window,{OpsScreen});
