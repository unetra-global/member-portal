"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"

export type Option = { value: string; label: string; icon?: React.ReactNode }

interface SearchableSelectProps {
  id?: string
  className?: string
  options: Option[]
  value: string
  placeholder?: string
  searchPlaceholder?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SearchableSelect({
  id,
  className,
  options,
  value,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  onChange,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [highlight, setHighlight] = React.useState<number>(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selected = React.useMemo(() => options.find(o => o.value === value), [options, value])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight(h => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const opt = filtered[highlight]
      if (opt) {
        onChange(opt.value)
        setOpen(false)
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        onKeyDown={onKeyDown}
      >
        <span className="flex items-center gap-2">
          {selected?.icon && <span className="text-lg">{selected.icon}</span>}
          <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 mt-1 z-50 rounded-md border bg-background shadow-lg"
        >
          <div className="relative p-2 border-b">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <Input
              id={id ? `${id}-search` : undefined}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlight(0) }}
              placeholder={searchPlaceholder}
              className="pl-9"
              disabled={disabled}
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">No results</div>
            )}
            {filtered.map((o, i) => {
              const isSelected = o.value === value
              const isActive = i === highlight
              return (
                <div
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 cursor-pointer",
                    isSelected ? "bg-blue-50" : "",
                    isActive ? "bg-accent" : "hover:bg-accent"
                  )}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => { onChange(o.value); setOpen(false) }}
                >
                  {o.icon && <span className="text-lg">{o.icon}</span>}
                  <span className="text-sm">{o.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}