-- Types d'utilisateurs
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');

-- Type de produit (Physique ou Numérique)
CREATE TYPE product_type AS ENUM ('physical', 'digital');

-- État du livre physique
CREATE TYPE book_condition AS ENUM ('new', 'like_new', 'good', 'acceptable');

-- Statut de la commande
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'disputed', 'cancelled', 'refunded');

-- Type de transaction financière
CREATE TYPE transaction_type AS ENUM ('sale', 'purchase', 'deposit', 'withdrawal', 'commission');