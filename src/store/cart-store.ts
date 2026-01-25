import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CartItem = {
  listingId: string
  bookId: string
  title: string
  author: string
  coverUrl: string | null
  price: number
  type: 'physical' | 'digital'
  quantity: number
  maxStock?: number | null
}

type CartState = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (listingId: string) => void
  updateQuantity: (listingId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(i => i.listingId === newItem.listingId)

          // Si c'est un produit digital, on ne peut en avoir qu'un seul exemplaire
          if (newItem.type === 'digital' && existingItem) {
            return state
          }

          if (existingItem) {
            // Mise à jour quantité pour physique
            const newQuantity = existingItem.quantity + 1
            // Vérification stock (sommaire)
            if (existingItem.maxStock && newQuantity > existingItem.maxStock) {
              return state // Ou lancer une alerte
            }
            return {
              items: state.items.map(i =>
                i.listingId === newItem.listingId
                  ? { ...i, quantity: newQuantity }
                  : i
              )
            }
          }

          return { items: [...state.items, { ...newItem, quantity: 1 }] }
        })
      },

      removeItem: (listingId) => {
        set((state) => ({
          items: state.items.filter(i => i.listingId !== listingId)
        }))
      },

      updateQuantity: (listingId, quantity) => {
        set((state) => ({
          items: state.items.map(i => {
            if (i.listingId === listingId) {
              // Vérification stock max
              if (i.maxStock && quantity > i.maxStock) return i
              return { ...i, quantity: Math.max(1, quantity) }
            }
            return i
          })
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'pensezy-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // Important pour Next.js pour éviter le mismatch
    }
  )
)
