import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Future integration: send form to backend API
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-12 font-sans min-h-[60vh]">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight text-dark mb-4">Contact Us</h1>
        <p className="text-gray-500 font-medium max-w-lg mx-auto">
          We're here to help! Whether you have a question about an order or need assistance crafting the perfect gift, send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft">
            <h3 className="text-sm font-black text-dark uppercase tracking-widest mb-4">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-secondary text-xl">📍</span>
                </div>
                <div>
                  <p className="font-bold text-dark text-sm">Headquarters</p>
                  <p className="text-xs text-gray-500 mt-1">Gurugram</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-secondary text-xl">📞</span>
                </div>
                <div>
                  <p className="font-bold text-dark text-sm">Phone Support</p>
                  <p className="text-xs text-gray-500 mt-1">+91 8295418684</p>
                  <p className="text-xs text-secondary font-bold mt-0.5">Mon-Fri 10am to 6pm</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-secondary text-xl">✉️</span>
                </div>
                <div>
                  <p className="font-bold text-dark text-sm">Email Us</p>
                  <p className="text-xs text-gray-500 mt-1">support@aasanbuy.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-premium">
          {submitted ? (
            <div className="text-center py-8 h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              </div>
              <h3 className="font-black text-xl text-dark mb-2">Message Sent!</h3>
              <p className="text-sm text-gray-500">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-1.5 block">Full Name</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-1.5 block">Email Address</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-1.5 block">Subject</label>
                <input required type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all" placeholder="Order inquiry" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-1.5 block">Message</label>
                <textarea required rows="4" value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all" placeholder="How can we help?" />
              </div>
              <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary-light transition-all text-sm uppercase tracking-widest mt-2">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
