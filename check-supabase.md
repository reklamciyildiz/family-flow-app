# Supabase Kontrol Rehberi

## 1. Supabase Dashboard'a Git
🔗 **Link:** https://supabase.com/dashboard/project/myeitbhizjaodgamuijg

## 2. Login Ol
Lovable ile oluşturduğunuz hesapla giriş yapın

## 3. Tabloları Kontrol Et

### Sol menüden "Table Editor" seç
Aşağıdaki tabloları görmelisiniz:

✅ Beklenen Tablolar:
- [ ] families
- [ ] profiles  
- [ ] tasks
- [ ] task_comments
- [ ] badges
- [ ] activities

### Eğer Tablolar VARSA:
✅ Migration'lar uygulanmış, hazırsınız!

### Eğer Tablolar YOKSA:
Migration'ları manuel uygulamamız gerekiyor.

## 4. API Keys'i Kontrol Et

Settings > API'ya git ve kontrol et:
- ✅ Project URL: https://myeitbhizjaodgamuijg.supabase.co
- ✅ anon public key: (bizimki zaten .env'de)
- ⚠️ service_role key: ASLA frontend'de kullanma!

## 5. RLS (Row Level Security) Kontrol

Table Editor'de her tablo için:
- RLS enabled = ✅ (kilidi simgesi açık olmalı)

---

## Sonraki Adım

Kontrol sonuçlarını bana bildirin:
1. Tablolar var mı? ✅/❌
2. Kaç tablo görüyorsunuz?
3. RLS aktif mi?

Bu bilgilerle deploy'a devam edelim!

