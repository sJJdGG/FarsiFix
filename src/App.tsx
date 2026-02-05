import AppShell from './components/AppShell'
import ContentGrid from './components/ContentGrid'
import HeroHeader from './components/HeroHeader'
import SidePane from './components/SidePane'
import TopBar from './components/TopBar'
import UploadPane from './components/UploadPane'
import { useFarsiFix } from './hooks/useFarsiFix'

export default function App() {
  const {
    phase,
    busy,
    error,
    activeFile,
    activeFileSize,
    downloadInfo,
    maxFileSizeMb,
    handleFileSelected,
    handleCancel,
    handleDownloadAgain,
  } = useFarsiFix()

  return (
    <AppShell>
      <TopBar />
      <HeroHeader />
      <ContentGrid
        primary={
          <UploadPane
            phase={phase}
            busy={busy}
            activeFileName={activeFile?.name}
            activeFileSize={activeFileSize}
            hasDownload={Boolean(downloadInfo)}
            error={error}
            onFileSelected={handleFileSelected}
            onCancel={handleCancel}
            onDownloadAgain={handleDownloadAgain}
          />
        }
        secondary={<SidePane phase={phase} maxFileSizeMb={maxFileSizeMb} />}
      />
    </AppShell>
  )
}
