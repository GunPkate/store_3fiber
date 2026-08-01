export const row_menu = "flex flex-row gap-4"
export const glass_bg = "backdrop-blur-md bg-gray-600/20 border border-white/10 rounded-2xl shadow-xl p-2 max-w-sm text-white p-2"
export const glass_text = "text-1xl font-bold"

// --- Toolbar tokens (HUD bottom bar: 2 rows of 40x40 square icon buttons) ---

// Outer wrapper: pins the whole toolbar bottom-center, stacks the 2 rows, scales down on narrow screens.
export const toolbar_wrap =
  "fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 sm:gap-2 max-w-[97vw] px-1"

// One row of buttons: wraps on narrow screens instead of overflowing.
export const toolbar_row = "flex flex-row flex-wrap items-center justify-center gap-1.5 sm:gap-2"

// Square 40x40 icon button, base state.
export const icon_btn =
  "shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-base sm:text-lg " +
  "bg-[#080c23]/90 border border-white/15 text-[#dde] cursor-pointer select-none " +
  "transition-colors duration-150 hover:bg-[#2a40aa] hover:border-[#4466dd]"

// Appended when a button represents an active/open state (toggled tool, open modal, etc).
export const icon_btn_active = "bg-[#2a40aa] border-[#4466dd]"

export const center_btn="flex flex-col items-center"