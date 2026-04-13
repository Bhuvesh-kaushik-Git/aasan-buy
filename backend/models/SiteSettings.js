const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  logoUrl: { type: String, default: '' },
  heroBanner: {
    imageUrl: { type: String, default: '' },
    title: { type: String, default: 'Welcome to AasanBuy' },
    subtitle: { type: String, default: 'Your Easy Online Store' }
  },
  categories: [
    {
      name: { type: String },
      iconUrl: { type: String }
    }
  ],
  footerText: { type: String, default: '© 2026 AasanBuy. All rights reserved.' }
}, {
  timestamps: true,
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
