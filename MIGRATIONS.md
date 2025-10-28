# Supabase Database Migrations

Bu dosya veritabanı migration'larının dokümantasyonudur.

## 📋 Migration Listesi

### 1. `20251028170645` - İlk Veritabanı Yapısı
**Oluşturduğu Tablolar:**
- `families` - Aile bilgileri
- `profiles` - Kullanıcı profilleri (auth.users'ın uzantısı)
- `tasks` - Görevler
- `task_comments` - Görev yorumları
- `badges` - Kullanıcı rozetleri
- `activities` - Aktivite logları

**Özellikler:**
- UUID extension aktifleştirildi
- Row Level Security (RLS) tüm tablolarda etkin
- Otomatik profil oluşturma trigger'ı (`handle_new_user`)
- Davet kodu generator fonksiyonu
- Realtime publication tüm tablolar için aktif

### 2. `20251028171336` - RLS Güvenlik Güncellemesi
**Yapılan Değişiklikler:**
- RLS policy'leri `SECURITY DEFINER` fonksiyon kullanacak şekilde yeniden yazıldı
- `get_user_family_id()` fonksiyonu eklendi
- Sonsuz döngü (infinite recursion) sorunu çözüldü

### 3. `20251028171602` - Trigger Düzeltmesi
**Yapılan Değişiklikler:**
- `handle_new_user()` fonksiyonu `search_path` ayarı düzeltildi

### 4. `20251028171927` - Family Creation Policy #1
**Yapılan Değişiklikler:**
- Authenticated kullanıcıların aile oluşturması sağlandı

### 5. `20251028172509` - Family Creation Policy #2
**Yapılan Değişiklikler:**
- Hem anon hem de authenticated kullanıcıların aile oluşturması sağlandı

### 6. `20251028173025` - Family SELECT Policy
**Yapılan Değişiklikler:**
- Authenticated kullanıcıların aileleri görüntüleyebilmesi sağlandı (INSERT sonrası representation için gerekli)

## 🔄 Migration'ları Uygulama

### Yöntem 1: npx ile (Önerilen)

```bash
# Supabase'e login ol
npx supabase login

# Projeye bağlan
npx supabase link --project-ref your-project-id

# Migration'ları uygula
npx supabase db push
```

### Yöntem 2: Supabase Dashboard

1. [Supabase Dashboard](https://supabase.com/dashboard)'a git
2. Proje seç
3. SQL Editor'ü aç
4. Her migration dosyasının içeriğini sırayla çalıştır

## ⚠️ Önemli Notlar

- Bu migration'lar Lovable tarafından oluşturulduğu için **muhtemelen zaten uygulanmış durumda**
- Yeni bir ortama deploy ederken migration'ları uygulamayı unutmayın
- RLS policy'leri güvenlik için kritik öneme sahip
- Production ortamında migration'ları test etmeden uygulamayın

## 🔍 Mevcut Durumu Kontrol Etme

Supabase Dashboard'da SQL Editor'de şunu çalıştırarak kontrol edebilirsiniz:

```sql
-- Tüm tabloları listele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Policy'leri listele
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

