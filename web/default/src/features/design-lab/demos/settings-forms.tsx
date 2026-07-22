import { useState } from 'react'
import {
  Bell,
  Box,
  CreditCard,
  Grid2X2,
  Landmark,
  Lock,
  Settings,
  Shield,
  Table2,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Chip,
  ChipGroup,
  CurrencyInput,
  MonoInput,
  ParameterSlider,
  SegmentedControl,
  ThresholdInput,
} from '@/components/patterns'
import {
  SettingRow,
  SettingsPanel,
  SettingsRail,
  StickySaveBar,
} from '@/components/settings'
import { DemoBlock, DemoRow } from '../components/demo-block'

const RAIL_ITEMS = [
  { value: 'general', label: 'General', icon: <Settings /> },
  { value: 'auth', label: 'Authentication', icon: <Shield /> },
  { value: 'billing', label: 'Billing & pricing', icon: <CreditCard /> },
  { value: 'models', label: 'Models & routing', icon: <Box /> },
  { value: 'security', label: 'Security', icon: <Lock /> },
  { value: 'notif', label: 'Notifications', icon: <Bell /> },
]

export default function SettingsFormsDemos() {
  const [rail, setRail] = useState('general')
  const [registrations, setRegistrations] = useState(true)
  const [invite, setInvite] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preset, setPreset] = useState<string | null>('50')
  const [pay, setPay] = useState<string | null>('card')
  const [filters, setFilters] = useState<string[]>(['billing'])
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [priceMode, setPriceMode] = useState('standard')
  const [viewMode, setViewMode] = useState('card')

  return (
    <div className='flex flex-col gap-4'>
      <DemoBlock
        title='SettingsRail + SettingsPanel + SettingRow'
        description='220px sticky rail (horizontal strip on mobile); panel = eyebrow group + rows; disabled follows a parent toggle'
      >
        <div className='flex flex-col gap-6 lg:flex-row'>
          <SettingsRail
            items={RAIL_ITEMS}
            value={rail}
            onValueChange={setRail}
            label='Settings sections'
            className='lg:top-2'
          />
          <div className='min-w-0 flex-1'>
            <SettingsPanel eyebrow='access' title='Registration & access'>
              <SettingRow
                label='Allow new registrations'
                description='Let anyone create an account.'
                control={
                  <Switch
                    checked={registrations}
                    onCheckedChange={(v) => {
                      setRegistrations(v)
                      setDirty(true)
                    }}
                    aria-label='Allow new registrations'
                  />
                }
              />
              <SettingRow
                label='Invite-only mode'
                description='Disable public signup; require an invite code.'
                disabled={!registrations}
                control={
                  <Switch
                    checked={invite}
                    onCheckedChange={(v) => {
                      setInvite(v)
                      setDirty(true)
                    }}
                    aria-label='Invite-only mode'
                  />
                }
              />
              <SettingRow
                label='Free signup credit'
                description='Granted once on registration.'
                control={
                  <MonoInput
                    prefix='$'
                    defaultValue='5.00'
                    onChange={() => setDirty(true)}
                    containerClassName='w-32'
                    aria-label='Free signup credit'
                  />
                }
              />
              <SettingRow
                label='Default language'
                description='New users start in this language.'
                control={
                  <Select defaultValue='zh'>
                    <SelectTrigger
                      className='w-40'
                      aria-label='Default language'
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='zh'>简体中文</SelectItem>
                      <SelectItem value='en'>English</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
            </SettingsPanel>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title='StickySaveBar'
        description='appears while dirty; Discard resets, Save shows the spinner'
      >
        <DemoRow
          label='toggle any control above to dirty the form'
          className='block'
        >
          <div className='relative h-20 overflow-hidden rounded-md border'>
            <div className='text-muted-foreground p-3 text-xs'>
              page content…
            </div>
            <StickySaveBar
              dirty={dirty}
              saving={saving}
              onDiscard={() => setDirty(false)}
              onSave={() => {
                setSaving(true)
                setTimeout(() => {
                  setSaving(false)
                  setDirty(false)
                }, 900)
              }}
              className='mx-0 sm:mx-0'
            />
          </div>
        </DemoRow>
      </DemoBlock>

      <DemoBlock
        title='ChipGroup / PresetChip'
        description='single-select presets (arrow keys), payment methods with icons, multi-select filters'
      >
        <DemoRow label='amount presets — size=preset, single'>
          <ChipGroup
            value={preset}
            onValueChange={setPreset}
            label='Top-up amount'
          >
            {['10', '25', '50', '100'].map((amount) => (
              <Chip key={amount} value={amount} size='preset'>
                ${amount}
              </Chip>
            ))}
          </ChipGroup>
        </DemoRow>
        <DemoRow label='pay with — single + icons + disabled'>
          <ChipGroup value={pay} onValueChange={setPay} label='Payment method'>
            <Chip value='card'>
              <CreditCard /> Card
            </Chip>
            <Chip value='wallet'>
              <Wallet /> 支付宝 / 微信
            </Chip>
            <Chip value='bank' disabled>
              <Landmark /> Bank
            </Chip>
          </ChipGroup>
        </DemoRow>
        <DemoRow label='multi-select filters'>
          <ChipGroup
            type='multiple'
            value={filters}
            onValueChange={(v) =>
              setFilters((prev) =>
                prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
              )
            }
            label='Notification filters'
          >
            <Chip value='billing'>Billing</Chip>
            <Chip value='system'>System</Chip>
            <Chip value='usage'>Usage</Chip>
          </ChipGroup>
        </DemoRow>
      </DemoBlock>

      <DemoBlock
        title='SegmentedControl'
        description='role=group + aria-pressed toggle buttons; text options or icon-only options with tooltips'
      >
        <DemoRow label='text options — price display mode'>
          <SegmentedControl
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'recharge', label: 'Recharge' },
            ]}
            value={priceMode}
            onChange={setPriceMode}
            ariaLabel='Price display mode'
          />
        </DemoRow>
        <DemoRow label='icon options + tooltips — view mode'>
          <SegmentedControl
            options={[
              { value: 'card', icon: Grid2X2, tooltip: 'Card view' },
              { value: 'table', icon: Table2, tooltip: 'Table view' },
            ]}
            value={viewMode}
            onChange={setViewMode}
            ariaLabel='View mode'
          />
        </DemoRow>
      </DemoBlock>

      <DemoBlock
        title='ParameterSlider'
        description='label + mono readout + filled track; keyboard arrows; disabled'
      >
        <div className='flex max-w-sm flex-col gap-5'>
          <ParameterSlider
            label='Temperature'
            value={temperature}
            onValueChange={setTemperature}
            min={0}
            max={2}
            step={0.1}
            formatValue={(v) => v.toFixed(1)}
          />
          <ParameterSlider
            label='Max tokens'
            value={maxTokens}
            onValueChange={setMaxTokens}
            min={1}
            max={8192}
            formatValue={(v) => v.toLocaleString()}
          />
          <ParameterSlider
            label='Top P (disabled)'
            value={1}
            onValueChange={() => {}}
            min={0}
            max={1}
            step={0.05}
            formatValue={(v) => v.toFixed(2)}
            disabled
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title='MonoInput / CurrencyInput / ThresholdInput'
        description='mono field with prefix/suffix addons; amount + currency; threshold pair'
      >
        <DemoRow
          label='mono with prefix / suffix'
          className='max-w-md flex-col'
        >
          <MonoInput prefix='$' defaultValue='50.00' aria-label='Amount' />
          <MonoInput suffix='/s' defaultValue='100' aria-label='Rate limit' />
        </DemoRow>
        <DemoRow
          label='currency input + selector'
          className='max-w-md flex-col'
        >
          <CurrencyInput
            defaultValue='50.00'
            aria-label='Top-up amount'
            currency={
              <Select defaultValue='usd'>
                <SelectTrigger className='w-28' aria-label='Currency'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='usd'>USD</SelectItem>
                  <SelectItem value='cny'>CNY</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </DemoRow>
        <DemoRow label='threshold pair (auto top-up form)'>
          <div className='flex max-w-md gap-2.5'>
            <ThresholdInput
              operator='≤ $'
              defaultValue='25'
              aria-label='Threshold'
            />
            <ThresholdInput
              operator='+ $'
              defaultValue='50'
              aria-label='Top-up by'
            />
          </div>
        </DemoRow>
        <DemoRow label='inside a SettingRow' className='block'>
          <div className='max-w-lg rounded-md border px-4'>
            <SettingRow
              label='Global rate limit'
              description='Default ceiling per key, requests per second.'
              control={
                <MonoInput
                  suffix='/s'
                  defaultValue='100'
                  containerClassName='w-28'
                  aria-label='Global rate limit'
                />
              }
            />
          </div>
        </DemoRow>
        <DemoRow label='extra actions' className='block'>
          <Button variant='outline' size='sm' onClick={() => setDirty(true)}>
            Mark form dirty
          </Button>
        </DemoRow>
      </DemoBlock>
    </div>
  )
}
