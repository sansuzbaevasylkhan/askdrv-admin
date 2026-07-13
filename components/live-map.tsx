'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { Order } from '@/lib/types'

// Fix default marker icon resolution under bundlers.
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = defaultIcon

interface Props {
  orders: Order[]
}

// Default center: Almaty. Orders without lat/lng simply don't show a marker.
const DEFAULT_CENTER: [number, number] = [43.2389, 76.8897]

export function LiveMap({ orders }: Props) {
  const located = orders.filter(
    (o) => typeof o.driver_lat === 'number' && typeof o.driver_lng === 'number'
  ) as (Order & { driver_lat: number; driver_lng: number })[]

  const center: [number, number] = located.length
    ? [located[0].driver_lat, located[0].driver_lng]
    : DEFAULT_CENTER

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-md border border-border">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {located.map((o) => (
          <Marker key={o.id} position={[o.driver_lat, o.driver_lng]}>
            <Popup>
              <div className="text-xs">
                <div className="font-semibold">#{o.id.slice(0, 8)}</div>
                <div>{o.pickup_address} → {o.dropoff_address}</div>
                <div>Статус: {o.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
