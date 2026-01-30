"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, User, BookOpen, ShoppingBag, X, Loader2 } from "lucide-react";
import { adminSearch } from "./actions";
import Link from "next/link";

export function AdminSearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    users: any[];
    books: any[];
    orders: any[];
  }>({ users: [], books: [], orders: [] });
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const { results: searchResults } = await adminSearch(query);
        if (searchResults) {
          setResults(searchResults);
        }
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults({ users: [], books: [], orders: [] });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  const hasResults =
    results.users.length > 0 ||
    results.books.length > 0 ||
    results.orders.length > 0;

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-80">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-slate-400" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un utilisateur, un livre..."
          className="bg-transparent text-sm outline-none w-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          {!hasResults ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Aucun resultat pour &quot;{query}&quot;
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 uppercase">
                    Utilisateurs
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelect(`/admin/users?search=${user.email}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {user.full_name || "Sans nom"}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {user.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Books */}
              {results.books.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 uppercase">
                    Livres
                  </div>
                  {results.books.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleSelect(`/admin/products?search=${book.title}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      {book.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.cover_url}
                          alt=""
                          className="w-8 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-8 h-10 rounded bg-purple-100 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {book.title}
                        </p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Orders */}
              {results.orders.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 uppercase">
                    Commandes
                  </div>
                  {results.orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleSelect(`/admin/orders`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.buyer?.full_name || order.buyer?.email || "Inconnu"}
                        </p>
                      </div>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-600"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {order.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
