import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm, type SubmitErrorHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Rocket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerSection,
  DrawerShell,
} from '@/components/drawer-layout'
import { MultiSelect } from '@/components/multi-select'
import {
  checkClusterNameAvailability,
  createDeployment,
  estimatePrice,
  getAvailableReplicas,
  getHardwareTypes,
} from '../../api'
import { deploymentsQueryKeys } from '../../lib'

const BUILTIN_IMAGE = 'ollama/ollama:latest'
const DEFAULT_TRAFFIC_PORT = 11434

const schema = z.object({
  resource_private_name: z.string().min(1),
  image_url: z.string().min(1),
  traffic_port: z.coerce.number().int().min(1).max(65535),
  hardware_id: z.string().min(1),
  gpus_per_container: z.coerce.number().int().min(1),
  location_ids: z.array(z.string()).min(1),
  replica_count: z.coerce.number().int().min(1),
  duration_hours: z.coerce.number().int().min(1),
  // Advanced
  env_json: z.string().optional(),
  secret_env_json: z.string().optional(),
  entrypoint: z.string().optional(),
  args: z.string().optional(),
  registry_username: z.string().optional(),
  registry_secret: z.string().optional(),
  currency: z.string().optional(),
})

// NOTE: react-hook-form resolver uses the schema input type (coerce input is unknown)
type FormValues = z.input<typeof schema>

function toNumber(value: unknown, fallback: number) {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function CreateDeploymentDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      resource_private_name: '',
      image_url: BUILTIN_IMAGE,
      traffic_port: DEFAULT_TRAFFIC_PORT,
      hardware_id: '',
      gpus_per_container: 1,
      location_ids: [],
      replica_count: 1,
      duration_hours: 1,
      env_json: '',
      secret_env_json: '',
      entrypoint: '',
      args: '',
      registry_username: '',
      registry_secret: '',
      currency: 'usdc',
    },
  })

  const hardwareId = form.watch('hardware_id')
  const gpuCount = toNumber(form.watch('gpus_per_container'), 1)
  const locationIds = form.watch('location_ids')
  const durationHours = toNumber(form.watch('duration_hours'), 1)
  const replicaCount = toNumber(form.watch('replica_count'), 1)
  const trafficPort = toNumber(form.watch('traffic_port'), DEFAULT_TRAFFIC_PORT)
  const currency = form.watch('currency')
  const resourceName = form.watch('resource_private_name')

  const { data: hardwareTypesData, isLoading: isLoadingHardware } = useQuery({
    queryKey: ['deployment-hardware-types'],
    queryFn: getHardwareTypes,
    enabled: open,
  })

  const hardwareOptions = useMemo(() => {
    const items = hardwareTypesData?.data?.hardware_types || []
    if (!Array.isArray(items)) return []
    return items.map((h: Record<string, unknown>) => ({
      label:
        (h?.brand_name ? `${h.brand_name} ` : '') + String(h?.name ?? h?.id),
      value: String(h?.id),
      max_gpus: Number(h?.max_gpus || 1),
    }))
  }, [hardwareTypesData])

  // Keep gpus_per_container <= max_gpus
  useEffect(() => {
    if (!hardwareId) return
    const hw = hardwareOptions.find((x) => x.value === hardwareId)
    if (!hw) return
    const max =
      Number.isFinite(hw.max_gpus) && hw.max_gpus > 0 ? hw.max_gpus : 1
    if (gpuCount > max) {
      form.setValue('gpus_per_container', max)
    }
  }, [hardwareId, hardwareOptions, gpuCount, form])

  const { data: replicasData, isLoading: isLoadingReplicas } = useQuery({
    queryKey: ['deployment-available-replicas', hardwareId, gpuCount],
    queryFn: () =>
      getAvailableReplicas({
        hardware_id: hardwareId,
        gpu_count: gpuCount,
      }),
    enabled: open && Boolean(hardwareId) && gpuCount > 0,
  })

  const locationOptions = useMemo(() => {
    const replicas = replicasData?.data?.replicas || []
    if (!Array.isArray(replicas)) return []
    const map = new Map<string, { label: string; value: string }>()
    replicas.forEach((r: Record<string, unknown>) => {
      const id = (r?.location_id ??
        (r?.location as Record<string, unknown>)?.id) as string | undefined
      if (id === null || id === undefined) return
      const name = (r?.location_name ??
        (r?.location as Record<string, unknown>)?.name ??
        r?.name ??
        String(id)) as string
      const key = String(id)
      if (!map.has(key)) {
        map.set(key, { label: String(name), value: key })
      }
    })
    return Array.from(map.values())
  }, [replicasData])

  const { data: priceData, isFetching: isLoadingPrice } = useQuery({
    queryKey: [
      'deployment-price',
      hardwareId,
      gpuCount,
      durationHours,
      replicaCount,
      locationIds,
      currency,
    ],
    queryFn: () =>
      estimatePrice({
        location_ids: locationIds,
        hardware_id: hardwareId,
        gpus_per_container: gpuCount,
        duration_hours: durationHours,
        replica_count: replicaCount,
        currency: currency || 'usdc',
      }),
    enabled:
      open &&
      Boolean(hardwareId) &&
      gpuCount > 0 &&
      durationHours > 0 &&
      replicaCount > 0 &&
      locationIds.length > 0,
  })

  const { data: nameCheckData, isFetching: isCheckingName } = useQuery({
    queryKey: ['deployment-name-check', resourceName],
    queryFn: async () => {
      const name = (resourceName || '').trim()
      if (!name) return null
      return await checkClusterNameAvailability(name)
    },
    enabled: open && Boolean(resourceName && resourceName.trim().length > 0),
    staleTime: 10_000,
  })

  const nameAvailable =
    nameCheckData?.success === true ? nameCheckData?.data?.available : undefined

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const env =
        values.env_json && values.env_json.trim()
          ? (JSON.parse(values.env_json) as Record<string, unknown>)
          : undefined
      const secretEnv =
        values.secret_env_json && values.secret_env_json.trim()
          ? (JSON.parse(values.secret_env_json) as Record<string, unknown>)
          : undefined

      const envVariables =
        env && typeof env === 'object' && !Array.isArray(env)
          ? (Object.fromEntries(
              Object.entries(env).map(([k, v]) => [k, String(v)])
            ) as Record<string, string>)
          : undefined

      const secretEnvVariables =
        secretEnv && typeof secretEnv === 'object' && !Array.isArray(secretEnv)
          ? (Object.fromEntries(
              Object.entries(secretEnv).map(([k, v]) => [k, String(v)])
            ) as Record<string, string>)
          : undefined

      const gpusPerContainer = Number(values.gpus_per_container)
      const durationHoursVal = Number(values.duration_hours)
      const replicaCountVal = Number(values.replica_count)

      const entrypoint = values.entrypoint
        ? values.entrypoint
            .split(' ')
            .map((x) => x.trim())
            .filter(Boolean)
        : undefined

      const args = values.args
        ? values.args
            .split(' ')
            .map((x) => x.trim())
            .filter(Boolean)
        : undefined

      const location_ids = (values.location_ids || [])
        .map((x) => Number(x))
        .filter((n) => Number.isInteger(n) && n > 0)

      const payload = {
        resource_private_name: values.resource_private_name.trim(),
        duration_hours: Number.isFinite(durationHoursVal)
          ? durationHoursVal
          : 1,
        gpus_per_container: Number.isFinite(gpusPerContainer)
          ? gpusPerContainer
          : 1,
        hardware_id: Number(values.hardware_id),
        location_ids,
        container_config: {
          replica_count: Number.isFinite(replicaCountVal) ? replicaCountVal : 1,
          traffic_port: Number.isFinite(trafficPort)
            ? trafficPort
            : DEFAULT_TRAFFIC_PORT,
          ...(entrypoint?.length ? { entrypoint } : {}),
          ...(args?.length ? { args } : {}),
          ...(envVariables ? { env_variables: envVariables } : {}),
          ...(secretEnvVariables
            ? { secret_env_variables: secretEnvVariables }
            : {}),
        },
        registry_config: {
          image_url: values.image_url,
          ...(values.registry_username?.trim()
            ? { registry_username: values.registry_username.trim() }
            : {}),
          ...(values.registry_secret?.trim()
            ? { registry_secret: values.registry_secret.trim() }
            : {}),
        },
      }

      return await createDeployment(payload)
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(t('Deployment created successfully'))
        queryClient.invalidateQueries({
          queryKey: deploymentsQueryKeys.lists(),
        })
        onOpenChange(false)
        return
      }
      toast.error(data?.message || t('Failed to create deployment'))
    },
    onError: (err: Error) => {
      toast.error(err.message || t('Failed to create deployment'))
    },
  })

  // Reset form when opening
  useEffect(() => {
    if (!open) return
    form.reset({
      resource_private_name: '',
      image_url: BUILTIN_IMAGE,
      traffic_port: DEFAULT_TRAFFIC_PORT,
      hardware_id: '',
      gpus_per_container: 1,
      location_ids: [],
      replica_count: 1,
      duration_hours: 1,
      env_json: '',
      secret_env_json: '',
      entrypoint: '',
      args: '',
      registry_username: '',
      registry_secret: '',
      currency: 'usdc',
    })
  }, [open, form])

  // Whether the inputs are complete enough for a price estimate request. Mirror
  // the `enabled` predicate of the price query so we can decide when to show the
  // empty-state hint vs. the result.
  const priceQueryEnabled =
    Boolean(hardwareId) &&
    gpuCount > 0 &&
    durationHours > 0 &&
    replicaCount > 0 &&
    locationIds.length > 0

  // Structured estimate for the Price estimation panel (B1: previously computed
  // then discarded via `void priceSummary`). The backend returns
  // `estimated_cost` + `currency` with a nested `price_breakdown` (total_cost,
  // hourly_rate); we read both the top-level and breakdown shapes defensively.
  const priceSummary = useMemo(() => {
    const est = priceData?.data as Record<string, unknown> | undefined
    if (!est || typeof est !== 'object') return null

    const breakdown =
      (est.price_breakdown as Record<string, unknown> | undefined) ?? undefined

    const totalRaw =
      est.total_cost ?? est.total ?? est.estimated_cost ?? breakdown?.total_cost
    const hourlyRaw = breakdown?.hourly_rate ?? est.hourly_rate
    const currencyRaw = est.currency ?? breakdown?.currency ?? ''

    const total =
      typeof totalRaw === 'number'
        ? totalRaw
        : totalRaw === undefined || totalRaw === null || totalRaw === ''
          ? undefined
          : Number(totalRaw)
    const hourly =
      typeof hourlyRaw === 'number'
        ? hourlyRaw
        : hourlyRaw === undefined || hourlyRaw === null || hourlyRaw === ''
          ? undefined
          : Number(hourlyRaw)
    const currencyLabel = String(currencyRaw || '').toUpperCase()

    if (total === undefined || !Number.isFinite(total)) return null

    return {
      total,
      hourly:
        hourly !== undefined && Number.isFinite(hourly) ? hourly : undefined,
      currency: currencyLabel,
    }
  }, [priceData])

  const formatMoney = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })

  const onInvalid: SubmitErrorHandler<FormValues> = () => {
    toast.error(t('Please fix the highlighted fields before saving'))
  }

  return (
    <DrawerShell
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          form.reset()
        }
      }}
      size='md'
      ariaTitle={t('Create deployment')}
      ariaDescription={t('Configure and deploy a new container instance.')}
    >
      <DrawerHeader
        title={t('Create deployment')}
        description={t('Configure and deploy a new container instance.')}
        icon={<Rocket className='size-4' />}
      />

      <Form {...form}>
        <DrawerBody
          asForm
          formProps={{
            id: 'deployment-form',
            onSubmit: form.handleSubmit(
              (values) => createMutation.mutate(values),
              onInvalid
            ),
          }}
        >
          {/* Basic Configuration — fields and validation are untouched. */}
          <DrawerSection
            variant='card'
            eyebrow={t('basic')}
            title={t('Basic Configuration')}
          >
            <div className='flex flex-col gap-4'>
              <FormField
                control={form.control}
                name='resource_private_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Container name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('Enter a name')} {...field} />
                    </FormControl>
                    {open && field.value?.trim() ? (
                      <div className='text-muted-foreground text-xs'>
                        {isCheckingName
                          ? t('Checking name...')
                          : nameAvailable === true
                            ? t('Name is available')
                            : nameAvailable === false
                              ? t('Name is not available')
                              : ''}
                      </div>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='image_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Image')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </DrawerSection>

          {/* Resource Configuration */}
          <DrawerSection
            variant='card'
            eyebrow={t('hardware')}
            title={t('Resource Configuration')}
          >
            <div className='flex flex-col gap-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='hardware_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Hardware type')}</FormLabel>
                      <Select
                        items={[
                          ...hardwareOptions.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                          })),
                        ]}
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                        disabled={isLoadingHardware}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder={t('Select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {hardwareOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='location_ids'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Deployment location')}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={locationOptions}
                        selected={(field.value || []) as string[]}
                        onChange={(vals) => {
                          if (isLoadingReplicas || !hardwareId) return
                          field.onChange(vals)
                        }}
                        placeholder={
                          isLoadingReplicas
                            ? t('Loading...')
                            : t('Select locations')
                        }
                        className={
                          isLoadingReplicas || !hardwareId
                            ? 'pointer-events-none opacity-60'
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='gpus_per_container'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('GPU count')}</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          value={toNumber(field.value, gpuCount)}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? 0 : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='replica_count'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Replica count')}</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          value={toNumber(field.value, replicaCount)}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? 0 : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='duration_hours'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Duration (hours)')}</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          value={toNumber(field.value, durationHours)}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? 0 : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='traffic_port'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Port')}</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          value={toNumber(field.value, trafficPort)}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? 0 : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </DrawerSection>

          {/* Price Estimation */}
          <DrawerSection
            variant='card'
            eyebrow={t('duration')}
            title={t('Price estimation')}
          >
            <div className='flex flex-col gap-4'>
              <p className='text-muted-foreground text-xs'>
                {t('Price estimation description')}
              </p>

              <FormField
                control={form.control}
                name='currency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Billing currency')}</FormLabel>
                    <Select
                      items={[
                        { value: 'usdc', label: 'USDC' },
                        { value: 'iocoin', label: 'IOCOIN' },
                      ]}
                      value={field.value || 'usdc'}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={t('Select')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          <SelectItem value='usdc'>USDC</SelectItem>
                          <SelectItem value='iocoin'>IOCOIN</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* B1: render the estimate (total + per-unit) that was
                    previously computed then discarded. */}
              <div className='border-border/60 bg-muted/30 flex flex-col gap-2 rounded-md border p-3'>
                {isLoadingPrice ? (
                  <div className='flex flex-col gap-2'>
                    <Skeleton className='h-5 w-32' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                ) : priceSummary ? (
                  <>
                    <div className='flex items-baseline justify-between gap-3'>
                      <span className='text-muted-foreground text-sm'>
                        {t('Estimated total')}
                      </span>
                      <span className='text-foreground text-base font-semibold tabular-nums'>
                        {formatMoney(priceSummary.total)}
                        {priceSummary.currency
                          ? ` ${priceSummary.currency}`
                          : ''}
                      </span>
                    </div>
                    {priceSummary.hourly !== undefined ? (
                      <div className='flex items-baseline justify-between gap-3'>
                        <span className='text-muted-foreground text-xs'>
                          {t('Per hour')}
                        </span>
                        <span className='text-muted-foreground text-xs tabular-nums'>
                          {formatMoney(priceSummary.hourly)}
                          {priceSummary.currency
                            ? ` ${priceSummary.currency}`
                            : ''}
                          {t('/hr')}
                        </span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className='text-muted-foreground text-xs'>
                    {priceQueryEnabled
                      ? t('Estimate unavailable for the current selection.')
                      : t(
                          'Select hardware, locations, and duration to see an estimate.'
                        )}
                  </p>
                )}
              </div>
            </div>
          </DrawerSection>

          {/* Advanced Configuration */}
          <DrawerSection
            variant='card'
            eyebrow={t('advanced')}
            title={t('Advanced Configuration')}
          >
            <div className='flex flex-col gap-4'>
              <p className='text-muted-foreground text-xs'>
                {t('Optional settings for advanced container configuration.')}
              </p>

              <div className='flex flex-col gap-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='entrypoint'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('Entrypoint (space separated)')}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='bash -lc' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='args'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Args (space separated)')}</FormLabel>
                        <FormControl>
                          <Input placeholder='--foo bar' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='env_json'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Environment variables (JSON)')}</FormLabel>
                      <FormControl>
                        <Textarea
                          className='min-h-24 font-mono text-xs'
                          placeholder='{"KEY":"VALUE"}'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='secret_env_json'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('Secret environment variables (JSON)')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className='min-h-24 font-mono text-xs'
                          placeholder='{"SECRET":"VALUE"}'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='registry_username'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Registry username')}</FormLabel>
                        <FormControl>
                          <Input autoComplete='off' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='registry_secret'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Registry secret')}</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </DrawerSection>
        </DrawerBody>
      </Form>

      <DrawerFooter
        isSubmitting={createMutation.isPending}
        submitLabel={t('Create')}
        submittingLabel={t('Submitting...')}
        onCancel={() => onOpenChange(false)}
        cancelLabel={t('Cancel')}
        formId='deployment-form'
      />
    </DrawerShell>
  )
}
