import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const nitIcon = L.divIcon({
  className: '',
  html: `
    <svg width="32" height="42" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" 
            fill="#12372A" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="13" r="6" fill="white" opacity="0.9"/>
      <text x="14" y="17" text-anchor="middle" font-size="11" font-weight="bold" fill="#12372A">A</text>
    </svg>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

export default function SourceMarker() {
  const nitCoords = [23.8315, 91.2868];
  
  return (
    <Marker position={nitCoords} icon={nitIcon} zIndexOffset={500}>
      <Popup>
        <div style={{ fontFamily: 'Inter, system-ui', fontSize: '13px', textAlign: 'center' }}>
          <strong>🎓 NIT Agartala</strong><br />
          <span style={{ fontSize: '12px', color: '#66736A' }}>Starting Location</span>
        </div>
      </Popup>
    </Marker>
  );
}
