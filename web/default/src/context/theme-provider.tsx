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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  applyResolvedThemeToDom,
  resolveThemeMode,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme-mode'
import { useProductStore } from '@/products'

export type Theme = ThemePreference
export type { ResolvedTheme }

export const THEME_STORAGE_KEY = 'yb-ui-theme'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  defaultTheme: Theme
  resolvedTheme: ResolvedTheme
  theme: Theme
  setTheme: (theme: Theme) => void
  resetTheme: () => void
  /** False when the active product forces light-only (e.g. origingame Paper). */
  darkModeEnabled: boolean
}

const DEFAULT_THEME: Theme = 'system'

const initialState: ThemeProviderState = {
  defaultTheme: DEFAULT_THEME,
  resolvedTheme: 'light',
  theme: DEFAULT_THEME,
  setTheme: () => null,
  resetTheme: () => null,
  darkModeEnabled: false,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

function readStoredTheme(storageKey: string, fallback: Theme): Theme {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    /* empty */
  }
  return fallback
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const darkModeEnabled = useProductStore((s) => s.profile.ui.darkMode)
  const [theme, setThemeState] = useState<Theme>(() =>
    readStoredTheme(storageKey, defaultTheme)
  )

  const resolvedTheme = useMemo(
    () => resolveThemeMode(theme, darkModeEnabled),
    [theme, darkModeEnabled]
  )

  useEffect(() => {
    applyResolvedThemeToDom(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (!darkModeEnabled || theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      applyResolvedThemeToDom(resolveThemeMode('system', true))
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [darkModeEnabled, theme])

  const setTheme = useCallback(
    (next: Theme) => {
      if (!darkModeEnabled && next !== 'light') {
        setThemeState('light')
        try {
          window.localStorage.setItem(storageKey, 'light')
        } catch {
          /* empty */
        }
        return
      }
      setThemeState(next)
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        /* empty */
      }
    },
    [darkModeEnabled, storageKey]
  )

  const resetTheme = useCallback(() => {
    setTheme(defaultTheme)
  }, [defaultTheme, setTheme])

  const contextValue = useMemo(
    () => ({
      defaultTheme,
      resolvedTheme,
      theme: darkModeEnabled ? theme : 'light',
      setTheme,
      resetTheme,
      darkModeEnabled,
    }),
    [
      defaultTheme,
      resolvedTheme,
      theme,
      setTheme,
      resetTheme,
      darkModeEnabled,
    ]
  )

  return <ThemeContext value={contextValue}>{children}</ThemeContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
