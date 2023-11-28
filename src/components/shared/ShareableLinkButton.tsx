import 'twin.macro'

import { ReactComponent as LinkShareIcon } from '@/assets/images/icon-share-link.svg'

export default function ShareableLinkButton() {
  return (
    <div className="p-2 rounded-lg flex items-center cursor-pointer border border-solid border-grey500">
      <LinkShareIcon />
    </div>
  )
}
