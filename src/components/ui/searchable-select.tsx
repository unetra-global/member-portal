"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"

export type Option = { value: string; label: string; icon?: React.ReactNode; keywords?: string[] }

interface SearchableSelectProps {
  id?: string
  className?: string
  options: Option[]
  value: string // test
  placeholder?: string
  searchPlaceholder?: string
  onChange: (value: string) => void
  disabled?: boolean
  // Controls how the selected chip displays: label (default) or value (e.g., "+91")
  displayField?: "label" | "value"
  // If true, the main field itself is a search input
  inlineSearch?: boolean
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
  displayField = "label",
  inlineSearch = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [highlight, setHighlight] = React.useState<number>(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = React.useState<string>("")
  const [isTyping, setIsTyping] = React.useState<boolean>(false)

  const selected = React.useMemo(() => options.find(o => o.value === value), [options, value])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    const qAlpha = q.replace(/[^a-z]/gi, "")
    const qDigits = q.replace(/[^0-9+]/g, "")
    const isDigitQuery = !!qDigits
    if (isDigitQuery) {
      const normalized = qDigits.startsWith("+") ? qDigits : `+${qDigits}`
      const exact = options.filter(o => {
        const valueDigits = (o.value || "").replace(/[^0-9+]/g, "")
        const labelDigits = o.label.match(/\(\+\d+\)/)?.[0] || ""
        return valueDigits === normalized || labelDigits === `(${normalized})`
      })
      if (exact.length > 0) return exact
      // Fallback to prefix match (avoid broad substring matches)
      return options.filter(o => {
        const valueDigits = (o.value || "").replace(/[^0-9+]/g, "")
        return valueDigits.startsWith(normalized)
      })
    }
    // Alpha query: match label and keywords
    return options.filter(o => {
      const inAlphaLabel = o.label.toLowerCase().includes(qAlpha)
      const inAlphaKeywords = (o.keywords || []).some(k => (k || "").toLowerCase().includes(qAlpha))
      return inAlphaLabel || inAlphaKeywords
    })
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

  const onKeyDown = (e: React.KeyboardEvent<any>) => {
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

  // Sync displayed input text with selected option when not typing
  React.useEffect(() => {
    const display = selected ? (displayField === "value" ? selected.value : selected.label) : ""
    if (!isTyping) setInputValue(display)
  }, [selected?.value, selected?.label, displayField, isTyping])

  const commitSelection = (val: string) => {
    onChange(val)
    setOpen(false)
    setIsTyping(false)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {inlineSearch ? (
        <div className={cn(
          "flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm",
          disabled && "cursor-not-allowed opacity-50"
        )}>
          {selected?.icon && <span className="text-lg">{selected.icon}</span>}
          <Input
            id={id}
            value={inputValue}
            onChange={(e)=>{ setIsTyping(true); setInputValue(e.target.value); setQuery(e.target.value); setHighlight(0); if (!open) setOpen(true) }}
            onFocus={()=>{ setOpen(true); setHighlight(0) }}
            onKeyDown={onKeyDown}
            placeholder={selected ? (displayField === "value" ? selected.value : selected.label) : placeholder}
            disabled={disabled}
            className="border-0 px-0 focus-visible:ring-0"
          />
          <ChevronDown className="h-4 w-4 opacity-70" />
        </div>
      ) : (
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
            <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected ? (displayField === "value" ? selected.value : selected.label) : placeholder}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
      )}

      {open && (
        <div
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 mt-1 z-50 rounded-md border bg-background shadow-lg"
        >
          {!inlineSearch && (
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
          )}
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
                  onClick={() => commitSelection(o.value)}
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