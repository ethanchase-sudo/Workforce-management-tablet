// ---------- Screen 1: Dashboard & Time ----------
function ClockCard({ user, clock, nowSec, onClock }) {
  const worked = clockWorkedSec(clock, nowSec);
  const brk = clockBreakSec(clock, nowSec);
  const s = clock.status;
  const h = Math.floor(worked/3600), m = Math.floor(worked%3600/60), sec = worked%60;
  const label = { in:'Clocked in', break:'On break', out: clock.outAt ? 'Clocked out' : 'Not clocked in' }[s];
  const target = 8*3600;
  return (
    <div className="card clock-card">
      <div className="card-b">
        <div className="row" style={{justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <span className="clock-status"><span className={`dot ${s==='in'?'':s==='break'?'amber':'gray'}`}/>{label}{s!=='out' && <span style={{color:'#93A5C1',fontWeight:500}}> · since {fmtClock(clock.inAt/60)}</span>}</span>
          <span style={{fontSize:12.5,color:'#93A5C1'}} className="row"><Icon n="pin" size="xs"/>{user.site==='All sites'?'Head Office':user.site}</span>
        </div>
        <div className="clock-big num">{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}<span style={{color:'#5D7396',fontSize:32}}>:{String(sec).padStart(2,'0')}</span></div>
        <div className="clock-sub">
          {s==='out' && !clock.outAt && 'Shift scheduled 07:00 – 15:30 · tap Clock In to start'}
          {s==='out' && clock.outAt && `Clocked out at ${fmtClock(clock.outAt/60)} · shift recorded`}
          {s!=='out' && `Worked today · ${Math.max(0, Math.round((target-worked)/60))} min remaining of 8h target`}
        </div>
        <div className="progress" style={{marginTop:14,background:'rgba(255,255,255,.1)'}}><i style={{width:`${Math.min(100,worked/target*100)}%`,background:'oklch(0.7 0.13 155)'}}/></div>
        <div className="clock-stats">
          <div><div className="k">Clock in</div><div className="v num">{clock.inAt!=null?fmtClock(clock.inAt/60):'—'}</div></div>
          <div><div className="k">Break</div><div className="v num">{fmtHM(brk/60)}</div></div>
          <div><div className="k">Today</div><div className="v num">{(worked/3600).toFixed(2)}h</div></div>
        </div>
        <div className="clock-actions">
          {s==='out' && <button className="btn lg clock-in" onClick={()=>onClock('in')}><Icon n="play" size="sm"/>{clock.outAt?'Clock In Again':'Clock In'}</button>}
          {s==='in' && <><button className="btn lg clock-out" onClick={()=>onClock('out')}><Icon n="stop" size="sm"/>Clock Out</button><button className="btn lg brk" onClick={()=>onClock('break')}><Icon n="coffee" size="sm"/>Start Break</button></>}
          {s==='break' && <><button className="btn lg clock-in" onClick={()=>onClock('resume')}><Icon n="play" size="sm"/>End Break</button><button className="btn lg brk" onClick={()=>onClock('out')}><Icon n="stop" size="sm"/>Clock Out</button></>}
        </div>
      </div>
    </div>
  );
}

function WeekCard({ clock, nowSec, onOpen }) {
  const todayH = clockWorkedSec(clock, nowSec)/3600;
  const days = WH_WEEK.map(d=>d.today?{...d,h:todayH}:d);
  const [sel, setSel] = React.useState(4);
  const total = days.reduce((a,d)=>a+d.h,0);
  const d = days[sel];
  return (
    <div className="card">
      <div className="card-h"><h3>This week</h3><button className="link" onClick={onOpen}>Full timesheet</button></div>
      <div className="card-b">
        <div className="week">
          {days.map((x,i)=>(
            <div key={i} className={`wk-col ${x.today?'is-today':''}`} onClick={()=>setSel(i)}>
              <span className="wk-h num">{x.future?'':x.h.toFixed(1)}</span>
              <div className={`wk-bar ${x.today?'today':x.future?'':'done'} ${sel===i?'sel':''}`} style={{height:`${Math.max(4,x.h/10*100)}%`}}/>
              <span className="wk-d">{x.d}</span>
            </div>
          ))}
        </div>
        <div className="wk-sum">
          <div><div className="k">Total</div><div className="v num">{total.toFixed(2)}h</div></div>
          <div><div className="k">{d.d} · {d.date}</div><div className="v num" style={{fontSize:14,marginTop:3}}>{d.future?'Not scheduled':d.today?`${fmtClock(clock.inAt!=null?clock.inAt/60:0)} – ${clock.status==='out'&&clock.outAt?fmtClock(clock.outAt/60):'now'}`:`${d.in} – ${d.out} · ${d.brk}m break`}</div></div>
          <div style={{marginLeft:'auto'}}><div className="k">Status</div><div style={{marginTop:3}}><Status s="pending" label="Not submitted"/></div></div>
        </div>
      </div>
    </div>
  );
}

function QuickActions({ perms, go, deny, openTs }) {
  const items = [
    { t:'Start Inspection', s:'New checklist', ic:'clipboard', on:()=>go('ops','new') },
    { t:'View Timesheets', s: perms.approve?'Team & personal':'Your hours', ic:'calendar', on:openTs },
    { t:'Inspection History', s: perms.allRecords?'All submissions':'Your submissions', ic:'history', on:()=>go('ops','history') },
    { t:'Reports & Analytics', s: perms.analytics?'Operational insights':'Managers & admins', ic:'chart', on:()=>perms.analytics?go('ops','analytics'):deny('Reports & Analytics','Analytics contain team-wide attendance and performance data, available to Managers and Administrators.'), locked:!perms.analytics },
  ];
  return (
    <div className="grid qa">
      {items.map(x=>(
        <button key={x.t} className={`qa-btn ${x.locked?'locked':''}`} onClick={x.on}>
          {x.locked && <span className="lock"><Icon n="lock" size="sm"/></span>}
          <span className="qa-ic"><Icon n={x.ic}/></span>
          <span className="t">{x.t}</span><span className="s">{x.s}</span>
        </button>
      ))}
    </div>
  );
}

function Overview({ user, perms, staff, inspections, assigned, clock, nowSec, go, openAttendance }) {
  if (!perms.attendance) {
    const mine = inspections.filter(i=>i.uid===user.id);
    const myAssigned = assigned.filter(a=>a.uid===user.id);
    const week = WH_WEEK.reduce((a,d)=>a+(d.today?0:d.h),0) + clockWorkedSec(clock,nowSec)/3600;
    const cards = [
      { k:'Assigned to me', v:myAssigned.length, d: myAssigned[0]?`Next: ${myAssigned[0].due}`:'Nothing due', ic:'clipboard', on:()=>go('ops','new') },
      { k:'My completed', v:mine.length, d:'Submitted this month', ic:'check', on:()=>go('ops','history') },
      { k:'Hours this week', v:<>{week.toFixed(1)}<small> / 40</small></>, d:'Mon – Fri', ic:'clock', on:null },
      { k:'Pass rate', v:<>{Math.round(mine.filter(i=>i.status==='passed').length/Math.max(1,mine.length)*100)}<small>%</small></>, d:'Your inspections', ic:'badge', on:()=>go('ops','history') },
    ];
    return <div className="grid ov">{cards.map(c=><div key={c.k} className="card stat" onClick={c.on||undefined} style={!c.on?{cursor:'default'}:null}><div className="k"><Icon n={c.ic} size="sm"/>{c.k}</div><div className="v num">{c.v}</div><div className="d">{c.d}</div></div>)}</div>;
  }
  const inN = staff.filter(s=>s.status==='in'||s.status==='break'||s.status==='late').length;
  const absent = staff.filter(s=>s.status==='absent').length;
  const pending = assigned.length;
  const done = inspections.filter(i=>i.date.startsWith('Nov 13')||i.date.startsWith('Nov 12')||i.date.startsWith('Nov 11')||i.date.startsWith('Nov 10')||i.date.startsWith('Nov 9')).length;
  const cards = [
    { k:'Clocked in now', v:<>{inN}<small> / {staff.length}</small></>, d:`${staff.filter(s=>s.status==='break').length} on break · ${staff.filter(s=>s.status==='late').length} late`, ic:'users', on:()=>openAttendance('present') },
    { k:'Absent / not in', v:absent, d:staff.filter(s=>s.status==='absent').map(s=>s.name.split(' ')[0]).join(', ')||'Everyone accounted for', ic:'userx', on:()=>openAttendance('absent') },
    { k:'Pending inspections', v:pending, d:`${assigned.filter(a=>a.due.startsWith('Today')).length} due today`, ic:'clipboard', on:()=>go('ops','new') },
    { k:'Completed this week', v:done, d:`${inspections.filter(i=>i.status==='failed').length} failed · ${inspections.filter(i=>i.status==='attention').length} flagged`, ic:'check', on:()=>go('ops','history') },
  ];
  return <div className="grid ov">{cards.map(c=><div key={c.k} className="card stat" onClick={c.on}><div className="k"><Icon n={c.ic} size="sm"/>{c.k}</div><div className="v num">{c.v}</div><div className="d">{c.d}</div></div>)}</div>;
}

function AttendancePanel({ staff, openAttendance }) {
  return (
    <div className="card">
      <div className="card-h"><h3>Team attendance · today</h3><button className="btn sm" onClick={()=>openAttendance('all')}><Icon n="eye" size="xs"/>Review all</button></div>
      <div className="card-b" style={{paddingTop:8}}>
        <table className="tbl">
          <thead><tr><th>Employee</th><th className="hide-sm">Site</th><th>In</th><th>Status</th></tr></thead>
          <tbody>{staff.slice(0,6).map(s=>(
            <tr key={s.id} className="click" onClick={()=>openAttendance('all', s.id)}>
              <td><div className="person"><Avatar p={s} size="sm"/><div><div className="nm">{s.name}</div><div className="sb">{s.role}</div></div></div></td>
              <td className="hide-sm muted">{s.site}</td>
              <td className="num">{s.inAt}</td>
              <td><Status s={s.status}/></td>
            </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}

function MyAssignedPanel({ user, assigned, go, startAssigned }) {
  const mine = assigned.filter(a=>a.uid===user.id);
  return (
    <div className="card">
      <div className="card-h"><h3>Assigned to you</h3><button className="link" onClick={()=>go('ops','history')}>My history</button></div>
      <div className="card-b" style={{paddingTop:8}}>
        {mine.length===0 && <div className="muted" style={{padding:'24px 0',textAlign:'center'}}>No open inspections. Nice work.</div>}
        {mine.map(a=>{ const c=catOf(a.cat); return (
          <div key={a.id} className="ck-item">
            <span className="qa-ic" style={{width:40,height:40}}><Icon n={c.icon} size="sm"/></span>
            <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600}}>{a.title}</div><div className="fs">{a.loc} · Due {a.due}</div></div>
            <button className="btn sm blue" onClick={()=>startAssigned(a)}>Start<Icon n="arrowR" size="xs"/></button>
          </div>);})}
      </div>
    </div>
  );
}

function ActivityFeed({ user, perms, activity, go, openAttendance }) {
  const [tab, setTab] = React.useState('all');
  let list = perms.allRecords ? activity : activity.filter(a=>!a.priv && (!a.uid || a.uid===user.id));
  if (!perms.allRecords) list = list.map(a=>a.self?a:a);
  list = list.filter(a=> tab==='all' || (tab==='time'&&(a.type==='in'||a.type==='out')) || (tab==='insp'&&(a.type==='insp'||a.type==='fail')) || (tab==='sys'&&a.type==='sys'));
  const icon = { in:'play', out:'stop', insp:'clipboard', fail:'alert', sys:'bell' };
  const click = a => { if (a.type==='insp'||a.type==='fail') go('ops','history'); else if (a.type==='sys') go('ops', perms.integrations?'integrations':'history'); else if (perms.attendance) openAttendance('all'); };
  return (
    <div className="card">
      <div className="card-h"><h3>Recent activity</h3>
        <div className="tabs-mini">{[['all','All'],['time','Time'],['insp','Inspections'],['sys','System']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}</button>)}</div>
      </div>
      <div className="card-b" style={{paddingTop:6}}>
        <div className="feed">
          {list.length===0 && <div className="muted" style={{padding:'20px 0',textAlign:'center'}}>No activity in this category.</div>}
          {list.slice(0,7).map((a,i)=>(
            <div key={i} className="feed-it" onClick={()=>click(a)}>
              <span className={`feed-ic ${a.type}`}><Icon n={icon[a.type]} size="sm"/></span>
              <div style={{flex:1,minWidth:0}}><div className="ft">{a.t}</div><div className="fs">{a.s}</div></div>
              <span className="fs num">{a.time}</span>
            </div>))}
        </div>
      </div>
    </div>
  );
}

function DashboardScreen(props) {
  const { user, perms, clock, nowSec, onClock, go, deny, openTs, openAttendance, staff, inspections, assigned, activity, startAssigned } = props;
  return (
    <div className="grid" style={{gap:18}}>
      <div className="grid dash-top">
        <ClockCard user={user} clock={clock} nowSec={nowSec} onClock={onClock}/>
        <WeekCard clock={clock} nowSec={nowSec} onOpen={openTs}/>
      </div>
      <QuickActions perms={perms} go={go} deny={deny} openTs={openTs}/>
      <div>
        <div className="row" style={{marginBottom:10}}><span className="eyebrow">{perms.attendance?`Operational overview · ${user.site}`:'Your overview'}</span></div>
        <Overview {...props}/>
      </div>
      <div className="grid dash-bot">
        {perms.attendance ? <AttendancePanel staff={staff} openAttendance={openAttendance}/> : <MyAssignedPanel user={user} assigned={assigned} go={go} startAssigned={startAssigned}/>}
        <ActivityFeed user={user} perms={perms} activity={activity} go={go} openAttendance={openAttendance}/>
      </div>
    </div>
  );
}

function clockWorkedSec(c, now) {
  if (c.inAt==null) return 0;
  const end = c.status==='out' ? (c.outAt ?? c.inAt) : now;
  return Math.max(0, Math.floor(end - c.inAt - clockBreakSec(c, now)));
}
function clockBreakSec(c, now) { return Math.floor((c.breakSec||0) + (c.status==='break' ? now - c.breakStart : 0)); }

Object.assign(window,{DashboardScreen,clockWorkedSec,clockBreakSec});
