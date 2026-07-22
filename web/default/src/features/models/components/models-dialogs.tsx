import { lazy, Suspense } from 'react'
import { DescriptionDialog } from './dialogs/description-dialog'
import { MissingModelsDialog } from './dialogs/missing-models-dialog'
import { PrefillGroupManagement } from './dialogs/prefill-group-management'
import { SyncWizardDialog } from './dialogs/sync-wizard-dialog'
import { UpstreamConflictDialog } from './dialogs/upstream-conflict-dialog'
import { VendorManagementDialog } from './dialogs/vendor-management-dialog'
import { VendorMutateDialog } from './dialogs/vendor-mutate-dialog'
import { useModels } from './models-provider'

const ModelMutateDrawer = lazy(() =>
  import('./drawers/model-mutate-drawer').then((mod) => ({
    default: mod.ModelMutateDrawer,
  }))
)

export function ModelsDialogs() {
  const {
    open,
    setOpen,
    currentRow,
    currentVendor,
    descriptionData,
    setDescriptionData,
  } = useModels()
  const mutateDrawerOpen = open === 'create-model' || open === 'update-model'

  return (
    <>
      {/* Model Create/Update Drawer */}
      {mutateDrawerOpen && (
        <Suspense fallback={null}>
          <ModelMutateDrawer
            open={mutateDrawerOpen}
            onOpenChange={(v) => !v && setOpen(null)}
            currentRow={currentRow}
          />
        </Suspense>
      )}

      <VendorManagementDialog
        open={open === 'vendor-management'}
        onOpenChange={(v) => !v && setOpen(null)}
      />

      {/* Vendor Create/Update Dialog */}
      <VendorMutateDialog
        open={open === 'create-vendor' || open === 'update-vendor'}
        onOpenChange={(v) => {
          if (!v) {
            setOpen('vendor-management')
          }
        }}
        currentVendor={open === 'update-vendor' ? currentVendor : null}
      />

      {/* Missing Models Dialog */}
      <MissingModelsDialog
        open={open === 'missing-models'}
        onOpenChange={(v) => !v && setOpen(null)}
      />

      {/* Sync Wizard Dialog */}
      <SyncWizardDialog
        open={open === 'sync-wizard'}
        onOpenChange={(v) => !v && setOpen(null)}
      />

      {/* Upstream Conflict Dialog */}
      <UpstreamConflictDialog
        open={open === 'upstream-conflict'}
        onOpenChange={(v) => !v && setOpen(null)}
      />

      {/* Prefill Groups Management */}
      <PrefillGroupManagement
        open={open === 'prefill-groups'}
        onOpenChange={(v) => !v && setOpen(null)}
      />

      {/* Description Dialog */}
      <DescriptionDialog
        open={open === 'description'}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setDescriptionData(null)
          }
        }}
        modelName={descriptionData?.modelName || ''}
        description={descriptionData?.description || ''}
      />
    </>
  )
}
