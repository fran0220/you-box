import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'

const MODALITY_GROUPS: Array<{
  label: string
  vendors: Array<{ name: string; icon: string }>
}> = [
  {
    label: 'Image',
    vendors: [
      { name: 'Midjourney', icon: 'Midjourney' },
      { name: 'FLUX', icon: 'Flux' },
      { name: 'Stability AI', icon: 'Stability.Color' },
      { name: 'Ideogram', icon: 'Ideogram' },
      { name: 'Recraft', icon: 'Recraft' },
      { name: 'Krea', icon: 'Krea' },
      { name: 'Jimeng', icon: 'Jimeng.Color' },
    ],
  },
  {
    label: 'Video',
    vendors: [
      { name: 'Kling', icon: 'Kling.Color' },
      { name: 'Vidu', icon: 'Vidu.Color' },
      { name: 'Runway', icon: 'Runway' },
      { name: 'Luma', icon: 'Luma.Color' },
      { name: 'Pika', icon: 'Pika' },
      { name: 'Hailuo', icon: 'Hailuo.Color' },
    ],
  },
  {
    label: 'Audio',
    vendors: [
      { name: 'Suno', icon: 'Suno' },
      { name: 'Udio', icon: 'Udio.Color' },
      { name: 'ElevenLabs', icon: 'ElevenLabs' },
      { name: 'Fish Audio', icon: 'FishAudio' },
    ],
  },
  {
    label: '3D',
    vendors: [
      { name: 'Tripo', icon: 'Tripo.Color' },
      { name: 'Meshy', icon: 'Meshy.Color' },
    ],
  },
]

/** Generative-media wall — editorial hairline rows grouped by modality. */
export function Modalities() {
  const { t } = useTranslation()

  return (
    <section className='border-border/70 border-t py-14 md:py-20'>
      <div className='mx-auto w-full max-w-6xl px-4 md:px-6'>
        <p className='yb-eyebrow mb-4'>{t('Beyond text')}</p>
        <h2 className='font-display max-w-[16em] text-3xl leading-[1.1] font-normal md:text-4xl'>
          {t('Image, video, audio, and 3D')}
        </h2>
        <p className='text-muted-foreground mt-4 max-w-[36em] text-base leading-relaxed'>
          {t(
            'The same key and balance also drive generative media models, with no separate account per vendor.'
          )}
        </p>

        <div className='border-border/70 mt-10 border-t'>
          {MODALITY_GROUPS.map((group) => (
            <div
              key={group.label}
              className='border-border/70 flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-baseline sm:gap-6'
            >
              <h3 className='text-muted-foreground w-24 shrink-0 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase'>
                {t(group.label)}
              </h3>
              <ul className='flex flex-wrap gap-x-7 gap-y-3'>
                {group.vendors.map((vendor) => (
                  <li
                    key={vendor.name}
                    className='text-muted-foreground hover:text-foreground flex items-center gap-2 text-[13px] font-medium transition-colors'
                  >
                    <span className='shrink-0' aria-hidden='true'>
                      {getLobeIcon(vendor.icon, 18)}
                    </span>
                    {vendor.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
