'use client'

import {
  ReactNode,
  MouseEventHandler,
  UIEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { motion, useInView } from 'motion/react'

interface AnimatedItemProps {
  children: ReactNode
  delay?: number
  index: number
  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
}

const AnimatedItem = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}: AnimatedItemProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.35, once: false })

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-3 cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListProps {
  items?: unknown[]
  onItemSelect?: (item: unknown, index: number) => void
  renderItem?: (item: unknown, index: number, isSelected: boolean) => ReactNode
  getItemKey?: (item: unknown, index: number) => string | number
  showGradients?: boolean
  enableArrowNavigation?: boolean
  className?: string
  itemClassName?: string
  displayScrollbar?: boolean
  initialSelectedIndex?: number
}

export default function AnimatedList({
  items = [],
  onItemSelect,
  renderItem,
  getItemKey,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
}: AnimatedListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex)
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false)
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0)
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1)

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const handleItemClick = useCallback(
    (item: unknown, index: number) => {
      setSelectedIndex(index)
      if (onItemSelect) {
        onItemSelect(item, index)
      }
    },
    [onItemSelect]
  )

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement
    setTopGradientOpacity(Math.min(scrollTop / 60, 1))
    const bottomDistance = scrollHeight - (scrollTop + clientHeight)
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 60, 1))
  }

  useEffect(() => {
    if (!enableArrowNavigation) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault()
        if (onItemSelect) {
          onItemSelect(items[selectedIndex], selectedIndex)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation])

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return

    const container = listRef.current
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null

    if (selectedItem) {
      const extraMargin = 40
      const containerScrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const itemTop = selectedItem.offsetTop
      const itemBottom = itemTop + selectedItem.offsetHeight

      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' })
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth',
        })
      }
    }

    setKeyboardNav(false)
  }, [selectedIndex, keyboardNav])

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className={`max-h-[420px] overflow-y-auto p-2 sm:p-3 ${
          displayScrollbar
            ? '[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-background/40 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-[6px]'
            : 'scrollbar-hide'
        }`}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          scrollbarColor: 'var(--border) transparent',
        }}
      >
        {items.map((item, index) => {
          const isSelected = selectedIndex === index
          const itemKey = getItemKey ? getItemKey(item, index) : index

          return (
          <AnimatedItem
            key={itemKey}
            delay={0.04}
            index={index}
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
          >
            {renderItem ? (
              renderItem(item, index, isSelected)
            ) : (
              <div
                className={`p-3 sm:p-4 border rounded-xl transition-all duration-200 ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-400/50 shadow-[0_0_18px_rgba(16,185,129,0.2)]'
                    : 'bg-card/70 border-emerald-500/20'
                } ${itemClassName}`}
              >
                <p className="text-foreground text-sm sm:text-base m-0 leading-relaxed">{String(item)}</p>
              </div>
            )}
          </AnimatedItem>
          )
        })}
      </div>

      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-[54px] bg-gradient-to-b from-background to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-[72px] bg-gradient-to-t from-background to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  )
}
