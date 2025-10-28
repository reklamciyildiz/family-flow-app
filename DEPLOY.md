# 🚀 Deploy Rehberi

Bu belge, Familial Flow App'i production ortamına deploy etmek için adım adım rehberdir.

## 📋 Deploy Öncesi Kontrol Listesi

- [ ] `.env` dosyası `.gitignore`'da (✅ halihazırda yapıldı)
- [ ] Supabase migration'ları uygulandı mı kontrol et
- [ ] Production Supabase project oluşturuldu
- [ ] Environment variables hazır
- [ ] Build testi yapıldı (`npm run build`)

## 🌐 Deploy Seçenekleri

### Option 1: Vercel (Önerilen)

Vercel, React uygulamaları için en optimize platformlardan biri.

#### Adımlar:

1. **Vercel hesabı oluştur**
   - [vercel.com](https://vercel.com) adresinden ücretsiz hesap aç

2. **GitHub/GitLab ile repository'i bağla**
   - Vercel dashboard'dan "New Project" tıkla
   - Repository'i seç

3. **Build ayarları**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables ekle**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_SUPABASE_PROJECT_ID=your-project-id
   ```

5. **Deploy et**
   - "Deploy" butonuna tıkla
   - 1-2 dakika içinde live olacak

#### Vercel CLI ile Deploy:

```bash
# Vercel CLI'yi global olarak yükle
npm i -g vercel

# Login ol
vercel login

# Deploy et
vercel

# Production'a deploy et
vercel --prod
```

**장점:**
- ⚡ Çok hızlı
- 🔄 Otomatik GitHub entegrasyonu
- 🌍 Global CDN
- 🆓 Ücretsiz SSL
- 📊 Analytics ve monitoring

---

### Option 2: Netlify

Netlify de mükemmel bir alternatif.

#### Adımlar:

1. **Netlify hesabı oluştur**
   - [netlify.com](https://netlify.com) adresinden ücretsiz hesap aç

2. **Site deploy et**
   - "Add new site" > "Import an existing project"
   - GitHub repository'i bağla

3. **Build ayarları**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Environment Variables**
   - Site settings > Environment variables
   - `.env` dosyasındaki değerleri ekle

5. **Deploy**
   - "Deploy site" tıkla

#### Netlify CLI ile Deploy:

```bash
# Netlify CLI'yi global olarak yükle
npm i -g netlify-cli

# Login ol
netlify login

# Site oluştur ve deploy et
netlify init

# Manual deploy
netlify deploy --prod
```

**Avantajlar:**
- 🎯 Kolay kurulum
- 🔄 Git-based workflow
- 🆓 Ücretsiz SSL
- 📝 Form handling
- 🔌 Serverless functions

---

### Option 3: Railway

Backend-heavy uygulamalar için ideal.

```bash
# Railway CLI yükle
npm i -g @railway/cli

# Login ol
railway login

# Deploy et
railway up
```

---

## 🔐 Environment Variables

Production'da bu değerleri ayarlayın:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### ⚠️ ÖNEMLİ NOTLAR:

1. **Development ve Production için ayrı Supabase projeleri kullanın**
2. **Production Supabase URL'ini `.env` yerine deploy platformuna ekleyin**
3. **ANON key'i kullanın, SERVICE_ROLE key'i asla frontend'de kullanmayın**

---

## 🧪 Deploy Öncesi Test

Local production build test:

```bash
# Production build oluştur
npm run build

# Preview yap
npm run preview
```

Tarayıcıda http://localhost:4173 açılacak.

---

## 🔄 Otomatik Deploy (CI/CD)

Her iki platform da git push ile otomatik deploy sunar:

```bash
git add .
git commit -m "feat: yeni özellik"
git push origin main
```

- Vercel ve Netlify otomatik olarak yeni deployment başlatır
- Preview URL'ler pull request'ler için otomatik oluşturulur

---

## 📊 Deploy Sonrası Kontrol

1. **Sayfa açılıyor mu?**
2. **Supabase bağlantısı çalışıyor mu?** (Signup/Login test)
3. **Console'da hata var mı?** (F12 > Console)
4. **Network istekleri başarılı mı?** (F12 > Network)
5. **Mobil görünüm düzgün mü?**

---

## 🐛 Sorun Giderme

### Build Hatası

```bash
# Dependencies güncel mi kontrol et
npm install

# Local build test
npm run build
```

### Environment Variables Hatası

- Deploy platformunda environment variables'ların doğru girildiğinden emin ol
- VITE_ prefix'i olmalı
- Rebuild yapman gerekebilir

### Supabase Bağlantı Hatası

1. Supabase Dashboard > Settings > API kontrol et
2. URL ve ANON key doğru mu?
3. RLS policy'leri aktif mi?

### 404 Hatası (Routing sorunu)

- `vercel.json` veya `netlify.toml` dosyaları var mı?
- SPA redirect'leri ayarlandı mı?

---

## 🎉 Deploy Tamamlandı!

Uygulama artık live! 

**Domain bağlama:**
- Vercel: Project Settings > Domains
- Netlify: Site Settings > Domain Management

**Custom domain örneği:**
```
familialflow.com → Production
staging.familialflow.com → Staging branch
```

---

## 📈 Monitoring ve Analytics

- **Vercel Analytics**: Otomatik, ekstra kurulum gerekmez
- **Netlify Analytics**: Site settings'den aktifleştir
- **Google Analytics**: İsteğe bağlı eklenebilir

---

## 🔄 Güncelleme Stratejisi

```bash
# Feature branch oluştur
git checkout -b feature/yeni-ozellik

# Değişiklikleri yap
git add .
git commit -m "feat: yeni özellik eklendi"

# Push et (preview deploy otomatik oluşacak)
git push origin feature/yeni-ozellik

# PR oluştur ve merge et
# Main branch'e merge sonrası production otomatik deploy olur
```

---

## 📞 Destek

Sorun yaşarsan:
1. Bu dosyadaki troubleshooting bölümüne bak
2. Vercel/Netlify dökümanlarına göz at
3. Supabase Discord kanalına katıl

