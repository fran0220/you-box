/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { useMemo } from 'react'
import { Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GroupBadge } from '@/components/group-badge'
import { getAvailableGroups, isTokenBasedModel } from '../lib/model-helpers'
import { formatFixedPrice, formatGroupPrice } from '../lib/price'
import type { PriceType, PricingModel, TokenUnit } from '../types'

type ModelDetailsProvidersProps = {
  model: PricingModel
  groupRatio: Record<string, number>
  usableGroup: Record<string, { desc: string; ratio: number }>
  priceRate: number
  usdExchangeRate: number
  tokenUnit: TokenUnit
  showRechargePrice?: boolean
}

export function ModelDetailsProviders(props: ModelDetailsProvidersProps) {
  const { t } = useTranslation()
  const showRechargePrice = props.showRechargePrice ?? false
  const isTokenBased = isTokenBasedModel(props.model)
  const tokenUnitLabel = props.tokenUnit === 'K' ? '1K' : '1M'

  const availableGroups = useMemo(
    () => getAvailableGroups(props.model, props.usableGroup || {}),
    [props.model, props.usableGroup]
  )

  if (availableGroups.length === 0) return null

  const thClass =
    'text-muted-foreground py-2 text-[10px] font-medium tracking-wider uppercase'

  const renderPrice = (group: string, type: PriceType) =>
    formatGroupPrice(
      props.model,
      group,
      type,
      props.tokenUnit,
      showRechargePrice,
      props.priceRate,
      props.usdExchangeRate,
      props.groupRatio
    )

  return (
    <section>
      <div className='mb-2 flex items-center gap-1.5'>
        <Server className='text-muted-foreground/70 size-3.5' />
        <h3 className='text-foreground text-sm font-semibold'>
          {t('Groups')}
        </h3>
      </div>
      <p className='text-muted-foreground/80 mb-3 text-xs'>
        {t('Usable groups and pricing for this model from the catalog.')}
      </p>

      <div className='-mx-4 overflow-x-auto sm:mx-0'>
        <Table className='text-sm'>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className={thClass}>{t('Group')}</TableHead>
              {isTokenBased ? (
                <>
                  <TableHead className={`${thClass} text-right`}>
                    {t('Input')}
                  </TableHead>
                  <TableHead className={`${thClass} text-right`}>
                    {t('Output')}
                  </TableHead>
                </>
              ) : (
                <TableHead className={`${thClass} text-right`}>
                  {t('Price')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {availableGroups.map((group) => (
              <TableRow key={group}>
                <TableCell className='py-2.5'>
                  <GroupBadge group={group} size='sm' />
                </TableCell>
                {isTokenBased ? (
                  <>
                    <TableCell className='py-2.5 text-right font-mono'>
                      {renderPrice(group, 'input')}
                    </TableCell>
                    <TableCell className='py-2.5 text-right font-mono'>
                      {renderPrice(group, 'output')}
                    </TableCell>
                  </>
                ) : (
                  <TableCell className='py-2.5 text-right font-mono'>
                    {formatFixedPrice(
                      props.model,
                      group,
                      showRechargePrice,
                      props.priceRate,
                      props.usdExchangeRate,
                      props.groupRatio
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isTokenBased ? (
        <p className='text-muted-foreground/40 mt-1.5 px-4 text-[10px] sm:px-0'>
          {t('Prices shown per')} {tokenUnitLabel} {t('tokens')}
        </p>
      ) : null}
    </section>
  )
}
