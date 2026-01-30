"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ShoppingBag, UserPlus, BookOpen, Clock, Check } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  type: "order" | "user" | "product";
  message: string;
  time: string;
  read: boolean;
  link?: string;
};

// Ces notifications seraient normalement chargees depuis une API/base de donnees
// Pour l'instant, on utilise des donnees mockees qui se rafraichissent
export function AdminNotifications({
  pendingOrders = 0,
  pendingProducts = 0,
  newUsers = 0,
}: {
  pendingOrders?: number;
  pendingProducts?: number;
  newUsers?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate notifications based on props
  useEffect(() => {
    const notifs: Notification[] = [];

    if (pendingOrders > 0) {
      notifs.push({
        id: "orders",
        type: "order",
        message: `${pendingOrders} commande(s) en attente de validation`,
        time: "Maintenant",
        read: false,
        link: "/admin/orders?status=pending",
      });
    }

    if (pendingProducts > 0) {
      notifs.push({
        id: "products",
        type: "product",
        message: `${pendingProducts} produit(s) en attente de moderation`,
        time: "Maintenant",
        read: false,
        link: "/admin/products?status=pending",
      });
    }

    if (newUsers > 0) {
      notifs.push({
        id: "users",
        type: "user",
        message: `${newUsers} nouvel(aux) utilisateur(s) inscrit(s) aujourd'hui`,
        time: "Aujourd'hui",
        read: false,
        link: "/admin/users",
      });
    }

    setNotifications(notifs);
  }, [pendingOrders, pendingProducts, newUsers]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case "user":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "product":
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-slate-600 relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-slate-500">{unreadCount} non lue(s)</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Aucune notification</p>
                <p className="text-xs text-slate-400">Tout est a jour !</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || "#"}
                  onClick={() => {
                    markAsRead(notif.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                    !notif.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.read ? "font-medium text-slate-900" : "text-slate-600"}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {notif.time}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  )}
                </Link>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Tout marquer comme lu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
