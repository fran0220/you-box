import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionPageLayout } from '@/components/layout'
import { PageHeader } from '@/components/youbox'
import { listDeployments } from './api'
import { DeploymentAccessGuard } from './components/deployment-access-guard'
import { DeploymentsTable } from './components/deployments-table'
import { CreateDeploymentDrawer } from './components/dialogs/create-deployment-drawer'
import { ModelsDialogs } from './components/models-dialogs'
import { ModelsPrimaryButtons } from './components/models-primary-buttons'
import { ModelsProvider, useModels } from './components/models-provider'
import { ModelsTable } from './components/models-table'
import { useModelDeploymentSettings } from './hooks/use-model-deployment-settings'
import { deploymentsQueryKeys } from './lib'
import {
  type ModelsSectionId,
  MODELS_DEFAULT_SECTION,
  MODELS_SECTION_IDS,
} from './section-registry'

const route = getRouteApi('/_authenticated/models/$section')

const SECTION_META: Record<
  ModelsSectionId,
  { titleKey: string; subtitleKey: string }
> = {
  metadata: {
    titleKey: 'Metadata',
    subtitleKey:
      'Catalog metadata for models exposed to users — vendors, ratios, and sync.',
  },
  deployments: {
    titleKey: 'Deployments',
    subtitleKey: 'GPU deployments managed through io.net when enabled.',
  },
}

function ModelsContent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { tabCategory, setTabCategory, metadataConfiguredTotal } = useModels()
  const params = route.useParams()
  const activeSection = (params.section ??
    MODELS_DEFAULT_SECTION) as ModelsSectionId

  const [createDeploymentOpen, setCreateDeploymentOpen] = useState(false)

  useEffect(() => {
    if (tabCategory !== activeSection) {
      setTabCategory(activeSection)
    }
  }, [activeSection, setTabCategory, tabCategory])

  const {
    loading: deploymentLoading,
    loadingPhase,
    isIoNetEnabled,
    connectionLoading,
    connectionOk,
    connectionError,
    testConnection,
    refresh: refreshDeploymentSettings,
  } = useModelDeploymentSettings()

  useEffect(() => {
    if (activeSection === 'deployments') {
      refreshDeploymentSettings()
    }
  }, [activeSection, refreshDeploymentSettings])

  useEffect(() => {
    if (
      activeSection === 'deployments' &&
      isIoNetEnabled &&
      loadingPhase === 'connection'
    ) {
      const defaultParams = { p: 1, page_size: 10 }
      queryClient.prefetchQuery({
        queryKey: deploymentsQueryKeys.list(defaultParams),
        queryFn: () => listDeployments(defaultParams),
        staleTime: 30 * 1000,
      })
    }
  }, [activeSection, isIoNetEnabled, loadingPhase, queryClient])

  const handleSectionChange = useCallback(
    (section: string) => {
      void navigate({
        to: '/models/$section',
        params: { section: section as ModelsSectionId },
      })
    },
    [navigate]
  )

  const sectionMeta = SECTION_META[activeSection] ?? SECTION_META.metadata

  const pageTitle = t('Models')
  const subtitle =
    activeSection === 'metadata' && metadataConfiguredTotal != null
      ? t('{{count}} configured models', { count: metadataConfiguredTotal })
      : t(sectionMeta.subtitleKey)

  const headerActions =
    activeSection === 'metadata' ? (
      <ModelsPrimaryButtons />
    ) : (
      <Button onClick={() => setCreateDeploymentOpen(true)} size='sm'>
        <Plus className='h-4 w-4' aria-hidden />
        {t('Create deployment')}
      </Button>
    )

  return (
    <>
      <SectionPageLayout>
        <SectionPageLayout.Content>
          <div className='mx-auto w-full max-w-[1200px] space-y-5'>
            <PageHeader
              eyebrow={pageTitle}
              title={pageTitle}
              subtitle={subtitle}
              actions={headerActions}
            />

            <Tabs value={activeSection} onValueChange={handleSectionChange}>
              <TabsList variant='line' className='w-full justify-start'>
                {MODELS_SECTION_IDS.map((section) => (
                  <TabsTrigger key={section} value={section}>
                    {t(SECTION_META[section].titleKey)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {activeSection === 'metadata' ? (
              <ModelsTable />
            ) : (
              <DeploymentAccessGuard
                loading={deploymentLoading}
                loadingPhase={loadingPhase}
                isEnabled={isIoNetEnabled}
                connectionLoading={connectionLoading}
                connectionOk={connectionOk}
                connectionError={connectionError}
                onRetry={testConnection}
              >
                <DeploymentsTable />
              </DeploymentAccessGuard>
            )}
          </div>
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <ModelsDialogs />
      <CreateDeploymentDrawer
        open={createDeploymentOpen}
        onOpenChange={setCreateDeploymentOpen}
      />
    </>
  )
}

export function Models() {
  return (
    <ModelsProvider>
      <ModelsContent />
    </ModelsProvider>
  )
}
