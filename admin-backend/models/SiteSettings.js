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
  occasionSections: [
    {
      sectionTitle: { type: String, default: '' },
      occasions: [
        {
          label: { type: String, default: '' },
          imageUrl: { type: String, default: '' },
          redirectUrl: { type: String, default: '#' },
          products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
        }
      ]
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
  homeProductTabs: [
    {
      tabTitle: { type: String, required: true },
      products: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
          tagLabel: { type: String, default: '' },
          tagColor: { type: String, default: '#ffbc00' }
        }
      ]
    }
  ],
  footerText: { type: String, default: '© 2026 AasanBuy. All rights reserved.' }
}, {
  timestamps: true,
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
