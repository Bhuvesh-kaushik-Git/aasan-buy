const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  logoUrl: { type: String, default: '' },
  heroBanners: [
    {
      imageUrl: { type: String, default: '' },
      title: { type: String, default: 'Welcome to AasanBuy' },
      subtitle: { type: String, default: 'Your Easy Online Store' },
      linkUrl: { type: String, default: '#' }
    }
  ],
  categories: [
    {
      name: { type: String },
      iconUrl: { type: String }
    }
  ],
  navMenu: [
    {
      label: { type: String, default: 'Menu Item' },
      sections: [
        {
          title: { type: String, default: 'Section Title' },
          links: [
            {
              label: { type: String },
              url: { type: String }
            }
          ]
        }
      ]
    }
  ],
  footerText: { type: String, default: '© 2026 AasanBuy. All rights reserved.' }
}, {
  timestamps: true,
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
