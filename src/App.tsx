import { config } from '@/config'
import { Widget } from '@/components/Widget'
import { FullPanel } from '@/components/FullPanel'

function App() {
  if (config.ui.layout === 'panel') {
    return <FullPanel />;
  }
  return <Widget />;
}

export default App
