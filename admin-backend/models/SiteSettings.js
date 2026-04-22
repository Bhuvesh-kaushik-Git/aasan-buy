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
  footer: {
    sections: [
      {
        title: { type: String, default: 'About Us' },
        links: [{ label: String, url: String }]
      }
    ],
    socialLinks: {
      facebook:  { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter:   { type: String, default: '' },
      youtube:   { type: String, default: '' },
    },
    copyright: { type: String, default: '© 2026 AasanBuy. All rights reserved.' }
  },
  productDetailsRows: [
    {
      rowTitle: { type: String, required: true },
      type:     { type: String, enum: ['manual', 'ai', 'category', 'trending'], default: 'manual' },
      category: { type: String }, // For 'category' type
      seedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Context for AI
      items:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] // For 'manual' type
    }
  ]
}, {
  timestamps: true,
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
