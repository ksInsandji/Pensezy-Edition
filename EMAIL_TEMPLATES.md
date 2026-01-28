# Modèles d'Emails pour Pensezy Edition

Voici des modèles HTML modernes et professionnels à utiliser dans votre interface Supabase.
Allez dans **Authentication > Email Templates** et collez le code correspondant.

---

## 1. Confirmation d'inscription (Confirm Signup)

**Sujet :** Bienvenue sur Pensezy ! Confirmez votre compte 📚

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #1e3a8a; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
    .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
    .btn { display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pensezy Edition</h1>
    </div>
    <div class="content">
      <h2>Bienvenue !</h2>
      <p>Merci de vous être inscrit sur la première plateforme hybride de livres au Cameroun.</p>
      <p>Pour activer votre compte et commencer à lire ou vendre, veuillez confirmer votre adresse email en cliquant ci-dessous :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" class="btn">Confirmer mon compte</a>
      </div>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    </div>
    <div class="footer">
      &copy; Pensezy Edition. Tous droits réservés.
    </div>
  </div>
</body>
</html>
```

---

## 2. Réinitialisation de mot de passe (Reset Password)

**Sujet :** Réinitialisez votre mot de passe Pensezy 🔒

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #1e3a8a; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
    .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
    .btn { display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pensezy Edition</h1>
    </div>
    <div class="content">
      <h2>Mot de passe oublié ?</h2>
      <p>Pas de panique. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe sécurisé.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" class="btn">Changer mon mot de passe</a>
      </div>
      <p>Ce lien expirera dans 1 heure.</p>
    </div>
    <div class="footer">
      &copy; Pensezy Edition. Tous droits réservés.
    </div>
  </div>
</body>
</html>
```

---

## 3. Invitation Magic Link

**Sujet :** Connectez-vous à Pensezy Edition ✨

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #1e3a8a; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
    .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
    .btn { display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pensezy Edition</h1>
    </div>
    <div class="content">
      <h2>Connexion rapide</h2>
      <p>Cliquez sur le lien ci-dessous pour vous connecter instantanément à votre compte.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" class="btn">Me connecter</a>
      </div>
    </div>
    <div class="footer">
      &copy; Pensezy Edition. Tous droits réservés.
    </div>
  </div>
</body>
</html>
```
