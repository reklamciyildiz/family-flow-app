# 🗃️ Supabase Kurulum Rehberi

## Adım 1: Supabase Hesabı ve Proje Oluştur

### 1.1. Supabase'e Giriş Yap

🔗 **Link:** https://supabase.com/dashboard

- "Sign in" tıkla
- GitHub ile giriş yap (önerilen) veya email ile
- Ücretsiz hesap oluştur

### 1.2. Yeni Proje Oluştur

1. Dashboard'da **"New Project"** tıkla

2. **Proje Ayarları:**
   - **Organization:** Kendi org'nizi seçin (veya yeni oluşturun)
   - **Name:** `familial-flow-app` veya `familial-flow`
   - **Database Password:** Güçlü bir şifre girin ve KAYDET! ⚠️
   - **Region:** `Europe West (Frankfurt)` (Türkiye'ye en yakın)
   - **Pricing Plan:** Free tier ✅

3. **"Create new project"** tıkla

4. ⏳ 1-2 dakika bekle (veritabanı oluşturuluyor)

---

## Adım 2: API Keys'leri Al

Proje hazır olduğunda:

1. Sol menüden **Settings** > **API** git

2. Şu bilgileri kopyala ve kaydet:

```
Project URL: https://xxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **ÖNEMLİ:**
- `anon public` key'i frontend'de kullan ✅
- `service_role` key'i ASLA frontend'de kullanma ❌

**Project ID'yi de al:**
- URL'den alabilirsin: `https://YOUR-PROJECT-ID.supabase.co`
- Veya Settings > General > Reference ID

---

## Adım 3: Migration'ları Uygula

Şimdi veritabanı tablolarını oluşturacağız.

### 3.1. SQL Editor'ü Aç

1. Sol menüden **SQL Editor** seç
2. **"New query"** tıkla

### 3.2. Migration'ları Sırayla Çalıştır

`supabase/migrations/` klasöründeki her dosyayı sırayla çalıştır:

#### Migration 1: İlk Veritabanı Yapısı

📁 `20251028170645_801a6f62-295d-45a6-b4d9-a48a281facd9.sql`

SQL Editor'de yeni query aç ve dosyanın tüm içeriğini yapıştır.
**"Run"** (F5) tıkla.

✅ Başarılı: "Success. No rows returned" görmelisin.

#### Migration 2: RLS Güvenlik Güncellemesi

📁 `20251028171336_be5aecbd-4cec-472c-bdf9-77983137e2a5.sql`

Yeni query aç, içeriği yapıştır, **"Run"** tıkla.

#### Migration 3-6: Kalan Migration'lar

Sırayla:
- `20251028171602_59a5a2e9-d948-49ee-a317-fc4f021b9ac5.sql`
- `20251028171927_01f4c227-3581-4f1d-8eaa-1c8371ca7140.sql`
- `20251028172509_79a430a0-b00d-461e-a7dd-b79e2e996c36.sql`
- `20251028173025_448b9c28-0bbd-4ee7-8e7f-4805714846b1.sql`

Her birini ayrı query'de çalıştır.

---

## Adım 4: Tabloları Kontrol Et

1. Sol menüden **Table Editor** seç
2. Şu tabloları görmelisin:

✅ Beklenen Tablolar:
- families
- profiles
- tasks
- task_comments
- badges
- activities

3. Her tabloya tıkla ve RLS'in aktif olduğunu kontrol et
   - Tablo adının yanında 🔒 simgesi olmalı

---

## Adım 5: .env Dosyasını Güncelle

Local `.env` dosyasını yeni Supabase bilgilerinle güncelle:

```bash
VITE_SUPABASE_PROJECT_ID="your-new-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-new-anon-key"
VITE_SUPABASE_URL="https://your-new-project-id.supabase.co"
```

---

## Adım 6: Test Et

Development server'ı yeniden başlat:

```bash
# Ctrl+C ile durdur (eğer çalışıyorsa)
npm run dev
```

Tarayıcıda http://localhost:8081 aç ve:

1. **Signup** sayfasına git
2. Yeni hesap oluştur
3. Login yap
4. Aile oluştur

✅ Herşey çalışıyorsa başarılı!

---

## ⚠️ Muhtemel Sorunlar

### Email Onayı Gerekiyor

**Belirti:** "Email not confirmed" hatası

**Çözüm:**
1. Supabase Dashboard > Authentication > Settings
2. **"Enable email confirmations"** devre dışı bırak (development için)
3. Veya email kutunuza gelen onay linkine tıkla

### RLS Policy Hatası

**Belirti:** "Row level security policy violation"

**Çözüm:**
1. Table Editor'de ilgili tabloya git
2. RLS'in aktif olduğunu kontrol et
3. Policies tab'ında policy'lerin olduğunu kontrol et
4. Migration'ları tekrar çalıştır (DROP IF EXISTS kullandık, sorun çıkmaz)

---

## 📝 Sonraki Adım

.env dosyası güncellendikten ve test ettikten sonra:

1. ❌ `.env` dosyasını GIT'e COMMIT ETME!
2. ✅ Sadece kod değişikliklerini commit et (eğer varsa)
3. ✅ Deploy aşamasında Vercel'e environment variables'ları gir

---

## 🎯 Hazır mısın?

Migration'ları uyguladıktan sonra bana haber ver:
- ✅ Tablolar oluştu mu?
- ✅ Test başarılı mı?
- ✅ .env güncellendi mi?

Sonra deploy'a geçeriz! 🚀

