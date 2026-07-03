import { useEffect, useRef } from 'react'

const DRAG_THRESHOLD = 5

/**
 * Lets a scrollable container be panned by click-and-drag (like a trackpad grab),
 * while still allowing clicks on interactive elements (buttons, chips, etc.) inside it.
 * A click is only suppressed once the pointer has actually moved past the drag threshold.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const drag = { isDown: false, dragged: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 }

    const suppressClick = (event: globalThis.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
    }

    const onMouseDown = (event: globalThis.MouseEvent) => {
      if (event.button !== 0) return
      drag.isDown = true
      drag.dragged = false
      drag.startX = event.pageX
      drag.startY = event.pageY
      drag.scrollLeft = el.scrollLeft
      drag.scrollTop = el.scrollTop
    }

    const onMouseMove = (event: globalThis.MouseEvent) => {
      if (!drag.isDown) return
      const dx = event.pageX - drag.startX
      const dy = event.pageY - drag.startY

      if (!drag.dragged && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        drag.dragged = true
        el.style.cursor = 'grabbing'
        el.style.userSelect = 'none'
      }

      if (drag.dragged) {
        event.preventDefault()
        el.scrollLeft = drag.scrollLeft - dx
        el.scrollTop = drag.scrollTop - dy
      }
    }

    const onMouseUp = () => {
      if (!drag.isDown) return
      if (drag.dragged) {
        el.addEventListener('click', suppressClick, { capture: true, once: true })
      }
      drag.isDown = false
      drag.dragged = false
      el.style.cursor = 'grab'
      el.style.removeProperty('user-select')
    }

    el.style.cursor = 'grab'
    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('click', suppressClick, { capture: true })
      el.style.removeProperty('cursor')
      el.style.removeProperty('user-select')
    }
  }, [])

  return ref
}
