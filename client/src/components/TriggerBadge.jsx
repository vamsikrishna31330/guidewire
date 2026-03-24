import { HiCloud, HiFire, HiExclamation, HiLockClosed, HiStatusOffline } from 'react-icons/hi'

const triggerConfig = {
  rain: { icon: HiCloud, label: 'Rain', color: 'bg-blue-500/20 text-blue-400' },
  heat: { icon: HiFire, label: 'Heat', color: 'bg-orange-500/20 text-orange-400' },
  aqi: { icon: HiStatusOffline, label: 'AQI', color: 'bg-purple-500/20 text-purple-400' },
  curfew: { icon: HiLockClosed, label: 'Curfew', color: 'bg-red-500/20 text-red-400' },
  flood: { icon: HiExclamation, label: 'Flood', color: 'bg-cyan-500/20 text-cyan-400' },
}

export default function TriggerBadge({ type, showLabel = true }) {
  const config = triggerConfig[type?.toLowerCase()] || {
    icon: HiExclamation,
    label: type || 'Unknown',
    color: 'bg-gray-500/20 text-gray-400',
  }

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}
