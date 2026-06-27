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
import { useState } from 'react'
import { MoreHorizontal, Settings } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getUserAvatarStyle } from '@/lib/avatar'
import { DemoBlock, DemoRow } from '../components/demo-block'

export default function UiPrimitivesDemos() {
  const [checked, setChecked] = useState(true)
  const [sw, setSw] = useState(true)

  return (
    <TooltipProvider>
      <div className='flex flex-col gap-4'>
        <DemoBlock
          title='Button'
          description='primary / secondary / ghost / subtle / destructive; sm / md / lg; icon'
        >
          <DemoRow label='variants'>
            <Button data-design-lab='btn-primary'>Primary</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='ghost'>Ghost</Button>
            <Button variant='subtle'>Subtle</Button>
            <Button variant='destructive'>Danger</Button>
          </DemoRow>
          <DemoRow label='sizes'>
            <Button size='sm'>Small</Button>
            <Button size='default'>Medium</Button>
            <Button size='lg'>Large</Button>
          </DemoRow>
          <DemoRow label='icon (IconButton)'>
            <Button size='icon' variant='ghost' aria-label='Settings'>
              <Settings />
            </Button>
            <Button size='icon-sm' variant='secondary' aria-label='More'>
              <MoreHorizontal />
            </Button>
            <Button size='icon-lg' variant='default' aria-label='Brand icon'>
              <Settings />
            </Button>
          </DemoRow>
          <DemoRow label='states'>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </DemoRow>
        </DemoBlock>

        <DemoBlock title='Input / Textarea / Label' description='field tokens'>
          <DemoRow label='input' className='block max-w-sm'>
            <Label htmlFor='lab-input'>Label</Label>
            <Input
              id='lab-input'
              data-design-lab='input'
              placeholder='Placeholder'
            />
            <Input aria-invalid placeholder='Error state' className='mt-2' />
          </DemoRow>
          <DemoRow label='textarea' className='block max-w-sm'>
            <Textarea data-design-lab='textarea' placeholder='Notes…' rows={3} />
          </DemoRow>
        </DemoBlock>

        <DemoBlock title='Select / Switch / Checkbox'>
          <DemoRow label='select'>
            <Select defaultValue='en'>
              <SelectTrigger className='w-40' data-design-lab='select-trigger'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='en'>English</SelectItem>
                <SelectItem value='zh'>简体中文</SelectItem>
              </SelectContent>
            </Select>
          </DemoRow>
          <DemoRow label='switch + checkbox'>
            <Switch
              checked={sw}
              onCheckedChange={setSw}
              data-design-lab='switch'
            />
            <Checkbox
              checked={checked}
              onCheckedChange={setChecked}
              data-design-lab='checkbox'
            />
          </DemoRow>
        </DemoBlock>

        <DemoBlock title='Badge' description='subtle semantic tints'>
          <DemoRow label='variants'>
            <Badge>Brand</Badge>
            <Badge variant='secondary'>Neutral</Badge>
            <Badge variant='success'>Success</Badge>
            <Badge variant='warning'>Warning</Badge>
            <Badge variant='info'>Info</Badge>
            <Badge variant='destructive'>Danger</Badge>
          </DemoRow>
        </DemoBlock>

        <DemoBlock title='Card / Tabs' description='surface-card + pill/line tabs'>
          <DemoRow label='card' className='block max-w-md'>
            <Card data-design-lab='card'>
              <CardHeader>
                <CardTitle>Card title</CardTitle>
                <CardDescription>Surface card with border tokens.</CardDescription>
              </CardHeader>
              <CardContent>Body content</CardContent>
              <CardFooter>Footer</CardFooter>
            </Card>
          </DemoRow>
          <DemoRow label='tabs pill'>
            <Tabs defaultValue='a'>
              <TabsList data-design-lab='tabs-pill'>
                <TabsTrigger value='a'>Overview</TabsTrigger>
                <TabsTrigger value='b'>Usage</TabsTrigger>
              </TabsList>
              <TabsContent value='a' className='text-muted-foreground text-sm'>
                Panel A
              </TabsContent>
            </Tabs>
          </DemoRow>
          <DemoRow label='tabs line'>
            <Tabs defaultValue='x'>
              <TabsList variant='line' data-design-lab='tabs-line'>
                <TabsTrigger value='x'>Models</TabsTrigger>
                <TabsTrigger value='y'>Keys</TabsTrigger>
              </TabsList>
            </Tabs>
          </DemoRow>
        </DemoBlock>

        <DemoBlock title='Table' description='mono header + divider rows' bleed>
          <Table data-design-lab='table'>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className='text-right'>Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>gpt-4o</TableCell>
                <TableCell className='text-right font-mono'>0.42s</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>claude-sonnet</TableCell>
                <TableCell className='text-right font-mono'>0.51s</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DemoBlock>

        <DemoBlock title='Dialog / Tooltip / Popover / Dropdown'>
          <DemoRow label='overlays'>
            <Dialog>
              <DialogTrigger render={<Button variant='secondary' />}>
                Open dialog
              </DialogTrigger>
              <DialogContent data-design-lab='dialog'>
                <DialogHeader>
                  <DialogTitle>Confirm action</DialogTitle>
                  <DialogDescription>
                    Modal surface uses card tokens and divider footer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant='ghost'>Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Tooltip>
              <TooltipTrigger render={<Button variant='outline' size='sm' />}>
                Tooltip
              </TooltipTrigger>
              <TooltipContent data-design-lab='tooltip'>
                Monochrome hint
              </TooltipContent>
            </Tooltip>
            <Popover>
              <PopoverTrigger render={<Button variant='outline' size='sm' />}>
                Popover
              </PopoverTrigger>
              <PopoverContent data-design-lab='popover'>
                Popover surface
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant='outline' size='sm' />}>
                Menu
              </DropdownMenuTrigger>
              <DropdownMenuContent data-design-lab='dropdown'>
                <DropdownMenuItem>Item one</DropdownMenuItem>
                <DropdownMenuItem>Item two</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DemoRow>
        </DemoBlock>

        <DemoBlock title='Avatar / Skeleton / Pagination'>
          <DemoRow label='avatar sizes'>
            <Avatar size='sm'>
              <AvatarFallback style={getUserAvatarStyle('ab')}>AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback style={getUserAvatarStyle('root')}>R</AvatarFallback>
            </Avatar>
            <Avatar size='lg'>
              <AvatarFallback style={getUserAvatarStyle('youbox')}>YB</AvatarFallback>
            </Avatar>
          </DemoRow>
          <DemoRow label='skeleton'>
            <Skeleton className='h-10 w-48' data-design-lab='skeleton' />
            <Skeleton className='size-9 rounded-md' />
          </DemoRow>
          <DemoRow label='pagination'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href='#' />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href='#' isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href='#'>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href='#' />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </DemoRow>
        </DemoBlock>
      </div>
    </TooltipProvider>
  )
}
