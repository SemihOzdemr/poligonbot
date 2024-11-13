# Discord Ekonomi Botu - Aktivite Ödül Sistemi ve Sunucu Yönetimi (Özel Bot)

Bu proje, sadece kendi Discord sunucunuzda kullanılmak üzere geliştirilmiş bir ekonomi botudur. Bot, kullanıcıların aktiflik sağladıkça "policoin" adı verilen sanal para birimini kazandığı, sunucuya kayıt olabildiği ve sunucu yönetimi için çeşitli araçlar sunduğu bir sistem sağlar. Kullanıcılar kazandıkları "policoin" ile sunucudaki market sisteminden istedikleri ödülleri alabilirler.

> **Not:** Bu proje, sadece kişisel kullanım için geliştirilmiştir ve sadece özel sunucularda çalışacak şekilde tasarlanmıştır. Bot, Discord API'si ve MongoDB veritabanı kullanılarak geliştirilmiştir.

## Özellikler
- **Aktivite Takibi:** Kullanıcıların sunucudaki mesajlaşma, sesli kanal kullanım gibi aktiviteleri izlenir.
- **Policoin Ödülleri:** Kullanıcılar, belirli bir aktivite seviyesine ulaştığında "policoin" kazanır.
- **Market Sistemi:** Kullanıcılar kazandıkları "policoin" ile sunucudaki market sisteminden ödüller alabilir.
- **Sunucu Yönetimi:** Sunucu yöneticileri için çeşitli yönetim komutları ve moderasyon araçları.
- **Kullanıcı Kaydı:** Kullanıcılar, bot aracılığıyla sunucuya kaydolabilir ve aktiviteleri takip edebilir.
- **MongoDB Tabanlı Veri Saklama:** Kullanıcıların "policoin" puanları, aktiviteleri ve kayıt bilgileri MongoDB veritabanında saklanır.

## Teknik Bilgiler
- **Dil:** Node.js
- **Veritabanı:** MongoDB
- **Discord API Kullanımı:** discord.js
- **Policoin Sistemi:** Kullanıcılar, sunucudaki aktiviteleri ile "policoin" kazanır ve kazandıkları bu coinleri markette harcayabilirler.
- **Sunucu Yönetimi:** Yönetim komutları ile sunucu yöneticilerine araçlar sağlanır.
