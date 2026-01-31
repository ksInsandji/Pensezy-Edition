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
  isLoading: boolean
  addItem: (item: CartItem) => void
  removeItem: (listingId: string) => void
  updateQuantity: (listingId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getCount: () => number
  setItems: (items: CartItem[]) => void
  setHydrated: (state: boolean) => void
  setLoading: (state: boolean) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      isLoading: false,

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

      // Fonction pour definir les items (utilisee lors de la sync depuis la DB)
      setItems: (items) => set({ items }),

      setHydrated: (state) => set({ isHydrated: state }),

      setLoading: (state) => set({ isLoading: state }),
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

/**
 * Charger le panier depuis la base de données
 * Appelé sur les pages qui affichent le panier
 */
export async function loadCartFromDB() {
  if (typeof window === 'undefined') return

  const store = useCartStore.getState()
  store.setLoading(true)

  try {
    const { loadCartFromDatabase } = await import('@/app/actions/cart')
    const { items: dbItems } = await loadCartFromDatabase()

    if (dbItems && dbItems.length > 0) {
      // Remplacer le panier local par celui de la DB
      store.setItems(dbItems)
    }
  } catch (error) {
    console.error('Erreur chargement panier:', error)
  } finally {
    store.setLoading(false)
  }
}

/**
 * Synchroniser le panier avec la base de données
 * Appelé quand l'utilisateur se connecte
 */
export async function syncCartWithDatabase(userId: string | null) {
  if (typeof window === 'undefined' || !userId) return

  const store = useCartStore.getState()
  store.setLoading(true)

  try {
    const { syncCartToDatabase, loadCartFromDatabase } = await import('@/app/actions/cart')

    // 1. Charger le panier de la DB
    const { items: dbItems } = await loadCartFromDatabase()

    // 2. Récupérer les items locaux
    const localItems = store.items

    // 3. Fusionner: DB prioritaire + local (sans doublons)
    const mergedItems: CartItem[] = [...(dbItems || [])]

    for (const localItem of localItems) {
      const existsInDb = mergedItems.find(i => i.listingId === localItem.listingId)
      if (!existsInDb) {
        mergedItems.push(localItem)
      }
    }

    // 4. Mettre à jour le store local
    store.setItems(mergedItems)

    // 5. Sauvegarder l'état fusionné dans la DB
    if (mergedItems.length > 0) {
      await syncCartToDatabase(
        mergedItems.map(i => ({ listingId: i.listingId, quantity: i.quantity }))
      )
    }
  } catch (error) {
    console.error('Erreur sync panier:', error)
  } finally {
    store.setLoading(false)
  }
}
