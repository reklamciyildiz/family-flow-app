# ⚡ HIZLI DEPLOY REHBERİ

## 🎯 Hedef
Familial Flow App'i Vercel'e deploy etmek (5-10 dakika)

---

## 📋 KONTROL LİSTESİ

### Adım 0: Supabase Kontrolü
- [ ] Supabase Dashboard'a gir: https://supabase.com/dashboard/project/myeitbhizjaodgamuijg
- [ ] Tabloların var olduğunu kontrol et (families, profiles, tasks, vb.)
- [ ] RLS'in aktif olduğunu kontrol et

### Adım 1: GitHub Hazırlığı
- [ ] Değişiklikleri commit et
- [ ] GitHub'a push et

### Adım 2: Vercel'e Deploy
- [ ] Vercel hesabı oluştur
- [ ] Repository'i bağla
- [ ] Environment variables ekle
- [ ] Deploy!

---

## 🚀 BAŞLAYALIM!

### ADIM 1: Git Commit ve Push

**Not:** `.env` dosyasının commit edilmediğinden emin olalım:

```bash
# Git durumunu kontrol et
git status

# .env dosyası listede OLMAMALI (gitignore'da çünkü)
# Tüm değişiklikleri ekle
git add .

# Commit yap
git commit -m "feat: Lovable'den bağımsız, production-ready"

# Push yap
git push origin main
```

**Eğer .env dosyası git status'ta görünüyorsa:**
```bash
# .env'yi kaldır
git rm --cached .env
git commit -m "chore: remove .env from git"
git push
```

---

### ADIM 2: Vercel'e Deploy

#### 2.1. Vercel Hesabı Oluştur

1. 🔗 https://vercel.com/signup adresine git
2. "Continue with GitHub" seç
3. GitHub ile giriş yap

#### 2.2. Yeni Proje Oluştur

1. Vercel Dashboard'da **"Add New..."** > **"Project"** tıkla
2. **"Import Git Repository"** seç
3. `familial-flow-app` repository'ini bul ve **"Import"** tıkla

#### 2.3. Proje Ayarları

**Framework Preset:** Vite (otomatik algılanır)

**Build Settings:**
- Build Command: `npm run build` ✅ (zaten default)
- Output Directory: `dist` ✅ (zaten default)
- Install Command: `npm install` ✅ (zaten default)

**Root Directory:** `./` (değiştirme)

#### 2.4. Environment Variables Ekle

**ÖNEMLİ:** Deploy'dan ÖNCE environment variables eklenmeli!

"Environment Variables" bölümünde şunları ekle:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://myeitbhizjaodgamuijg.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZWl0Ymhpemphb2RnYW11aWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjMxMTIsImV4cCI6MjA3NzIzOTExMn0.6Kuf_ShAqTk2FVhTufbO5IKfP_fPPFbUlS0rAgyS2GU` |
| `VITE_SUPABASE_PROJECT_ID` | `myeitbhizjaodgamuijg` |

**Her değişken için:**
1. "Add New" tıkla
2. Key'i yaz (örn: `VITE_SUPABASE_URL`)
3. Value'yu yapıştır
4. Environment: "Production", "Preview", "Development" **hepsini seç** ✅
5. "Add" tıkla

#### 2.5. Deploy Et!

1. **"Deploy"** butonuna tıkla
2. ☕ 1-2 dakika bekle (build süresi)
3. 🎉 **Deploy başarılı!**

---

### ADIM 3: Test Et

Deploy tamamlandığında:

1. **"Visit"** butonuna tıkla veya verilen URL'i aç
   - Format: `https://familial-flow-app-xxxx.vercel.app`

2. **Sayfanın açıldığını kontrol et**
   - Ana sayfa yüklenmeli
   - UI düzgün görünmeli

3. **Signup/Login Test Et**
   - Signup sayfasına git
   - Yeni hesap oluştur
   - Email onayı geldi mi kontrol et (Supabase email settings)
   - Login yap

4. **Console Hatalarını Kontrol Et**
   - F12 > Console
   - Kırmızı hatalar var mı?
   - Network sekmesinde Supabase istekleri başarılı mı?

---

## 🎨 BONUS: Custom Domain Ekle

### Ücretsiz Vercel Domain
`familial-flow-app-xxxx.vercel.app` (otomatik verilir)

### Kendi Domain'iniz Varsa

1. Vercel Project > Settings > Domains
2. Domain adınızı ekleyin (örn: `familialflow.com`)
3. DNS kayıtlarını güncelleyin (Vercel talimatları verir)
4. SSL otomatik aktif olur ✅

---

## 🔄 GÜNCELLEMELERİ DEPLOY ETME

Artık her push otomatik deploy olur:

```bash
# Kod değişikliği yap
git add .
git commit -m "fix: bug düzeltmesi"
git push

# Vercel otomatik olarak yeni deploy başlatır! 🚀
```

---

## 🐛 SORUN GİDERME

### Build Hatası

**Hata:** `Module not found` veya `Cannot find package`

**Çözüm:**
```bash
# Local'de test et
npm install
npm run build

# Başarılı olursa Vercel'de de olmalı
# Eğer local'de de başarısız olursa düzelt ve push et
```

### Environment Variables Hatası

**Belirti:** Sayfa açılıyor ama login çalışmıyor

**Çözüm:**
1. Vercel Project > Settings > Environment Variables
2. Değişkenleri kontrol et
3. Eksik/yanlış varsa düzelt
4. "Redeploy" yap: Deployments > Latest > ⋯ > Redeploy

### Supabase Bağlantı Hatası

**Belirti:** Console'da Supabase hatası

**Çözüm:**
1. Supabase Dashboard > Settings > API
2. URL ve key'leri karşılaştır
3. Vercel environment variables'ı güncelle

### 404 Hatası (Routing)

**Belirti:** Ana sayfa açılıyor ama alt sayfalar 404

**Çözüm:**
`vercel.json` zaten oluşturduk, commit edilmiş mi kontrol et:
```bash
git add vercel.json
git commit -m "fix: add vercel routing config"
git push
```

---

## ✅ BAŞARI KRİTERLERİ

- [x] Build başarılı
- [x] Site açılıyor
- [x] Signup/Login çalışıyor
- [x] Supabase bağlantısı çalışıyor
- [x] Console'da kritik hata yok
- [x] Mobil responsive

---

## 🎉 TEBRİKLER!

Uygulamanız artık **LIVE**! 🚀

**Sonraki Adımlar:**
1. Domain bağla (isteğe bağlı)
2. Email templates özelleştir (Supabase)
3. Analytics ekle (isteğe bağlı)
4. Monitoring setup (Vercel otomatik)

---

## 📞 YARDIM

Bir sorunla karşılaşırsan:
1. Bu dokümanın "Sorun Giderme" bölümüne bak
2. Vercel logs: Deployments > Latest > View Function Logs
3. Supabase logs: Dashboard > Logs

**Hazırım destek olmaya!** 💪

