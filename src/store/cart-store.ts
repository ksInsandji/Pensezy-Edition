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
  isHydrated: boolean
  addItem: (item: CartItem) => void
  removeItem: (listingId: string) => void
  updateQuantity: (listingId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getCount: () => number
  setItems: (items: CartItem[]) => void
  setHydrated: (state: boolean) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

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
              return state
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
      },

      // Nouvelle fonction pour definir les items (utilisee lors de la sync depuis la DB)
      setItems: (items) => set({ items }),

      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: 'pensezy-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

// Hook pour synchroniser le panier avec la base de donnees
export async function syncCartWithDatabase(userId: string | null) {
  if (typeof window === 'undefined') return

  const { syncCartToDatabase, loadCartFromDatabase } = await import('@/app/actions/cart')
  const store = useCartStore.getState()

  if (userId) {
    // Utilisateur connecte: charger depuis DB et fusionner avec local
    const { items: dbItems } = await loadCartFromDatabase()

    if (dbItems && dbItems.length > 0) {
      // Fusionner: items locaux + items DB (sans doublons)
      const localItems = store.items
      const mergedItems: CartItem[] = [...dbItems]

      for (const localItem of localItems) {
        const existsInDb = mergedItems.find(i => i.listingId === localItem.listingId)
        if (!existsInDb) {
          mergedItems.push(localItem)
        }
      }

      store.setItems(mergedItems)
    }

    // Sauvegarder l'etat fusionne dans la DB
    await syncCartToDatabase(
      store.items.map(i => ({ listingId: i.listingId, quantity: i.quantity }))
    )
  }
}
