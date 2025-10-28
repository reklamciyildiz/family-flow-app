# Familial Flow App

Aile görevlerini ve takvimi yönetmek için modern, kullanıcı dostu bir web uygulaması.

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 20.x veya üzeri
- npm veya yarn
- Supabase hesabı

### Kurulum

```sh
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyasını oluştur (örnek dosyayı kopyala)
# .env dosyasına Supabase bilgilerini ekle:
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
# VITE_SUPABASE_PROJECT_ID=your-project-id

# 3. Development server'ı başlat
npm run dev
```

Tarayıcınızda http://localhost:8080 adresini açın (eğer port kullanılıyorsa başka bir port otomatik atanır).

## 🛠️ Teknolojiler

Bu proje aşağıdaki modern teknolojilerle geliştirilmiştir:

- **React 18** - UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı build aracı
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Yeniden kullanılabilir UI bileşenleri
- **Supabase** - Backend ve veritabanı
- **React Query** - Server state yönetimi
- **React Router** - Routing
- **React Hook Form** - Form yönetimi
- **Zod** - Schema validation

## 📁 Proje Yapısı

```
src/
├── components/       # React bileşenleri
│   ├── family/      # Aile yönetimi bileşenleri
│   ├── ui/          # shadcn/ui bileşenleri
│   └── ProtectedRoute.tsx
├── hooks/           # Custom React hooks
├── integrations/    # Dış servis entegrasyonları
│   └── supabase/   # Supabase client ve types
├── pages/          # Sayfa bileşenleri
├── types/          # TypeScript tip tanımları
└── lib/            # Yardımcı fonksiyonlar
```

## 🗃️ Supabase

### Migrations

Veritabanı migration'ları `supabase/migrations/` klasöründe bulunur.

Migration'ları uygulamak için:

```sh
# npx ile Supabase CLI kullan (global kurulum gerekmez)
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase db push
```

## 📦 Komutlar

```sh
npm run dev          # Development server başlat
npm run build        # Production build
npm run preview      # Production build önizleme
npm run lint         # ESLint kontrolü
```

## 🚢 Deploy

Bu proje aşağıdaki platformlara kolayca deploy edilebilir:

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Vercel'e giriş yap
2. Repository'i import et
3. Environment variables'ları ekle (.env dosyasındaki değerler)
4. Deploy et

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Netlify'a giriş yap
2. Repository'i bağla
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variables'ları ekle

## 🔐 Güvenlik

- `.env` dosyasını asla commit etmeyin
- Supabase anahtarlarını güvende tutun
- Production'da Row Level Security (RLS) kullanın

## 📝 Lisans

Bu proje özel kullanım içindir.
