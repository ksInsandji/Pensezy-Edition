import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CartItem = {
  id: string
  title: string
  price: number
  type: 'physical' | 'digital'
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (data: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      addItem: (data) => {
        const currentItems = get().items
        const existingItem = currentItems.find((item) => item.id === data.id)
        
        if (existingItem) return // Déjà dans le panier

        set({ items: [...get().items, data] })
      },
      removeItem: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)