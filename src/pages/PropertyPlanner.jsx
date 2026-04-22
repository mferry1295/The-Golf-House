import { useState, useRef, useCallback, useEffect } from 'react'
import './PropertyPlanner.css'

const GRID_SIZE = 10
const SCALE = 3

// ── Organic shape paths (0-100 viewBox) ──
const GREEN_SHAPES = [
  'M 15,45 C 5,30 10,10 30,8 C 50,5 55,15 65,12 C 80,8 95,20 92,40 C 90,55 80,65 70,70 C 55,78 50,72 40,75 C 25,80 18,65 15,45 Z',
  'M 10,50 C 8,30 15,12 35,10 C 50,8 60,18 75,15 C 88,12 95,25 93,42 C 92,55 85,62 78,68 C 68,76 55,80 45,78 C 30,75 20,82 12,70 C 6,62 10,55 10,50 Z',
  'M 12,40 C 8,22 20,8 40,10 C 55,12 58,20 70,15 C 85,10 95,22 93,38 C 92,48 88,58 80,65 C 70,73 62,68 50,72 C 38,76 25,72 18,62 C 10,52 12,46 12,40 Z',
  'M 18,35 C 10,20 18,8 35,10 C 48,12 50,22 55,25 C 62,28 70,15 82,18 C 92,20 96,35 90,48 C 85,58 75,62 65,60 C 55,58 52,50 48,52 C 42,55 38,68 25,65 C 14,62 12,48 18,35 Z',
]
const BUNKER_SHAPES = [
  'M 20,50 C 10,25 25,8 50,10 C 75,12 90,30 85,55 C 80,75 60,90 40,85 C 20,80 15,65 20,50 Z',
  'M 15,40 C 10,20 30,5 55,12 C 78,18 92,35 88,55 C 82,78 55,92 35,82 C 15,72 12,55 15,40 Z',
]
const CHIPPING_SHAPES = [
  'M 12,45 C 8,25 20,8 42,10 C 60,12 78,18 88,35 C 95,48 88,68 70,75 C 52,82 30,78 18,65 C 8,55 12,50 12,45 Z',
  'M 18,40 C 12,20 28,5 50,10 C 70,14 88,28 85,50 C 82,68 65,82 45,80 C 25,78 15,60 18,40 Z',
]

// ── Element catalog ──
const ELEMENT_CATALOG = {
  structures: {
    label: 'Structures',
    items: [
      { type: 'main-clubhouse', name: 'Main Clubhouse', w: 65, h: 42, color: '#8B6F4E', shape: 'clubhouse' },
      { type: 'guest-cabin', name: 'Guest Cabin', w: 28, h: 18, color: '#8B6F4E', shape: 'cabin' },
      { type: 'wellness-center', name: 'Wellness Center', w: 40, h: 30, color: '#6B7F6A', shape: 'building' },
      { type: 'bar-restaurant', name: 'Bar & Restaurant', w: 38, h: 26, color: '#8B6F4E', shape: 'building' },
      { type: 'locker-room', name: 'Locker Room', w: 30, h: 20, color: '#6B7F6A', shape: 'building' },
      { type: 'pro-shop', name: 'Pro Shop', w: 22, h: 16, color: '#8B6F4E', shape: 'cabin' },
    ]
  },
  golf: {
    label: 'Golf Features',
    items: [
      { type: 'putting-green', name: 'Putting Green', w: 50, h: 40, color: '#3d6b35', shape: 'green', accent: '#4a8040' },
      { type: 'chipping-area', name: 'Chipping Area', w: 35, h: 28, color: '#4a7a3e', shape: 'chipping', accent: '#5a8a4e' },
      { type: 'sand-bunker', name: 'Sand Bunker', w: 18, h: 14, color: '#C4A97D', shape: 'bunker', accent: '#d4bc92' },
      { type: 'tee-box', name: 'Tee Box', w: 12, h: 8, color: '#3a6830', shape: 'teebox' },
      { type: 'fairway-strip', name: 'Fairway Strip', w: 60, h: 18, color: '#4a7a3e', shape: 'fairway' },
      { type: 'flag-pin', name: 'Flag / Pin', w: 3, h: 3, color: '#cc3333', shape: 'flag' },
    ]
  },
  paths: {
    label: 'Paths & Walkways',
    items: [
      { type: 'stone-path', name: 'Stone Walkway', w: 0, h: 0, color: '#a09888', shape: 'path', strokeWidth: 6, style: 'solid' },
      { type: 'gravel-path', name: 'Gravel Path', w: 0, h: 0, color: '#b8ad9c', shape: 'path', strokeWidth: 8, style: 'dashed' },
      { type: 'cart-path', name: 'Golf Cart Path', w: 0, h: 0, color: '#8a8880', shape: 'path', strokeWidth: 10, style: 'solid' },
      { type: 'brick-walk', name: 'Brick Walkway', w: 0, h: 0, color: '#9a6b5a', shape: 'path', strokeWidth: 5, style: 'solid' },
      { type: 'fence-line', name: 'Fence Line', w: 0, h: 0, color: '#8B6F4E', shape: 'path', strokeWidth: 2, style: 'dashed' },
    ]
  },
  amenities: {
    label: 'Amenities',
    items: [
      { type: 'pool', name: 'Pool', w: 30, h: 15, color: '#4a8a9a', shape: 'pool' },
      { type: 'fire-pit', name: 'Fire Pit', w: 8, h: 8, color: '#c47a3d', shape: 'circle' },
      { type: 'sauna', name: 'Sauna', w: 12, h: 10, color: '#8B6F4E', shape: 'building' },
      { type: 'cold-plunge', name: 'Cold Plunge', w: 8, h: 8, color: '#4a7a8a', shape: 'circle' },
      { type: 'hot-tub', name: 'Hot Tub', w: 10, h: 10, color: '#5a8a9a', shape: 'circle' },
      { type: 'outdoor-dining', name: 'Outdoor Dining', w: 20, h: 15, color: '#8B6F4E', shape: 'building' },
    ]
  },
  landscaping: {
    label: 'Landscaping',
    items: [
      { type: 'pine-tree', name: 'Longleaf Pine', w: 8, h: 8, color: '#2B3529', shape: 'tree' },
      { type: 'oak-tree', name: 'Live Oak', w: 12, h: 12, color: '#3a5a30', shape: 'tree' },
      { type: 'garden-bed', name: 'Garden Bed', w: 20, h: 6, color: '#6B7F6A', shape: 'garden' },
      { type: 'hedge-row', name: 'Hedge Row', w: 25, h: 3, color: '#3a5535', shape: 'garden' },
    ]
  },
  other: {
    label: 'Other',
    items: [
      { type: 'parking', name: 'Parking Area', w: 40, h: 30, color: '#7a7a7a', shape: 'rect' },
      { type: 'entrance', name: 'Entrance Gate', w: 12, h: 4, color: '#8B6F4E', shape: 'rect' },
      { type: 'driveway', name: 'Driveway', w: 40, h: 10, color: '#6a6a62', shape: 'rect' },
      { type: 'veranda', name: 'Covered Veranda', w: 30, h: 8, color: '#7a6a52', shape: 'rect' },
    ]
  }
}

let nextId = 1
function snapToGrid(v) { return Math.round(v / GRID_SIZE) * GRID_SIZE }
function randShape(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// ══════════════════════════════════════════════
//  SVG SHAPE COMPONENTS
// ══════════════════════════════════════════════

function ClubhouseShape({ el, pw, ph }) {
  return (
    <svg viewBox="0 0 200 130" width={pw} height={ph} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`roof-${el.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5a5a5a" />
          <stop offset="100%" stopColor="#4a4a4a" />
        </linearGradient>
        <linearGradient id={`wall-${el.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c4a878" />
          <stop offset="100%" stopColor="#a08858" />
        </linearGradient>
      </defs>
      {/* Foundation shadow */}
      <rect x="8" y="10" width="184" height="115" rx="2" fill="rgba(0,0,0,0.15)" />
      {/* Main roof - hip roof shape */}
      <polygon points="5,35 100,3 195,35 195,95 5,95" fill={`url(#roof-${el.id})`} stroke="#3a3a3a" strokeWidth="1" />
      {/* Roof ridge line */}
      <line x1="40" y1="18" x2="160" y2="18" stroke="#666" strokeWidth="1.5" />
      {/* Dormers */}
      {[55, 85, 115, 145].map((x, i) => (
        <g key={i}>
          <polygon points={`${x-8},35 ${x},22 ${x+8},35`} fill="#5a5a5a" stroke="#4a4a4a" strokeWidth="0.5" />
          <rect x={x-4} y={25} width="8" height="10" rx="1" fill="#e8d8b8" stroke="#8a7a5a" strokeWidth="0.5" />
          <line x1={x} y1={25} x2={x} y2={35} stroke="#8a7a5a" strokeWidth="0.3" />
        </g>
      ))}
      {/* Chimneys */}
      <rect x="35" y="8" width="8" height="16" fill="#8a6a4a" stroke="#6a4a2a" strokeWidth="0.5" />
      <rect x="157" y="8" width="8" height="16" fill="#8a6a4a" stroke="#6a4a2a" strokeWidth="0.5" />
      {/* Porch / Veranda - front */}
      <rect x="10" y="70" width="180" height="25" fill={`url(#wall-${el.id})`} stroke="#8a7a5a" strokeWidth="0.8" rx="1" />
      {/* Porch columns */}
      {[25, 50, 75, 100, 125, 150, 175].map((x, i) => (
        <g key={i}>
          <rect x={x-2} y={70} width="4" height="25" fill="#e8dcc8" stroke="#b0a080" strokeWidth="0.5" />
          <rect x={x-3} y={69} width="6" height="3" fill="#d8c8a8" rx="0.5" />
          <rect x={x-3} y={93} width="6" height="3" fill="#d8c8a8" rx="0.5" />
        </g>
      ))}
      {/* Windows in wall behind porch */}
      {[35, 65, 100, 135, 165].map((x, i) => (
        <rect key={i} x={x-5} y={75} width="10" height="14" rx="1" fill="#f0e8d0" stroke="#a09070" strokeWidth="0.5" opacity="0.8" />
      ))}
      {/* Front door */}
      <rect x="95" y={73} width="12" height="20" rx="1" fill="#6a4a30" stroke="#4a3020" strokeWidth="0.7" />
      <path d="M 95,73 Q 101,68 107,73" fill="#8a7a5a" stroke="#6a5a3a" strokeWidth="0.5" />
      {/* Steps */}
      <rect x="92" y="96" width="18" height="4" fill="#c0b8a0" stroke="#a0988a" strokeWidth="0.3" rx="0.5" />
      <rect x="89" y="100" width="24" height="4" fill="#b0a890" stroke="#a0988a" strokeWidth="0.3" rx="0.5" />
      {/* Wing roofs */}
      <polygon points="5,35 5,95 0,65" fill="#4a4a4a" opacity="0.6" />
      <polygon points="195,35 195,95 200,65" fill="#4a4a4a" opacity="0.6" />
      {/* Railing */}
      <line x1="10" y1="96" x2="92" y2="96" stroke="#d8c8a8" strokeWidth="1" />
      <line x1="110" y1="96" x2="190" y2="96" stroke="#d8c8a8" strokeWidth="1" />
      {/* Landscaping bushes at base */}
      {[20, 40, 60, 140, 160, 180].map((x, i) => (
        <ellipse key={i} cx={x} cy={106} rx="8" ry="4" fill="#4a7a3a" opacity="0.5" />
      ))}
      {/* Ground lights */}
      {[30, 80, 120, 170].map((x, i) => (
        <circle key={i} cx={x} cy={108} r="1.5" fill="#f0e0a0" opacity="0.6" />
      ))}
    </svg>
  )
}

function CabinShape({ el, pw, ph }) {
  return (
    <svg viewBox="0 0 140 90" width={pw} height={ph} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`cr-${el.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5a5a58" />
          <stop offset="100%" stopColor="#484848" />
        </linearGradient>
        <linearGradient id={`cw-${el.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c4a878" />
          <stop offset="100%" stopColor="#a08858" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <rect x="6" y="8" width="130" height="78" rx="2" fill="rgba(0,0,0,0.12)" />
      {/* Main roof */}
      <polygon points="3,28 70,5 137,28 137,65 3,65" fill={`url(#cr-${el.id})`} stroke="#3a3a3a" strokeWidth="0.8" />
      {/* Ridge */}
      <line x1="30" y1="14" x2="110" y2="14" stroke="#5a5a5a" strokeWidth="1" />
      {/* Dormers */}
      {[45, 70, 95].map((x, i) => (
        <g key={i}>
          <polygon points={`${x-6},28 ${x},18 ${x+6},28`} fill="#505050" stroke="#444" strokeWidth="0.4" />
          <rect x={x-3} y={20} width="6" height="8" rx="0.5" fill="#e8d8b8" stroke="#8a7a5a" strokeWidth="0.4" />
        </g>
      ))}
      {/* Chimney */}
      <rect x="105" y="6" width="7" height="14" fill="#8a6a4a" stroke="#6a4a2a" strokeWidth="0.5" />
      {/* Deep porch */}
      <rect x="8" y="50" width="124" height="18" fill={`url(#cw-${el.id})`} stroke="#8a7a5a" strokeWidth="0.6" rx="1" />
      {/* Porch columns */}
      {[20, 45, 70, 95, 120].map((x, i) => (
        <g key={i}>
          <rect x={x-1.5} y={50} width="3" height="18" fill="#e8dcc8" stroke="#b0a080" strokeWidth="0.4" />
          <rect x={x-2.5} y={49} width="5" height="2.5" fill="#d8c8a8" rx="0.3" />
        </g>
      ))}
      {/* Windows */}
      {[30, 55, 85, 110].map((x, i) => (
        <rect key={i} x={x-4} y={54} width="8" height="10" rx="0.5" fill="#f0e8d0" stroke="#a09070" strokeWidth="0.4" opacity="0.8" />
      ))}
      {/* Door */}
      <rect x="66" y="52" width="9" height="15" rx="0.5" fill="#6a4a30" stroke="#4a3020" strokeWidth="0.5" />
      {/* Steps */}
      <rect x="63" y="69" width="15" height="3" fill="#c0b8a0" rx="0.3" />
      <rect x="61" y="72" width="19" height="3" fill="#b0a890" rx="0.3" />
      {/* Railing */}
      <line x1="8" y1="68" x2="63" y2="68" stroke="#d8c8a8" strokeWidth="0.7" />
      <line x1="78" y1="68" x2="132" y2="68" stroke="#d8c8a8" strokeWidth="0.7" />
      {/* Bushes */}
      {[18, 38, 102, 122].map((x, i) => (
        <ellipse key={i} cx={x} cy={78} rx="7" ry="3.5" fill="#4a7a3a" opacity="0.45" />
      ))}
    </svg>
  )
}

function BuildingShape({ el, pw, ph }) {
  return (
    <svg viewBox="0 0 140 100" width={pw} height={ph} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`br-${el.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={el.color} />
          <stop offset="100%" stopColor="#555" />
        </linearGradient>
      </defs>
      <rect x="5" y="7" width="132" height="88" rx="2" fill="rgba(0,0,0,0.1)" />
      {/* Roof */}
      <polygon points="3,25 70,5 137,25 137,72 3,72" fill={`url(#br-${el.id})`} stroke="#444" strokeWidth="0.8" />
      <line x1="25" y1="12" x2="115" y2="12" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Wall */}
      <rect x="8" y="55" width="124" height="20" fill="#b8a078" stroke="#8a7a5a" strokeWidth="0.6" rx="1" />
      {/* Windows */}
      {[25, 50, 70, 90, 115].map((x, i) => (
        <rect key={i} x={x-4} y={58} width="8" height="12" rx="0.5" fill="#f0e8d0" stroke="#a09070" strokeWidth="0.4" opacity="0.7" />
      ))}
      {/* Door */}
      <rect x="66" y="57" width="9" height="17" rx="0.5" fill="#6a4a30" stroke="#4a3020" strokeWidth="0.5" />
      {/* Steps */}
      <rect x="63" y="76" width="15" height="3" fill="#c0b8a0" rx="0.3" />
      {/* Bushes */}
      {[20, 45, 95, 120].map((x, i) => (
        <ellipse key={i} cx={x} cy={82} rx="8" ry="3.5" fill="#4a7a3a" opacity="0.4" />
      ))}
    </svg>
  )
}

function OrganicShape({ el, pw, ph }) {
  let path = el.svgPath || GREEN_SHAPES[0]
  let fillColor = el.color, strokeColor = el.accent || '#5a9a4a', extra = null

  if (el.shape === 'green') {
    extra = (
      <>
        <line x1="20" y1="25" x2="80" y2="25" stroke="rgba(90,160,70,0.2)" strokeWidth="1.5" />
        <line x1="20" y1="45" x2="80" y2="45" stroke="rgba(90,160,70,0.2)" strokeWidth="1.5" />
        <line x1="20" y1="65" x2="80" y2="65" stroke="rgba(90,160,70,0.2)" strokeWidth="1.5" />
        <circle cx="55" cy="40" r="2" fill="#222" stroke="#fff" strokeWidth="0.5" />
        <line x1="55" y1="40" x2="55" y2="28" stroke="#fff" strokeWidth="0.8" />
        <polygon points="55,28 65,32 55,36" fill="#cc3333" opacity="0.9" />
        <path d={path} fill="none" stroke="#5a9050" strokeWidth="3" opacity="0.4" />
      </>
    )
  } else if (el.shape === 'bunker') {
    strokeColor = '#b09a70'
    extra = (
      <>
        <line x1="30" y1="30" x2="70" y2="35" stroke="rgba(180,160,120,0.3)" strokeWidth="1" />
        <line x1="25" y1="50" x2="75" y2="48" stroke="rgba(180,160,120,0.3)" strokeWidth="1" />
        <line x1="35" y1="65" x2="65" y2="62" stroke="rgba(180,160,120,0.3)" strokeWidth="1" />
        <path d={path} fill="none" stroke="#a09060" strokeWidth="2" opacity="0.5" />
      </>
    )
  } else if (el.shape === 'chipping') {
    extra = (
      <>
        <path d={path} fill="none" stroke="#6a9a5a" strokeWidth="2.5" opacity="0.3" />
        <circle cx="50" cy="45" r="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
        <circle cx="50" cy="45" r="4" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
        <circle cx="50" cy="45" r="1.5" fill="rgba(255,255,255,0.3)" />
      </>
    )
  }

  return (
    <svg viewBox="0 0 100 100" width={pw} height={ph} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} preserveAspectRatio="none">
      <defs><filter id={`sh-${el.id}`}><feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.25" /></filter></defs>
      <path d={path} fill={fillColor} stroke={strokeColor} strokeWidth="1.5" filter={`url(#sh-${el.id})`} />
      {extra}
    </svg>
  )
}

function PoolShape({ el, pw, ph }) {
  return (
    <svg viewBox="0 0 100 50" width={pw} height={ph} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`pg-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5aa0b8" /><stop offset="100%" stopColor="#3a7a90" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="94" height="44" rx="8" fill={`url(#pg-${el.id})`} stroke="#3a6a7a" strokeWidth="2" />
      <path d="M 15,18 Q 30,14 45,18 Q 60,22 75,18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <path d="M 20,28 Q 35,24 50,28 Q 65,32 80,28" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <rect x="3" y="3" width="94" height="44" rx="8" fill="none" stroke="#b0c8d0" strokeWidth="3" opacity="0.3" />
    </svg>
  )
}

function TreeShape({ el, pw, ph }) {
  const isOak = el.type === 'oak-tree'
  return (
    <svg viewBox="0 0 100 100" width={pw} height={ph} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} preserveAspectRatio="xMidYMid meet">
      <defs><radialGradient id={`tg-${el.id}`}><stop offset="20%" stopColor={isOak ? '#4a7a38' : '#3a5a2a'} /><stop offset="100%" stopColor={el.color} /></radialGradient></defs>
      <ellipse cx="55" cy="75" rx="30" ry="10" fill="rgba(0,0,0,0.15)" />
      {isOak ? (
        <><circle cx="50" cy="42" r="32" fill={`url(#tg-${el.id})`} /><circle cx="35" cy="50" r="18" fill={`url(#tg-${el.id})`} /><circle cx="65" cy="48" r="20" fill={`url(#tg-${el.id})`} /></>
      ) : (
        <><circle cx="50" cy="40" r="28" fill={`url(#tg-${el.id})`} /><circle cx="40" cy="48" r="15" fill={`url(#tg-${el.id})`} /><circle cx="60" cy="45" r="16" fill={`url(#tg-${el.id})`} /></>
      )}
      <rect x="46" y="60" width="8" height="12" rx="2" fill="#5a4a30" opacity="0.5" />
    </svg>
  )
}

function GardenShape({ el, pw, ph }) {
  return (
    <svg viewBox="0 0 100 30" width={pw} height={ph} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} preserveAspectRatio="none">
      <path d="M 5,15 Q 15,3 30,8 Q 45,2 55,8 Q 70,3 85,8 Q 98,12 95,18 Q 88,28 70,25 Q 50,28 30,25 Q 12,28 5,20 Z" fill={el.color} stroke="#5a7a52" strokeWidth="1" />
      <circle cx="25" cy="14" r="3" fill="#7aaa5a" opacity="0.6" />
      <circle cx="45" cy="12" r="2.5" fill="#8aba6a" opacity="0.5" />
      <circle cx="65" cy="13" r="3" fill="#6a9a4a" opacity="0.6" />
      <circle cx="80" cy="15" r="2" fill="#7aaa5a" opacity="0.5" />
    </svg>
  )
}

function TeeboxShape({ el, pw, ph }) {
  return (
    <svg viewBox="0 0 100 70" width={pw} height={ph} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} preserveAspectRatio="none">
      <rect x="5" y="5" width="90" height="60" rx="4" fill={el.color} stroke="#4a8038" strokeWidth="1.5" />
      <circle cx="25" cy="35" r="3" fill="#fff" opacity="0.7" /><circle cx="75" cy="35" r="3" fill="#cc3333" opacity="0.7" />
      <line x1="10" y1="35" x2="90" y2="35" stroke="rgba(70,140,50,0.2)" strokeWidth="1.5" />
    </svg>
  )
}

function FairwayShape({ el, pw, ph }) {
  return (
    <svg viewBox="0 0 200 60" width={pw} height={ph} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} preserveAspectRatio="none">
      <path d="M 5,30 Q 20,5 50,12 Q 80,18 110,8 Q 140,2 170,15 Q 198,25 195,35 Q 192,48 160,50 Q 130,55 100,48 Q 70,42 40,50 Q 15,55 5,40 Z" fill={el.color} stroke="#5a8a48" strokeWidth="1" />
      <path d="M 20,20 Q 60,15 100,20 Q 140,25 180,22" fill="none" stroke="rgba(80,150,60,0.15)" strokeWidth="4" />
      <path d="M 15,35 Q 55,30 100,35 Q 145,40 185,35" fill="none" stroke="rgba(80,150,60,0.15)" strokeWidth="4" />
    </svg>
  )
}

function FlagShape({ el, pw, ph }) {
  return (
    <svg viewBox="0 0 30 30" width={pw} height={ph} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} preserveAspectRatio="xMidYMid meet">
      <circle cx="15" cy="22" r="4" fill="#333" opacity="0.3" />
      <line x1="15" y1="25" x2="15" y2="5" stroke="#fff" strokeWidth="1.5" />
      <polygon points="15,5 25,9 15,13" fill={el.color} />
    </svg>
  )
}

// Map shape type to component
function ShapeRenderer({ el, pw, ph }) {
  const m = {
    clubhouse: ClubhouseShape,
    cabin: CabinShape,
    building: BuildingShape,
    green: OrganicShape, bunker: OrganicShape, chipping: OrganicShape,
    pool: PoolShape,
    tree: TreeShape,
    garden: GardenShape,
    teebox: TeeboxShape,
    fairway: FairwayShape,
    flag: FlagShape,
  }
  const Comp = m[el.shape]
  return Comp ? <Comp el={el} pw={pw} ph={ph} /> : null
}

// ══════════════════════════════════════════════
//  ISOMETRIC 3D RENDERER
// ══════════════════════════════════════════════

// Convert 2D top-down coords to isometric projection
function toIso(x, y, z = 0) {
  const angle = Math.PI / 6 // 30 degrees
  return {
    x: (x - y) * Math.cos(angle),
    y: (x + y) * Math.sin(angle) - z,
  }
}

// Get element height for 3D extrusion
function getElementHeight(el) {
  if (el.shape === 'clubhouse') return 55
  if (el.shape === 'cabin') return 40
  if (el.shape === 'building') return 35
  if (el.shape === 'tree') return el.type === 'oak-tree' ? 50 : 45
  if (el.shape === 'pool') return -5 // sunken
  if (['green', 'chipping', 'teebox', 'fairway', 'bunker'].includes(el.shape)) return 1
  if (el.shape === 'garden') return 4
  if (el.shape === 'flag') return 25
  if (el.shape === 'circle') return el.type === 'fire-pit' ? 3 : 5
  return 15 // rect default
}

function Isometric3DView({ elements, zoom, pan, showGrid, selectedId }) {
  const svgW = 2400, svgH = 1600

  // Sort elements by depth (back to front) for painter's algorithm
  const sorted = [...elements].filter(e => e.shape !== 'path')
    .sort((a, b) => (a.x + a.y) - (b.x + b.y))

  const pathEls = elements.filter(e => e.shape === 'path')

  // Render a ground tile
  function renderGround() {
    const corners = [
      toIso(0, 0), toIso(1000, 0), toIso(1000, 800), toIso(0, 800)
    ]
    return (
      <polygon
        points={corners.map(c => `${c.x + 600},${c.y + 400}`).join(' ')}
        fill="#3a5a32"
        stroke="rgba(74,103,65,0.3)"
        strokeWidth="1"
      />
    )
  }

  // Render isometric grid
  function renderGrid() {
    if (!showGrid) return null
    const lines = []
    const step = 30
    for (let i = 0; i <= 1000; i += step) {
      const a = toIso(i, 0), b = toIso(i, 800)
      lines.push(<line key={`gx${i}`} x1={a.x + 600} y1={a.y + 400} x2={b.x + 600} y2={b.y + 400} stroke="rgba(74,103,65,0.15)" strokeWidth="0.5" />)
      if (i <= 800) {
        const c = toIso(0, i), d = toIso(1000, i)
        lines.push(<line key={`gy${i}`} x1={c.x + 600} y1={c.y + 400} x2={d.x + 600} y2={d.y + 400} stroke="rgba(74,103,65,0.15)" strokeWidth="0.5" />)
      }
    }
    return lines
  }

  // Render a building (box with roof)
  function renderBuilding(el, ox, oy) {
    const pw = el.w * SCALE, ph = el.h * SCALE
    const h = getElementHeight(el)
    const isSel = el.id === selectedId
    const roofH = h + 15
    const x0 = el.x + ox, y0 = el.y + oy

    // Wall corners - base (ground)
    const gBL = toIso(x0, y0 + ph)
    const gBR = toIso(x0 + pw, y0 + ph)
    const gTR = toIso(x0 + pw, y0)
    const gTL = toIso(x0, y0)

    // Wall corners - top (eave line)
    const eBL = toIso(x0, y0 + ph, h)
    const eBR = toIso(x0 + pw, y0 + ph, h)
    const eTR = toIso(x0 + pw, y0, h)
    const eTL = toIso(x0, y0, h)

    // Hip roof: ridge runs along the LONG axis (X), inset from short ends
    const ridgeInset = Math.min(ph / 2, pw * 0.2) // inset from each end
    const midY = y0 + ph / 2 // ridge Y = center of depth
    const rL = toIso(x0 + ridgeInset, midY, roofH)        // left ridge point
    const rR = toIso(x0 + pw - ridgeInset, midY, roofH)   // right ridge point

    const wallColor = el.shape === 'clubhouse' ? '#c4a878' : el.shape === 'cabin' ? '#b89868' : '#a89070'
    const wallDark = el.shape === 'clubhouse' ? '#a08858' : el.shape === 'cabin' ? '#8a7048' : '#887058'
    const roofLight = '#6a6a66'
    const roofDark = '#505050'
    const roofFront = '#5a5a56'
    const roofBack = '#585855'

    // Porch (extends from front/bottom wall)
    const hasPorch = el.shape === 'clubhouse' || el.shape === 'cabin'
    const porchDepth = 8
    const porchH = h * 0.6

    return (
      <g key={el.id} opacity={isSel ? 1 : 0.95}>
        {/* Ground shadow */}
        <polygon
          points={`${gBL.x + 6},${gBL.y + 4} ${gBR.x + 6},${gBR.y + 4} ${gTR.x + 6},${gTR.y + 4} ${gTL.x + 6},${gTL.y + 4}`}
          fill="rgba(0,0,0,0.1)"
        />

        {/* Back wall (right side in iso, y=y0) - only visible top part above roof sometimes, usually hidden */}

        {/* Right wall (x=x0+pw side) */}
        <polygon
          points={`${gBR.x},${gBR.y} ${gTR.x},${gTR.y} ${eTR.x},${eTR.y} ${eBR.x},${eBR.y}`}
          fill={wallDark} stroke="#5a4a30" strokeWidth="0.5"
        />

        {/* Front wall (y=y0+ph side, bottom in iso) */}
        <polygon
          points={`${gBL.x},${gBL.y} ${gBR.x},${gBR.y} ${eBR.x},${eBR.y} ${eBL.x},${eBL.y}`}
          fill={wallColor} stroke="#5a4a30" strokeWidth="0.5"
        />

        {/* Windows on front wall */}
        {(() => {
          const wins = []
          const count = Math.max(2, Math.floor(pw / 22))
          for (let i = 0; i < count; i++) {
            const wx = x0 + (pw / (count + 1)) * (i + 1)
            const wy = y0 + ph
            const wBot = toIso(wx, wy, h * 0.15)
            const wTop = toIso(wx, wy, h * 0.55)
            wins.push(
              <rect key={i} x={wBot.x - 3} y={wTop.y} width="6" height={Math.max(2, wBot.y - wTop.y)} fill="#f0e8c8" opacity="0.65" rx="0.5" />
            )
          }
          return wins
        })()}

        {/* Door on front wall */}
        {(() => {
          const dx = x0 + pw / 2, dy = y0 + ph
          const dBot = toIso(dx, dy, 0)
          const dTop = toIso(dx, dy, h * 0.6)
          return <rect x={dBot.x - 4} y={dTop.y} width="8" height={Math.max(2, dBot.y - dTop.y)} fill="#5a3a20" stroke="#4a2a10" strokeWidth="0.5" rx="0.5" />
        })()}

        {/* Porch */}
        {hasPorch && (() => {
          const py = y0 + ph + porchDepth
          const pBL = toIso(x0, py)
          const pBR = toIso(x0 + pw, py)
          const pTL = toIso(x0, py, porchH)
          const pTR = toIso(x0 + pw, py, porchH)
          // Porch floor shadow
          const cols = []
          const colCount = el.shape === 'clubhouse' ? 6 : 3
          for (let i = 0; i < colCount; i++) {
            const cx = x0 + (pw / (colCount + 1)) * (i + 1)
            const cBase = toIso(cx, py)
            const cTop = toIso(cx, py, porchH)
            cols.push(<line key={i} x1={cBase.x} y1={cBase.y} x2={cTop.x} y2={cTop.y} stroke="#e0d0b8" strokeWidth="1.5" />)
          }
          return (
            <g>
              {/* Porch floor */}
              <polygon points={`${gBL.x},${gBL.y} ${gBR.x},${gBR.y} ${pBR.x},${pBR.y} ${pBL.x},${pBL.y}`} fill="rgba(180,160,130,0.3)" stroke="rgba(100,80,60,0.2)" strokeWidth="0.5" />
              {/* Columns */}
              {cols}
              {/* Porch roof overhang */}
              <polygon points={`${eBL.x},${eBL.y} ${eBR.x},${eBR.y} ${pTR.x},${pTR.y} ${pTL.x},${pTL.y}`} fill="rgba(80,80,75,0.35)" stroke="rgba(60,60,55,0.3)" strokeWidth="0.5" />
              {/* Railing */}
              <line x1={pBL.x} y1={pBL.y} x2={pBR.x} y2={pBR.y} stroke="#d8c8a8" strokeWidth="1" />
            </g>
          )
        })()}

        {/* ── HIP ROOF ── */}
        {/* Front slope (facing viewer, y=y0+ph side) */}
        <polygon
          points={`${eBL.x},${eBL.y} ${eBR.x},${eBR.y} ${rR.x},${rR.y} ${rL.x},${rL.y}`}
          fill={roofFront} stroke="#3a3a3a" strokeWidth="0.6"
        />
        {/* Right hip triangle (x=x0+pw end) */}
        <polygon
          points={`${eBR.x},${eBR.y} ${eTR.x},${eTR.y} ${rR.x},${rR.y}`}
          fill={roofDark} stroke="#3a3a3a" strokeWidth="0.6"
        />
        {/* Back slope (away from viewer, y=y0 side) */}
        <polygon
          points={`${eTR.x},${eTR.y} ${eTL.x},${eTL.y} ${rL.x},${rL.y} ${rR.x},${rR.y}`}
          fill={roofLight} stroke="#3a3a3a" strokeWidth="0.6"
        />
        {/* Left hip triangle (x=x0 end) */}
        <polygon
          points={`${eTL.x},${eTL.y} ${eBL.x},${eBL.y} ${rL.x},${rL.y}`}
          fill={roofBack} stroke="#3a3a3a" strokeWidth="0.6"
        />
        {/* Ridge line */}
        <line x1={rL.x} y1={rL.y} x2={rR.x} y2={rR.y} stroke="#777" strokeWidth="1.2" />

        {/* Chimney */}
        {(el.shape === 'clubhouse' || el.shape === 'cabin') && (() => {
          const chX = x0 + pw * 0.25, chW = 6, chD = 5
          const chTop = roofH + 10
          // Front face
          const cf1 = toIso(chX, midY + chD, roofH - 2)
          const cf2 = toIso(chX + chW, midY + chD, roofH - 2)
          const cf3 = toIso(chX + chW, midY + chD, chTop)
          const cf4 = toIso(chX, midY + chD, chTop)
          // Side face
          const cs1 = toIso(chX + chW, midY, roofH - 2)
          const cs2 = toIso(chX + chW, midY, chTop)
          // Top face
          const ct1 = toIso(chX, midY, chTop)
          return (
            <g>
              <polygon points={`${cf1.x},${cf1.y} ${cf2.x},${cf2.y} ${cf3.x},${cf3.y} ${cf4.x},${cf4.y}`} fill="#8a6a4a" stroke="#5a4a2a" strokeWidth="0.4" />
              <polygon points={`${cf2.x},${cf2.y} ${cs1.x},${cs1.y} ${cs2.x},${cs2.y} ${cf3.x},${cf3.y}`} fill="#7a5a3a" stroke="#5a4a2a" strokeWidth="0.4" />
              <polygon points={`${cf4.x},${cf4.y} ${cf3.x},${cf3.y} ${cs2.x},${cs2.y} ${ct1.x},${ct1.y}`} fill="#9a7a5a" stroke="#5a4a2a" strokeWidth="0.4" />
            </g>
          )
        })()}

        {/* Dormers on front slope */}
        {(el.shape === 'clubhouse' || el.shape === 'cabin') && (() => {
          const dCount = el.shape === 'clubhouse' ? 4 : 2
          const dormers = []
          for (let i = 0; i < dCount; i++) {
            const dx = x0 + (pw / (dCount + 1)) * (i + 1)
            const dy = y0 + ph
            const dw = 8, dh = 10
            const dBase = h + 2
            const dPeak = h + 10
            const d1 = toIso(dx - dw/2, dy, dBase)
            const d2 = toIso(dx + dw/2, dy, dBase)
            const d3 = toIso(dx, dy, dPeak)
            dormers.push(
              <g key={i}>
                <polygon points={`${d1.x},${d1.y} ${d2.x},${d2.y} ${d3.x},${d3.y}`} fill="#5a5a58" stroke="#444" strokeWidth="0.4" />
                <rect x={d1.x + 1} y={d3.y + 2} width={Math.max(2, d2.x - d1.x - 2)} height={Math.max(2, d1.y - d3.y - 3)} fill="#e8d8b8" opacity="0.6" rx="0.3" />
              </g>
            )
          }
          return dormers
        })()}

        {/* Selection highlight */}
        {isSel && <polygon points={`${gBL.x},${gBL.y} ${gBR.x},${gBR.y} ${gTR.x},${gTR.y} ${gTL.x},${gTL.y}`} fill="none" stroke="#C4A97D" strokeWidth="2" strokeDasharray="4,3" />}
      </g>
    )
  }

  // Render a tree
  function renderTree(el, ox, oy) {
    const h = getElementHeight(el)
    const r = (el.w * SCALE) / 2
    const cx = el.x + ox + r, cy = el.y + oy + r
    const base = toIso(cx, cy)
    const top = toIso(cx, cy, h)
    const isOak = el.type === 'oak-tree'

    return (
      <g key={el.id}>
        {/* Shadow on ground */}
        <ellipse cx={base.x + 6} cy={base.y + 3} rx={r * 0.7} ry={r * 0.3} fill="rgba(0,0,0,0.15)" />
        {/* Trunk */}
        <line x1={base.x} y1={base.y} x2={top.x} y2={top.y} stroke="#5a4a30" strokeWidth={isOak ? 4 : 3} />
        {/* Canopy */}
        <ellipse cx={top.x} cy={top.y - 4} rx={r * (isOak ? 1.1 : 0.85)} ry={r * (isOak ? 0.7 : 0.55)} fill={isOak ? '#3a6a2a' : '#2a4a20'} />
        <ellipse cx={top.x - 2} cy={top.y - 8} rx={r * 0.7} ry={r * 0.45} fill={isOak ? '#4a7a38' : '#3a5a2a'} />
        <ellipse cx={top.x + 3} cy={top.y - 2} rx={r * 0.5} ry={r * 0.35} fill={isOak ? '#3a7030' : '#2a5022'} opacity="0.8" />
      </g>
    )
  }

  // Render a flat element (green, bunker, pool, etc.)
  function renderFlat(el, ox, oy) {
    const pw = el.w * SCALE, ph = el.h * SCALE
    const h = getElementHeight(el)
    const isSel = el.id === selectedId

    const bl = toIso(el.x + ox, el.y + oy + ph, h)
    const br = toIso(el.x + ox + pw, el.y + oy + ph, h)
    const tr = toIso(el.x + ox + pw, el.y + oy, h)
    const tl = toIso(el.x + ox, el.y + oy, h)

    let fillColor = el.color
    let extra = null

    if (el.shape === 'pool') {
      fillColor = '#4a9aaa'
      extra = (
        <>
          <line x1={(bl.x + tl.x) / 2} y1={(bl.y + tl.y) / 2 + 2} x2={(br.x + tr.x) / 2} y2={(br.y + tr.y) / 2 + 2} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <line x1={(bl.x + tl.x) / 2} y1={(bl.y + tl.y) / 2 - 2} x2={(br.x + tr.x) / 2} y2={(br.y + tr.y) / 2 - 2} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </>
      )
    }

    if (el.shape === 'green') {
      // Flag
      const flagBase = toIso(el.x + ox + pw * 0.55, el.y + oy + ph * 0.4, 1)
      const flagTop = toIso(el.x + ox + pw * 0.55, el.y + oy + ph * 0.4, 20)
      extra = (
        <>
          <line x1={flagBase.x} y1={flagBase.y} x2={flagTop.x} y2={flagTop.y} stroke="#fff" strokeWidth="1" />
          <polygon points={`${flagTop.x},${flagTop.y} ${flagTop.x + 8},${flagTop.y + 3} ${flagTop.x},${flagTop.y + 6}`} fill="#cc3333" />
        </>
      )
    }

    if (el.shape === 'bunker') {
      // Sand texture lines
      const m1 = toIso(el.x + ox + pw * 0.3, el.y + oy + ph * 0.3, h)
      const m2 = toIso(el.x + ox + pw * 0.7, el.y + oy + ph * 0.6, h)
      extra = <line x1={m1.x} y1={m1.y} x2={m2.x} y2={m2.y} stroke="rgba(180,160,120,0.3)" strokeWidth="1" />
    }

    if (el.shape === 'circle') {
      // Fire pit / plunge rendered as circle
      const center = toIso(el.x + ox + pw / 2, el.y + oy + ph / 2, h)
      const r = pw * 0.35
      return (
        <g key={el.id}>
          <ellipse cx={center.x} cy={center.y} rx={r} ry={r * 0.55} fill={el.color} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          {el.type === 'fire-pit' && <ellipse cx={center.x} cy={center.y} rx={r * 0.5} ry={r * 0.28} fill="#e8a030" opacity="0.6" />}
        </g>
      )
    }

    return (
      <g key={el.id}>
        <polygon points={`${bl.x},${bl.y} ${br.x},${br.y} ${tr.x},${tr.y} ${tl.x},${tl.y}`} fill={fillColor} stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" opacity="0.9" />
        {extra}
        {isSel && <polygon points={`${bl.x},${bl.y} ${br.x},${br.y} ${tr.x},${tr.y} ${tl.x},${tl.y}`} fill="none" stroke="#C4A97D" strokeWidth="2" strokeDasharray="4,3" />}
      </g>
    )
  }

  // Render a path in isometric
  function renderIsoPath(el, ox, oy) {
    if (!el.points || el.points.length < 2) return null
    const isoPoints = el.points.map(p => toIso(p.x + ox, p.y + oy, 0.5))
    let d = `M ${isoPoints[0].x} ${isoPoints[0].y}`
    for (let i = 1; i < isoPoints.length; i++) {
      const prev = isoPoints[i - 1], curr = isoPoints[i]
      const next = isoPoints[i + 1] || curr, pp = isoPoints[i - 2] || prev
      d += ` C ${prev.x + (curr.x - pp.x) / 4},${prev.y + (curr.y - pp.y) / 4} ${curr.x - (next.x - prev.x) / 4},${curr.y - (next.y - prev.y) / 4} ${curr.x},${curr.y}`
    }
    const dash = el.pathStyle === 'dashed' ? '8,4' : el.pathStyle === 'dotted' ? '3,3' : 'none'
    return (
      <g key={el.id}>
        <path d={d} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={el.strokeWidth + 1} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={el.color} strokeWidth={el.strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} opacity="0.85" />
      </g>
    )
  }

  const ox = 0, oy = 0

  return (
    <svg width={svgW} height={svgH} style={{ position: 'absolute', top: 0, left: 0 }} viewBox={`0 0 ${svgW} ${svgH}`}>
      <defs>
        <linearGradient id="sky3d" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8d8e8" />
          <stop offset="60%" stopColor="#a0b8c8" />
          <stop offset="100%" stopColor="#7a9a70" />
        </linearGradient>
      </defs>
      {/* Sky background */}
      <rect width={svgW} height={svgH} fill="url(#sky3d)" />

      <g transform={`translate(${pan.x * 0.8} ${pan.y * 0.8}) scale(${zoom / 120})`}>
        {/* Ground plane */}
        {renderGround()}
        {renderGrid()}

        {/* Paths first (on ground) */}
        {pathEls.map(el => renderIsoPath(el, ox, oy))}

        {/* Elements sorted back-to-front */}
        {sorted.map(el => {
          if (el.shape === 'tree') return renderTree(el, ox, oy)
          if (['clubhouse', 'cabin', 'building'].includes(el.shape)) return renderBuilding(el, ox, oy)
          if (el.shape === 'rect') return renderBuilding(el, ox, oy)
          return renderFlat(el, ox, oy)
        })}
      </g>
    </svg>
  )
}

// ══════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════

export default function PropertyPlanner() {
  const [elements, setElements] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showGrid, setShowGrid] = useState(true)
  const [viewMode, setViewMode] = useState('top')
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [dragInfo, setDragInfo] = useState(null)
  const [resizeInfo, setResizeInfo] = useState(null)
  const [pathMode, setPathMode] = useState(null)
  const canvasRef = useRef(null)

  const selected = elements.find(e => e.id === selectedId)

  const addElement = useCallback((catalogItem) => {
    if (catalogItem.shape === 'path') {
      const id = nextId++
      setElements(prev => [...prev, { id, type: catalogItem.type, name: catalogItem.name, shape: 'path', color: catalogItem.color, strokeWidth: catalogItem.strokeWidth || 6, pathStyle: catalogItem.style || 'solid', points: [], label: catalogItem.name, x: 0, y: 0, w: 0, h: 0, rotation: 0 }])
      setPathMode({ catalogItem, elementId: id })
      setSelectedId(id)
      return
    }
    const id = nextId++
    const cr = canvasRef.current?.getBoundingClientRect()
    const cx = cr ? (cr.width / 2 - pan.x) / (zoom / 100) : 400
    const cy = cr ? (cr.height / 2 - pan.y) / (zoom / 100) : 300
    let svgPath
    if (catalogItem.shape === 'green') svgPath = randShape(GREEN_SHAPES)
    if (catalogItem.shape === 'bunker') svgPath = randShape(BUNKER_SHAPES)
    if (catalogItem.shape === 'chipping') svgPath = randShape(CHIPPING_SHAPES)
    setElements(prev => [...prev, { id, type: catalogItem.type, name: catalogItem.name, x: snapToGrid(cx - (catalogItem.w * SCALE) / 2), y: snapToGrid(cy - (catalogItem.h * SCALE) / 2), w: catalogItem.w, h: catalogItem.h, color: catalogItem.color, accent: catalogItem.accent, shape: catalogItem.shape, rotation: 0, label: catalogItem.name, svgPath }])
    setSelectedId(id)
  }, [pan, zoom])

  const updateElement = useCallback((id, u) => setElements(prev => prev.map(e => e.id === id ? { ...e, ...u } : e)), [])

  const deleteElement = useCallback((id) => {
    setElements(prev => prev.filter(e => e.id !== id))
    if (selectedId === id) setSelectedId(null)
    if (pathMode?.elementId === id) setPathMode(null)
  }, [selectedId, pathMode])

  const duplicateElement = useCallback((id) => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    const nid = nextId++
    const c = { ...el, id: nid, label: el.label + ' (copy)' }
    if (el.shape === 'path') c.points = el.points.map(p => ({ x: p.x + 30, y: p.y + 30 }))
    else { c.x = el.x + 30; c.y = el.y + 30 }
    if (el.shape === 'green') c.svgPath = randShape(GREEN_SHAPES)
    if (el.shape === 'bunker') c.svgPath = randShape(BUNKER_SHAPES)
    if (el.shape === 'chipping') c.svgPath = randShape(CHIPPING_SHAPES)
    setElements(prev => [...prev, c])
    setSelectedId(nid)
  }, [elements])

  const reshapeElement = useCallback((id) => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    let svgPath
    if (el.shape === 'green') svgPath = randShape(GREEN_SHAPES)
    else if (el.shape === 'bunker') svgPath = randShape(BUNKER_SHAPES)
    else if (el.shape === 'chipping') svgPath = randShape(CHIPPING_SHAPES)
    if (svgPath) updateElement(id, { svgPath })
  }, [elements, updateElement])

  // Save/Load
  const saveDesign = useCallback((name) => {
    const designs = JSON.parse(localStorage.getItem('albatross-designs') || '{}')
    designs[name] = { elements, savedAt: new Date().toISOString() }
    localStorage.setItem('albatross-designs', JSON.stringify(designs))
    setSavedDesigns(Object.keys(designs))
    setSaveMessage('Saved!')
    setTimeout(() => setSaveMessage(null), 2000)
  }, [elements])

  const loadDesign = useCallback((name) => {
    const designs = JSON.parse(localStorage.getItem('albatross-designs') || '{}')
    if (designs[name]) {
      setElements(designs[name].elements)
      setSelectedId(null)
      setPathMode(null)
      const maxId = designs[name].elements.reduce((max, el) => Math.max(max, el.id), 0)
      nextId = maxId + 1
      setSaveMessage('Loaded!')
      setTimeout(() => setSaveMessage(null), 2000)
    }
  }, [])

  const deleteDesign = useCallback((name) => {
    const designs = JSON.parse(localStorage.getItem('albatross-designs') || '{}')
    delete designs[name]
    localStorage.setItem('albatross-designs', JSON.stringify(designs))
    setSavedDesigns(Object.keys(designs))
  }, [])

  const exportDesign = useCallback(() => {
    const data = JSON.stringify({ name: 'Albatross Club Property', elements, exportedAt: new Date().toISOString() }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'albatross-club-layout.json'; a.click()
    URL.revokeObjectURL(url)
  }, [elements])

  const importDesign = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.elements) {
          setElements(data.elements)
          setSelectedId(null)
          const maxId = data.elements.reduce((max, el) => Math.max(max, el.id), 0)
          nextId = maxId + 1
          setSaveMessage('Imported!')
          setTimeout(() => setSaveMessage(null), 2000)
        }
      } catch { setSaveMessage('Invalid file'); setTimeout(() => setSaveMessage(null), 2000) }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const [savedDesigns, setSavedDesigns] = useState([])
  const [showSavePanel, setShowSavePanel] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  const [saveName, setSaveName] = useState('My Property')
  const fileInputRef = useRef(null)

  // Load saved design list on mount
  useEffect(() => {
    const designs = JSON.parse(localStorage.getItem('albatross-designs') || '{}')
    setSavedDesigns(Object.keys(designs))
    // Auto-load last autosave
    if (designs['__autosave__']) {
      setElements(designs['__autosave__'].elements)
      const maxId = designs['__autosave__'].elements.reduce((max, el) => Math.max(max, el.id), 0)
      nextId = maxId + 1
    }
  }, [])

  // Autosave every 30 seconds
  useEffect(() => {
    if (elements.length === 0) return
    const timer = setTimeout(() => {
      const designs = JSON.parse(localStorage.getItem('albatross-designs') || '{}')
      designs['__autosave__'] = { elements, savedAt: new Date().toISOString() }
      localStorage.setItem('albatross-designs', JSON.stringify(designs))
    }, 30000)
    return () => clearTimeout(timer)
  }, [elements])

  // Drag
  const handleElementMouseDown = useCallback((e, elId) => {
    e.stopPropagation()
    if (pathMode) return
    const el = elements.find(el => el.id === elId)
    if (!el) { setSelectedId(elId); return }
    setSelectedId(elId)
    if (el.shape === 'path') {
      // Drag entire path by moving all points
      setDragInfo({ id: elId, startX: e.clientX, startY: e.clientY, origX: 0, origY: 0, isPath: true, origPoints: el.points.map(p => ({ ...p })) })
      return
    }
    setDragInfo({ id: elId, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y })
  }, [elements, pathMode])

  useEffect(() => {
    if (!dragInfo) return
    const move = (e) => {
      const s = zoom / 100, dx = (e.clientX - dragInfo.startX) / s, dy = (e.clientY - dragInfo.startY) / s
      if (dragInfo.isPath && dragInfo.origPoints) {
        updateElement(dragInfo.id, { points: dragInfo.origPoints.map(p => ({ x: snapToGrid(p.x + dx), y: snapToGrid(p.y + dy) })) })
      } else {
        updateElement(dragInfo.id, { x: snapToGrid(dragInfo.origX + dx), y: snapToGrid(dragInfo.origY + dy) })
      }
    }
    const up = () => setDragInfo(null)
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [dragInfo, zoom, updateElement])

  // Resize
  const handleResizeMouseDown = useCallback((e, elId, corner) => {
    e.stopPropagation(); e.preventDefault()
    const el = elements.find(el => el.id === elId)
    if (!el) return
    setResizeInfo({ id: elId, corner, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y, origW: el.w, origH: el.h })
  }, [elements])

  useEffect(() => {
    if (!resizeInfo) return
    const move = (e) => {
      const s = zoom / 100, dx = (e.clientX - resizeInfo.startX) / s / SCALE, dy = (e.clientY - resizeInfo.startY) / s / SCALE
      let w = resizeInfo.origW, h = resizeInfo.origH, x = resizeInfo.origX, y = resizeInfo.origY
      if (resizeInfo.corner === 'br') { w = Math.max(2, Math.round(w + dx)); h = Math.max(2, Math.round(h + dy)) }
      else if (resizeInfo.corner === 'bl') { const nw = Math.max(2, Math.round(w - dx)); x += (w - nw) * SCALE; w = nw; h = Math.max(2, Math.round(h + dy)) }
      else if (resizeInfo.corner === 'tr') { w = Math.max(2, Math.round(w + dx)); const nh = Math.max(2, Math.round(h - dy)); y += (h - nh) * SCALE; h = nh }
      else if (resizeInfo.corner === 'tl') { const nw = Math.max(2, Math.round(w - dx)); x += (w - nw) * SCALE; w = nw; const nh = Math.max(2, Math.round(h - dy)); y += (h - nh) * SCALE; h = nh }
      updateElement(resizeInfo.id, { w, h, x: snapToGrid(x), y: snapToGrid(y) })
    }
    const up = () => setResizeInfo(null)
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [resizeInfo, zoom, updateElement])

  // Canvas mouse
  const handleCanvasMouseDown = useCallback((e) => {
    if (pathMode) {
      const r = canvasRef.current.getBoundingClientRect(), s = zoom / 100
      const x = (e.clientX - r.left - pan.x) / s, y = (e.clientY - r.top - pan.y) / s
      const pel = elements.find(el => el.id === pathMode.elementId)
      if (pel) updateElement(pathMode.elementId, { points: [...pel.points, { x: snapToGrid(x), y: snapToGrid(y) }] })
      return
    }
    if (e.target === canvasRef.current || e.target.closest('.planner-canvas__grid') || e.target.classList.contains('planner-canvas__transform')) {
      setSelectedId(null); setIsPanning(true); setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan, pathMode, elements, zoom, updateElement])

  const finishPath = useCallback(() => {
    if (pathMode) {
      const pel = elements.find(el => el.id === pathMode.elementId)
      if (pel && pel.points.length < 2) deleteElement(pathMode.elementId)
      setPathMode(null)
    }
  }, [pathMode, elements, deleteElement])

  const undoPathPoint = useCallback(() => {
    if (!pathMode) return
    const pel = elements.find(el => el.id === pathMode.elementId)
    if (pel && pel.points.length > 0) updateElement(pathMode.elementId, { points: pel.points.slice(0, -1) })
  }, [pathMode, elements, updateElement])

  useEffect(() => {
    if (!isPanning) return
    const move = (e) => setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
    const up = () => setIsPanning(false)
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [isPanning, panStart])

  // Keys
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { if (pathMode) finishPath(); else setSelectedId(null) }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !pathMode && document.activeElement.tagName !== 'INPUT') deleteElement(selectedId)
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && pathMode) undoPathPoint()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, pathMode, finishPath, deleteElement, undoPathPoint])

  // Zoom
  const handleWheel = useCallback((e) => { e.preventDefault(); setZoom(prev => Math.min(200, Math.max(25, prev + (e.deltaY > 0 ? -5 : 5)))) }, [])
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    c.addEventListener('wheel', handleWheel, { passive: false })
    return () => c.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const totalStructures = elements.filter(e => ['main-clubhouse', 'guest-cabin', 'wellness-center', 'bar-restaurant', 'locker-room', 'pro-shop'].includes(e.type)).length
  const cabinCount = elements.filter(e => e.type === 'guest-cabin').length
  const hasOrganicShape = selected && ['green', 'bunker', 'chipping'].includes(selected.shape)

  function buildPathD(pts) {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    if (pts.length === 2) return d + ` L ${pts[1].x} ${pts[1].y}`
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1], curr = pts[i], next = pts[i + 1] || curr, pp = pts[i - 2] || prev
      d += ` C ${prev.x + (curr.x - pp.x) / 4},${prev.y + (curr.y - pp.y) / 4} ${curr.x - (next.x - prev.x) / 4},${curr.y - (next.y - prev.y) / 4} ${curr.x},${curr.y}`
    }
    return d
  }

  const is3D = viewMode === '3d'

  return (
    <div className="planner">
      <aside className="planner-sidebar">
        <div className="planner-sidebar__header">
          <h2>Add Elements</h2>
          <p>Click to add to center, then drag to position</p>
        </div>
        <div className="planner-sidebar__scroll">
          {Object.entries(ELEMENT_CATALOG).map(([key, cat]) => (
            <div key={key} className="planner-category">
              <h3 className="planner-category__title">{cat.label}</h3>
              {cat.items.map(item => (
                <button key={item.type} className="planner-item-btn" onClick={() => addElement(item)}>
                  <span className={`planner-item-btn__swatch planner-item-btn__swatch--${['green','bunker','chipping'].includes(item.shape) ? 'organic' : ['circle','tree'].includes(item.shape) ? 'circle' : item.shape === 'path' ? 'path' : item.shape === 'flag' ? 'flag' : 'rect'}`} style={{ background: item.color }} />
                  <div className="planner-item-btn__info">
                    <span className="planner-item-btn__name">{item.name}</span>
                    <span className="planner-item-btn__dims">{item.shape === 'path' ? 'Click to draw' : `${item.w}×${item.h} ft`}</span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="planner-save-buttons">
          <button className="planner-save-btn" onClick={() => setShowSavePanel(!showSavePanel)}>Save / Load</button>
          <button className="planner-save-btn planner-save-btn--export" onClick={exportDesign}>Export JSON</button>
          <input type="file" ref={fileInputRef} accept=".json" onChange={importDesign} style={{ display: 'none' }} />
          <button className="planner-save-btn planner-save-btn--import" onClick={() => fileInputRef.current?.click()}>Import</button>
        </div>
        {saveMessage && <div className="planner-save-msg">{saveMessage}</div>}
        <button className="planner-clear-btn" onClick={() => { setElements([]); setSelectedId(null); setPathMode(null) }}>Clear All</button>
      </aside>

      {/* Properties */}
      {selected && !pathMode && (
        <div className="planner-props">
          <div className="planner-props__header"><h3>{selected.name}</h3><span className="planner-props__type">#{selected.id}</span></div>
          <div className="planner-props__field"><label>LABEL</label><input type="text" value={selected.label} onChange={e => updateElement(selected.id, { label: e.target.value })} /></div>
          {selected.shape !== 'path' && (
            <>
              <div className="planner-props__field"><label>DIMENSIONS (ft)</label>
                <div className="planner-props__dims"><input type="number" value={selected.w} onChange={e => updateElement(selected.id, { w: Number(e.target.value) || 1 })} min="1" /><span>&times;</span><input type="number" value={selected.h} onChange={e => updateElement(selected.id, { h: Number(e.target.value) || 1 })} min="1" /></div>
              </div>
              <div className="planner-props__field"><label>ROTATION</label>
                <div className="planner-props__rotation"><input type="range" min="0" max="360" value={selected.rotation} onChange={e => updateElement(selected.id, { rotation: Number(e.target.value) })} /><span>{selected.rotation}&deg;</span></div>
              </div>
            </>
          )}
          {selected.shape === 'path' && (
            <>
              <div className="planner-props__field"><label>POINTS</label><span className="planner-props__meta">{selected.points?.length || 0} points</span></div>
              <div className="planner-props__field"><label>THICKNESS</label>
                <div className="planner-props__rotation">
                  <input type="range" min="2" max="20" value={selected.strokeWidth || 6} onChange={e => updateElement(selected.id, { strokeWidth: Number(e.target.value) })} />
                  <span>{selected.strokeWidth || 6}px</span>
                </div>
              </div>
              <button className="planner-props__btn planner-props__btn--reshape" onClick={() => {
                if (selected.points?.length > 0) {
                  const dx = 20, dy = 20
                  updateElement(selected.id, { points: selected.points.map(p => ({ x: p.x + dx, y: p.y + dy })) })
                }
              }}>Nudge Path +20px</button>
            </>
          )}
          {hasOrganicShape && <button className="planner-props__btn planner-props__btn--reshape" onClick={() => reshapeElement(selected.id)}>Randomize Shape</button>}
          <div className="planner-props__actions">
            <button className="planner-props__btn planner-props__btn--dup" onClick={() => duplicateElement(selected.id)}>Duplicate</button>
            <button className="planner-props__btn planner-props__btn--del" onClick={() => deleteElement(selected.id)}>Delete</button>
          </div>
        </div>
      )}

      {/* Path mode bar */}
      {pathMode && (
        <div className="planner-path-mode"><div className="planner-path-mode__content">
          <span className="planner-path-mode__icon">&#9998;</span>
          <span>Drawing: <strong>{pathMode.catalogItem.name}</strong></span>
          <span className="planner-path-mode__hint">Click on canvas to add points</span>
          <div className="planner-path-mode__actions">
            <button onClick={undoPathPoint} className="planner-path-mode__btn">Undo Point</button>
            <button onClick={finishPath} className="planner-path-mode__btn planner-path-mode__btn--done">Done (Esc)</button>
          </div>
        </div></div>
      )}

      {/* Save/Load Panel */}
      {showSavePanel && (
        <div className="planner-save-panel">
          <div className="planner-save-panel__header">
            <h3>Save & Load Designs</h3>
            <button className="planner-save-panel__close" onClick={() => setShowSavePanel(false)}>&times;</button>
          </div>
          <div className="planner-save-panel__save">
            <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="Design name" />
            <button onClick={() => { saveDesign(saveName); }}>Save</button>
          </div>
          <div className="planner-save-panel__list">
            {savedDesigns.filter(n => n !== '__autosave__').length === 0 && <p className="planner-save-panel__empty">No saved designs yet</p>}
            {savedDesigns.filter(n => n !== '__autosave__').map(name => (
              <div key={name} className="planner-save-panel__item">
                <span>{name}</span>
                <div>
                  <button onClick={() => { loadDesign(name); setShowSavePanel(false) }}>Load</button>
                  <button className="planner-save-panel__del" onClick={() => deleteDesign(name)}>&times;</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="planner-toolbar">
        <div className="planner-toolbar__group">
          <button className={`planner-toolbar__btn ${viewMode === 'top' ? 'planner-toolbar__btn--active' : ''}`} onClick={() => setViewMode('top')}>Top View</button>
          <button className={`planner-toolbar__btn ${viewMode === '3d' ? 'planner-toolbar__btn--active' : ''}`} onClick={() => setViewMode('3d')}>3D View</button>
        </div>
        <div className="planner-toolbar__group">
          <button className={`planner-toolbar__btn ${showGrid ? 'planner-toolbar__btn--active' : ''}`} onClick={() => setShowGrid(!showGrid)}>Grid</button>
        </div>
        <div className="planner-toolbar__group">
          <button className="planner-toolbar__btn" onClick={() => setPan({ x: 0, y: 0 })}>Reset Pan</button>
          <button className="planner-toolbar__btn" onClick={() => setZoom(100)}>Reset Zoom</button>
          <button className="planner-toolbar__btn" onClick={() => setZoom(z => Math.min(200, z + 10))}>+</button>
          <button className="planner-toolbar__btn" onClick={() => setZoom(z => Math.max(25, z - 10))}>&minus;</button>
        </div>
      </div>

      {/* Canvas */}
      <div className={`planner-canvas ${pathMode ? 'planner-canvas--drawing' : ''}`} ref={canvasRef} onMouseDown={(e) => {
        if (is3D) {
          setSelectedId(null)
          setIsPanning(true)
          setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        } else {
          handleCanvasMouseDown(e)
        }
      }} style={{ cursor: is3D ? (isPanning ? 'grabbing' : 'grab') : pathMode ? 'crosshair' : isPanning ? 'grabbing' : 'grab' }}>
        {/* 3D Isometric View */}
        {is3D && <Isometric3DView elements={elements} zoom={zoom} pan={pan} showGrid={showGrid} selectedId={selectedId} />}

        {/* Top-down View */}
        <div className="planner-canvas__transform" style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
          transformOrigin: '0 0',
          display: is3D ? 'none' : 'block',
        }}>
          {/* Grid */}
          {showGrid && (
            <svg className="planner-canvas__grid" width="3000" height="2000">
              <defs>
                <pattern id="smallGrid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse"><path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="rgba(74,103,65,0.15)" strokeWidth="0.5" /></pattern>
                <pattern id="bigGrid" width={GRID_SIZE * 10} height={GRID_SIZE * 10} patternUnits="userSpaceOnUse"><rect width={GRID_SIZE * 10} height={GRID_SIZE * 10} fill="url(#smallGrid)" /><path d={`M ${GRID_SIZE * 10} 0 L 0 0 0 ${GRID_SIZE * 10}`} fill="none" stroke="rgba(74,103,65,0.3)" strokeWidth="1" /></pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#bigGrid)" />
            </svg>
          )}

          <div className="planner-canvas__scale"><div className="planner-canvas__scale-bar" style={{ width: 10 * SCALE }}><span>10 ft</span></div></div>

          {/* Paths SVG */}
          <svg className="planner-canvas__paths" width="3000" height="2000" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            {elements.filter(el => el.shape === 'path').map(el => {
              const isSel = el.id === selectedId, d = buildPathD(el.points)
              const dash = el.pathStyle === 'dashed' ? '12,6' : el.pathStyle === 'dotted' ? '4,4' : 'none'
              return (
                <g key={el.id}>
                  <path d={d} fill="none" stroke="transparent" strokeWidth={el.strokeWidth + 10} style={{ pointerEvents: 'stroke', cursor: 'pointer' }} onMouseDown={(e) => { e.stopPropagation(); setSelectedId(el.id) }} />
                  <path d={d} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={el.strokeWidth + 2} strokeLinecap="round" strokeLinejoin="round" />
                  <path d={d} fill="none" stroke={el.color} strokeWidth={el.strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} opacity={0.9} />
                  {el.strokeWidth >= 8 && <path d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={el.strokeWidth - 2} strokeLinecap="round" strokeLinejoin="round" />}
                  {isSel && <path d={d} fill="none" stroke="#C4A97D" strokeWidth={el.strokeWidth + 4} strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />}
                  {isSel && el.points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#C4A97D" stroke="#fff" strokeWidth="1" />)}
                  {isSel && el.points.length >= 2 && <text x={el.points[Math.floor(el.points.length / 2)].x} y={el.points[Math.floor(el.points.length / 2)].y - 8} fill="rgba(255,255,255,0.8)" fontSize="8" fontFamily="Raleway, sans-serif" fontWeight="600" textAnchor="middle">{el.label}</text>}
                </g>
              )
            })}
          </svg>

          {/* Elements */}
          {elements.filter(el => el.shape !== 'path').map(el => {
            const pw = el.w * SCALE, ph = el.h * SCALE, isSel = el.id === selectedId
            const hasCustomShape = ['clubhouse','cabin','building','green','bunker','chipping','pool','tree','garden','teebox','fairway','flag'].includes(el.shape)
            const isSmall = el.shape === 'tree' || el.shape === 'flag'
            const borderRadius = el.shape === 'circle' ? '50%' : '3px'

            return (
              <div key={el.id} className={`planner-element ${isSel ? 'planner-element--selected' : ''} ${hasCustomShape ? 'planner-element--organic' : ''}`}
                style={{
                  left: el.x, top: el.y, width: pw, height: ph,
                  background: hasCustomShape ? 'transparent' : el.color,
                  borderRadius: hasCustomShape ? 0 : borderRadius,
                  transform: `rotate(${el.rotation}deg)${is3D && ['clubhouse','cabin','building'].includes(el.shape) ? ' translateZ(15px)' : ''}`,
                  zIndex: isSel ? 100 : el.shape === 'tree' ? 15 : 10,
                }}
                onMouseDown={e => handleElementMouseDown(e, el.id)}
              >
                <ShapeRenderer el={el} pw={pw} ph={ph} />
                {isSel && !isSmall && (
                  <div className="planner-element__label" style={{ zIndex: 5 }}>
                    <span className="planner-element__name">{el.label}</span>
                    <span className="planner-element__dims">{el.w}&times;{el.h} ft</span>
                  </div>
                )}
                {isSel && (
                  <>
                    <div className="planner-element__handle planner-element__handle--tl" onMouseDown={e => handleResizeMouseDown(e, el.id, 'tl')} />
                    <div className="planner-element__handle planner-element__handle--tr" onMouseDown={e => handleResizeMouseDown(e, el.id, 'tr')} />
                    <div className="planner-element__handle planner-element__handle--bl" onMouseDown={e => handleResizeMouseDown(e, el.id, 'bl')} />
                    <div className="planner-element__handle planner-element__handle--br" onMouseDown={e => handleResizeMouseDown(e, el.id, 'br')} />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Status */}
      <div className="planner-status">
        <span>Structures: <strong>{totalStructures}</strong></span>
        <span>Cabins: <strong>{cabinCount}</strong></span>
        <span>Elements: <strong>{elements.length}</strong></span>
        <span>Zoom: <strong>{zoom}%</strong></span>
        <span className="planner-status__hint">{pathMode ? 'Click to add points \u00b7 Esc to finish \u00b7 Cmd+Z to undo' : 'Scroll to zoom \u00b7 Drag to pan \u00b7 Click items to edit \u00b7 Delete to remove'}</span>
      </div>
    </div>
  )
}
