import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { SectionPageLayout } from '@/components/layout'
import { StickySaveBar } from '@/components/settings'
import { useSystemOptions, getOptionValue } from '../hooks/use-system-options'
import type { SystemOption } from '../types'
import {
  SettingsPageProvider,
  type SettingsFormActionsRegistration,
} from './settings-page-context'
import { SettingsShell } from './settings-shell'
import {
  SETTINGS_SHELL_GROUPS,
  isSettingsShellGroup,
} from './settings-shell-config'

type SettingsPageProps<
  TSettings extends Record<string, string | number | boolean | unknown[]>,
  TSectionId extends string,
  TExtraArgs extends unknown[] = [],
> = {
  routePath: string
  defaultSettings: TSettings
  defaultSection: TSectionId
  getSectionContent: (
    sectionId: TSectionId,
    settings: TSettings,
    ...extraArgs: TExtraArgs
  ) => ReactNode
  getSectionMeta: (sectionId: TSectionId) => {
    titleKey: string
  }
  extraArgs?: TExtraArgs
  loadingMessage?: string
  resolveSettings?: (
    settings: TSettings,
    raw: SystemOption[] | undefined
  ) => TSettings
}

type SettingsPageFrameProps = {
  title: ReactNode
  /** Group segment parsed from the route (`site`, `auth`, ...). */
  group: string
  /** Active section id for the in-page rail. */
  section: string
  children: ReactNode
}

type FormActionsBarState = {
  registered: boolean
  dirty: boolean
  saving: boolean
}

const IDLE_BAR_STATE: FormActionsBarState = {
  registered: false,
  dirty: false,
  saving: false,
}

function SettingsPageFrame(props: SettingsPageFrameProps) {
  const [actionsContainer, setActionsContainer] =
    useState<HTMLDivElement | null>(null)
  const [titleStatusContainer, setTitleStatusContainer] =
    useState<HTMLSpanElement | null>(null)

  // Save/discard handlers live in a ref (refreshed every render by the
  // registrar); only the scalars that gate the sticky bar go through
  // state, with a bail-out so re-registration cannot cascade renders.
  const formActionsRef = useRef<SettingsFormActionsRegistration | null>(null)
  const [barState, setBarState] = useState<FormActionsBarState>(IDLE_BAR_STATE)

  const registerFormActions = useCallback(
    (entry: SettingsFormActionsRegistration | null) => {
      formActionsRef.current = entry
      setBarState((prev) => {
        if (!entry) {
          return prev.registered ? IDLE_BAR_STATE : prev
        }
        if (
          prev.registered &&
          prev.dirty === entry.dirty &&
          prev.saving === entry.saving
        ) {
          return prev
        }
        return { registered: true, dirty: entry.dirty, saving: entry.saving }
      })
    },
    []
  )

  const handleSave = useCallback(() => {
    formActionsRef.current?.save()
  }, [])

  const handleDiscard = useCallback(() => {
    formActionsRef.current?.discard()
  }, [])

  const shellGroup = isSettingsShellGroup(props.group) ? props.group : null
  const sectionEyebrow = shellGroup
    ? SETTINGS_SHELL_GROUPS[shellGroup].labelKey
    : null

  const content = (
    <>
      <div className='flex w-full flex-col gap-4'>{props.children}</div>
      <StickySaveBar
        dirty={barState.registered && barState.dirty}
        saving={barState.saving}
        onDiscard={handleDiscard}
        onSave={handleSave}
      />
    </>
  )

  return (
    <SettingsPageProvider
      actionsContainer={actionsContainer}
      titleStatusContainer={titleStatusContainer}
      suppressSectionHeader={false}
      sectionEyebrow={sectionEyebrow}
      registerFormActions={registerFormActions}
    >
      <SectionPageLayout>
        <SectionPageLayout.Title>
          <span className='inline-flex max-w-full min-w-0 items-center gap-2 align-middle'>
            <span className='truncate'>{props.title}</span>
            <span
              ref={setTitleStatusContainer}
              className='inline-flex min-w-0 shrink-0 items-center'
            />
          </span>
        </SectionPageLayout.Title>
        <SectionPageLayout.Actions>
          <div
            ref={setActionsContainer}
            className='flex flex-wrap items-center justify-end gap-2'
          />
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          {shellGroup ? (
            <SettingsShell group={shellGroup} section={props.section}>
              {content}
            </SettingsShell>
          ) : (
            content
          )}
        </SectionPageLayout.Content>
      </SectionPageLayout>
    </SettingsPageProvider>
  )
}

/** `/_authenticated/system-settings/site/$section` -> `site` */
function parseGroupFromRoutePath(routePath: string) {
  const segments = routePath.split('/')
  const index = segments.indexOf('system-settings')
  return index >= 0 ? (segments[index + 1] ?? '') : ''
}

/**
 * Generic settings page component
 * Handles loading state, data fetching, and section rendering
 */
export function SettingsPage<
  TSettings extends Record<string, string | number | boolean | unknown[]>,
  TSectionId extends string,
  TExtraArgs extends unknown[] = [],
>({
  routePath,
  defaultSettings,
  defaultSection,
  getSectionContent,
  getSectionMeta,
  extraArgs,
  loadingMessage = 'Loading settings...',
  resolveSettings,
}: SettingsPageProps<TSettings, TSectionId, TExtraArgs>) {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useSystemOptions()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = useParams({ from: routePath as any })
  const activeSection = (params?.section ?? defaultSection) as TSectionId
  const sectionMeta = getSectionMeta(activeSection)
  const group = parseGroupFromRoutePath(routePath)

  const settings = useMemo(() => {
    const baseSettings = getOptionValue(
      data?.data,
      defaultSettings
    ) as TSettings
    return resolveSettings
      ? resolveSettings(baseSettings, data?.data)
      : baseSettings
  }, [data?.data, defaultSettings, resolveSettings])

  if (isLoading) {
    return (
      <SettingsPageFrame
        title={t(sectionMeta.titleKey)}
        group={group}
        section={activeSection}
      >
        <div className='text-muted-foreground flex min-h-40 items-center justify-center text-sm'>
          {t(loadingMessage)}
        </div>
      </SettingsPageFrame>
    )
  }

  if (isError) {
    return (
      <SettingsPageFrame
        title={t(sectionMeta.titleKey)}
        group={group}
        section={activeSection}
      >
        <Alert variant='destructive'>
          <AlertTitle>{t('Failed to load')}</AlertTitle>
          <AlertDescription>
            {t('Could not load settings. Please try again.')}
          </AlertDescription>
          <Button
            variant='outline'
            size='sm'
            className='mt-3 w-fit'
            onClick={() => {
              void refetch()
            }}
          >
            {t('Try again')}
          </Button>
        </Alert>
      </SettingsPageFrame>
    )
  }

  const sectionContent = getSectionContent(
    activeSection,
    settings,
    ...((extraArgs ?? []) as TExtraArgs)
  )

  return (
    <SettingsPageFrame
      title={t(sectionMeta.titleKey)}
      group={group}
      section={activeSection}
    >
      {sectionContent}
    </SettingsPageFrame>
  )
}
