// ---------- Icons (simple line set) ----------
const ICON_PATHS = {
  home:'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  clipboard:'M9 4h6v3H9zM9 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3M9 12h6M9 16h4',
  history:'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
  cloud:'M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z',
  bell:'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4',
  clock:'M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z',
  play:'M7 4v16l13-8z', stop:'M6 6h12v12H6z', coffee:'M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3',
  calendar:'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  users:'M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  userx:'M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 8l5 5M22 8l-5 5',
  check:'M5 12.5l4.5 4.5L19 7.5', x:'M6 6l12 12M18 6 6 18', plus:'M12 5v14M5 12h14', minus:'M5 12h14',
  alert:'M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  lock:'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  shield:'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z', wrench:'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  truck:'M2 6h12v10H2zM14 10h4l3 3v3h-7M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  badge:'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14 7 22l5-3 5 3-1.5-8',
  building:'M4 21V5l8-3v19M12 8h8v13M8 9h.01M8 13h.01M8 17h.01M16 12h.01M16 16h.01M2 21h20',
  camera:'M3 8h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',
  chevR:'M9 6l6 6-6 6', chevL:'M15 6l-6 6 6 6', chevD:'M6 9l6 6 6-6',
  logout:'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3',
  refresh:'M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4',
  file:'M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6', folder:'M3 6h6l2 2h10v11H3z',
  sheet:'M4 3h16v18H4zM4 9h16M4 15h16M10 3v18',
  key:'M15 7a4 4 0 1 1-3.5 6L4 20.5V17h3v-3h3l1.5-1.5A4 4 0 0 1 15 7zM16 8h.01',
  settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  send:'M22 2 11 13M22 2l-7 20-4-9-9-4z', trash:'M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3',
  info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  arrowR:'M5 12h14M13 6l6 6-6 6', pin:'M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  link:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
};
function Icon({ n, size, className='' }) {
  return <svg className={`i ${size||''} ${className}`} viewBox="0 0 24 24"><path d={ICON_PATHS[n]||''}/></svg>;
}

function Avatar({ p, size='' }) {
  if (p && p.photo) return <img className={`av ${size}`} src={p.photo} alt="" />;
  const ini = p?.initials || (p?.name||'?').split(' ').map(s=>s[0]).join('').slice(0,2);
  return <div className={`av ${size}`}>{ini}</div>;
}

const STATUS_LABEL = { passed:'Passed', failed:'Failed', attention:'Needs attention', scheduled:'Scheduled', in:'Clocked in', out:'Clocked out', break:'On break', late:'Late', absent:'Absent', pending:'Pending', approved:'Approved', review:'In review' };
function Status({ s, label }) {
  return <span className={`status ${s}`}><span className={`dot ${({passed:'',in:'',approved:'',failed:'red',absent:'red',attention:'amber',late:'amber',break:'amber',review:'blue'})[s] ?? 'gray'}`}/>{label||STATUS_LABEL[s]||s}</span>;
}
function RoleTag({ role }) { return <span className={`role ${role}`}>{({admin:'Administrator',manager:'Manager',employee:'Employee'})[role]}</span>; }

function Modal({ title, onClose, children, footer, wide, icon }) {
  React.useEffect(()=>{ const k=e=>e.key==='Escape'&&onClose(); window.addEventListener('keydown',k); return ()=>window.removeEventListener('keydown',k); },[onClose]);
  return (
    <div className="scrim" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`modal ${wide?'wide':''}`} role="dialog">
        {title!==null && <div className="modal-h">{icon}<h3>{title}</h3><button className="icon-btn" style={{width:36,height:36}} onClick={onClose} aria-label="Close"><Icon n="x" size="sm"/></button></div>}
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  );
}

function catOf(id){ return WH_CATEGORIES.find(c=>c.id===id) || WH_CATEGORIES[0]; }
function fmtHM(mins){ mins=Math.max(0,Math.floor(mins)); const h=Math.floor(mins/60), m=mins%60; return `${h}h ${String(m).padStart(2,'0')}m`; }
function fmtClock(mins){ mins=Math.max(0,Math.floor(mins)); return `${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`; }
function nowLabel(m){ return fmtClock(m); }

Object.assign(window,{Icon,Avatar,Status,RoleTag,Modal,STATUS_LABEL,catOf,fmtHM,fmtClock,nowLabel});
