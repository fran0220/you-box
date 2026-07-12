/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useMemo, useState } from 'react'
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { CopyIcon, DownloadIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  CellFlex,
  DataTablePage,
  FilterBar,
  FilterBarSearch,
  FilterTabs,
  LatencyBadge,
  MonoCell,
  RowActionButton,
  RowActions,
} from '@/components/data-table'
import { StatCard, StatCardRow } from '@/components/patterns'
import { DemoBlock, DemoRow } from '../components/demo-block'

type DemoChannel = {
  id: number
  name: string
  type: string
  logo: string
  models: number
  priority: number
  balance: string
  latencyMs: number | null
  enabled: boolean
}

const ROWS: DemoChannel[] = [
  {
    id: 1,
    name: 'Anthropic Direct',
    type: 'anthropic',
    logo: 'AN',
    models: 38,
    priority: 1,
    balance: '$4,210',
    latencyMs: 450,
    enabled: true,
  },
  {
    id: 2,
    name: 'OpenAI Direct',
    type: 'openai',
    logo: 'OA',
    models: 44,
    priority: 1,
    balance: '$2,880',
    latencyMs: 360,
    enabled: true,
  },
  {
    id: 3,
    name: 'Google Vertex',
    type: 'gemini',
    logo: 'GO',
    models: 52,
    priority: 2,
    balance: '$1,940',
    latencyMs: 580,
    enabled: true,
  },
  {
    id: 4,
    name: 'Azure OpenAI',
    type: 'openai',
    logo: 'AZ',
    models: 40,
    priority: 3,
    balance: '$640',
    latencyMs: 1840,
    enabled: false,
  },
  {
    id: 5,
    name: 'Together AI',
    type: 'openai',
    logo: 'TG',
    models: 120,
    priority: 4,
    balance: '$210',
    latencyMs: 4200,
    enabled: false,
  },
]

type TabValue = 'all' | 'enabled' | 'issues'

function buildColumns(
  onToggle: (id: number) => void
): ColumnDef<DemoChannel, unknown>[] {
  return [
    {
      id: 'select',
      size: 32,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label='Select row'
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Channel',
      cell: ({ row }) => (
        <CellFlex
          leading={
            <Avatar className='size-7'>
              <AvatarFallback className='font-display text-[10px] font-semibold'>
                {row.original.logo}
              </AvatarFallback>
            </Avatar>
          }
          primary={row.original.name}
          secondary={row.original.type}
        />
      ),
    },
    {
      accessorKey: 'models',
      header: 'Models',
      cell: ({ row }) => (
        <Badge variant='outline'>{row.original.models} models</Badge>
      ),
    },
    {
      accessorKey: 'priority',
      header: () => <div className='text-right'>Priority</div>,
      cell: ({ row }) => <MonoCell>{row.original.priority}</MonoCell>,
    },
    {
      accessorKey: 'balance',
      header: () => <div className='text-right'>Balance</div>,
      cell: ({ row }) => <MonoCell>{row.original.balance}</MonoCell>,
    },
    {
      accessorKey: 'latencyMs',
      header: 'Latency',
      cell: ({ row }) => <LatencyBadge ms={row.original.latencyMs} />,
    },
    {
      accessorKey: 'enabled',
      header: 'Enabled',
      cell: ({ row }) => (
        <Switch
          size='sm'
          checked={row.original.enabled}
          onCheckedChange={() => onToggle(row.original.id)}
          aria-label={`Toggle ${row.original.name}`}
        />
      ),
    },
    {
      id: 'actions',
      size: 110,
      cell: () => (
        <RowActions>
          <RowActionButton label='Copy'>
            <CopyIcon />
          </RowActionButton>
          <RowActionButton label='Edit'>
            <PencilIcon />
          </RowActionButton>
          <RowActionButton label='Delete' className='hover:text-destructive'>
            <Trash2Icon />
          </RowActionButton>
        </RowActions>
      ),
    },
  ]
}

export default function TableDemos() {
  const [rows, setRows] = useState(ROWS)
  const [tab, setTab] = useState<TabValue>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [empty, setEmpty] = useState(false)

  const filtered = useMemo(() => {
    let data = empty ? [] : rows
    if (tab === 'enabled') data = data.filter((r) => r.enabled)
    if (tab === 'issues')
      data = data.filter((r) => r.latencyMs == null || r.latencyMs > 1000)
    if (search)
      data = data.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    return data
  }, [rows, tab, search, empty])

  const columns = useMemo(
    () =>
      buildColumns((id) =>
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
        )
      ),
    []
  )

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className='flex flex-col gap-4'>
      <DemoBlock
        title='Table v2'
        description='stat header → FilterBar (tabs + search + actions) → columns: CellFlex / tag / MonoCell / LatencyBadge / inline Switch / hover RowActions'
        bleed
      >
        <div className='p-4'>
          <div className='mb-4 flex flex-wrap items-center gap-5'>
            <Label className='flex items-center gap-2 text-xs'>
              <Switch
                size='sm'
                checked={loading}
                onCheckedChange={setLoading}
              />
              loading
            </Label>
            <Label className='flex items-center gap-2 text-xs'>
              <Switch size='sm' checked={empty} onCheckedChange={setEmpty} />
              empty
            </Label>
          </div>
          <DataTablePage
            table={table}
            columns={columns}
            isLoading={loading}
            emptyTitle='No channels found'
            emptyDescription='Adjust filters or add a channel.'
            paginationInFooter={false}
            showPagination={false}
            stickyActions
            statHeader={
              <StatCardRow columns={4}>
                <StatCard size='sm' label='Total channels' value='34' />
                <StatCard size='sm' label='Healthy' value='31' />
                <StatCard size='sm' label='Degraded' value='2' />
                <StatCard size='sm' label='Offline' value='1' />
              </StatCardRow>
            }
            toolbar={
              <FilterBar
                search={
                  <FilterBarSearch
                    placeholder='Filter channels'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label='Filter channels'
                  />
                }
                actions={
                  <>
                    <Button variant='outline' size='sm'>
                      <DownloadIcon data-icon='inline-start' /> Export
                    </Button>
                    <Button size='sm'>Add channel</Button>
                  </>
                }
              >
                <FilterTabs<TabValue>
                  label='Filter by status'
                  value={tab}
                  onValueChange={setTab}
                  items={[
                    { value: 'all', label: 'All', count: rows.length },
                    {
                      value: 'enabled',
                      label: 'Enabled',
                      count: rows.filter((r) => r.enabled).length,
                    },
                    {
                      value: 'issues',
                      label: 'Issues',
                      count: rows.filter(
                        (r) => r.latencyMs == null || r.latencyMs > 1000
                      ).length,
                    },
                  ]}
                />
              </FilterBar>
            }
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title='Cell primitives'
        description='isolated states for MonoCell / CellFlex / LatencyBadge / RowActions'
      >
        <DemoRow label='MonoCell — right (default) / left / muted'>
          <div className='w-28 rounded border px-2 py-1'>
            <MonoCell>$182.40</MonoCell>
          </div>
          <div className='w-28 rounded border px-2 py-1'>
            <MonoCell align='left'>14:32:08</MonoCell>
          </div>
          <div className='w-28 rounded border px-2 py-1'>
            <MonoCell muted>2m ago</MonoCell>
          </div>
        </DemoRow>
        <DemoRow label='LatencyBadge thresholds — 0.45s / 1.84s / 4.2s / null'>
          <LatencyBadge ms={450} />
          <LatencyBadge ms={1840} />
          <LatencyBadge ms={4200} />
          <LatencyBadge ms={null} />
        </DemoRow>
        <DemoRow label='RowActions — alwaysVisible'>
          <RowActions alwaysVisible>
            <RowActionButton label='Copy'>
              <CopyIcon />
            </RowActionButton>
            <RowActionButton label='Edit'>
              <PencilIcon />
            </RowActionButton>
          </RowActions>
        </DemoRow>
      </DemoBlock>
    </div>
  )
}
