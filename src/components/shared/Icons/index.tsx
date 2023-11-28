import CloseImage from '@/assets/images/close-icon.svg'

export const CloseIcon = ({ width = 24, height = 24 }: { width?: number; height?: number }) => (
  <img src={CloseImage} width={width} height={height} />
)
