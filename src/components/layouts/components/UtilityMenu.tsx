import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ReactComponent as ChartIcon } from '@/assets/images/icon-chart.svg'
import { ReactComponent as DashboardIcon } from '@/assets/images/icon-dashboard.svg'
import { ReactComponent as ThreeDotIcon } from '@/assets/images/icon-dot-three.svg'
import { ReactComponent as MagicIcon } from '@/assets/images/icon-magic-line.svg'
import { ReactComponent as NetworkIcon } from '@/assets/images/icon-network.svg'

export const UtilityMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const navigate = useNavigate()

  const utilityOptions = [
    {
      label: 'Utilities',
      icon: <MagicIcon />,
      onClick: () => navigate('/utilities')
    }
  ]

  return (
    <div
      className="absolute -right-12 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-grey800"
      onClick={() => setIsOpen(!isOpen)}>
      <ThreeDotIcon />
      {isOpen && (
        <div className="text-grey100 text-sm border-border border rounded-lg p-2 absolute top-full mt-2 right-0 z-50 w-max bg-black">
          {utilityOptions.map((item, index) => (
            <div
              key={index}
              className="flex items-center py-2 px-4 gap-3 cursor-pointer rounded-md transition-all select-none  hover:bg-grey200"
              onClick={item.onClick}>
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
