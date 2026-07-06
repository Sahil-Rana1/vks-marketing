import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import API from '../services/api.js';

const Contact = () => {
  const { showToast } = useToast();
  const [siteSettings, setSiteSettings] = useState({
    phone: '+91 98765 43210',
    email: 'info@vksmarketing.com',
    address: 'Sector 63, Noida, Uttar Pradesh, India'
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vks_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSiteSettings({
          phone: parsed.phone || '+91 98765 43210',
          email: parsed.email || 'info@vksmarketing.com',
          address: parsed.address || 'Sector 63, Noida, Uttar Pradesh, India'
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      subject: Yup.string().required('Subject is required'),
      message: Yup.string().required('Message is required')
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await API.post('/contacts', values);
        if (res.data.success) {
          showToast(res.data.message, 'success');
          resetForm();
        }
      } catch (error) {
        showToast(error.toString(), 'error');
      }
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none">
      <div className="text-center mb-12">
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Get in Touch</p>
        <h1 className="text-3xl font-black text-secondary dark:text-white">Contact VKS Marketing</h1>
        <p className="text-sm text-customGray mt-2">Have a question about our products or your order? We are here to help.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact detail sidebar */}
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-6 text-left select-none">
          <h3 className="font-extrabold text-base border-b pb-3 mb-4">Contact Info</h3>
          
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary text-lg flex-shrink-0">
              <FiMapPin />
            </div>
            <div className="text-xs leading-normal font-semibold text-customGray">
              <h4 className="font-extrabold text-secondary dark:text-white text-sm mb-1">Corporate HQ</h4>
              <p>{siteSettings.address}</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary text-lg flex-shrink-0">
              <FiPhone />
            </div>
            <div className="text-xs leading-normal font-semibold text-customGray">
              <h4 className="font-extrabold text-secondary dark:text-white text-sm mb-1">Call Center</h4>
              <p>{siteSettings.phone}</p>
              <p>Mon - Sat: 9:00 AM - 6:00 PM</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary text-lg flex-shrink-0">
              <FiMail />
            </div>
            <div className="text-xs leading-normal font-semibold text-customGray">
              <h4 className="font-extrabold text-secondary dark:text-white text-sm mb-1">Online Support</h4>
              <p>{siteSettings.email}</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary text-lg flex-shrink-0">
              <FiClock />
            </div>
            <div className="text-xs leading-normal font-semibold text-customGray">
              <h4 className="font-extrabold text-secondary dark:text-white text-sm mb-1">Response Time</h4>
              <p>Typically replies within 24 business hours.</p>
            </div>
          </div>
        </div>

        {/* Contact Form input */}
        <div className="lg:col-span-2 bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm text-left select-none">
          <h3 className="font-extrabold text-base mb-6">Send Us a Message</h3>
          
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-customGray block mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  {...formik.getFieldProps('name')}
                  className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none focus:border-primary/50"
                />
                {formik.touched.name && formik.errors.name ? (
                  <span className="text-[10px] text-red-500 font-semibold">{formik.errors.name}</span>
                ) : null}
              </div>

              <div>
                <label className="text-xs font-bold text-customGray block mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  {...formik.getFieldProps('email')}
                  className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none focus:border-primary/50"
                />
                {formik.touched.email && formik.errors.email ? (
                  <span className="text-[10px] text-red-500 font-semibold">{formik.errors.email}</span>
                ) : null}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-customGray block mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                {...formik.getFieldProps('subject')}
                className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none focus:border-primary/50"
              />
              {formik.touched.subject && formik.errors.subject ? (
                <span className="text-[10px] text-red-500 font-semibold">{formik.errors.subject}</span>
              ) : null}
            </div>

            <div>
              <label className="text-xs font-bold text-customGray block mb-1">Your Message</label>
              <textarea
                rows="6"
                name="message"
                {...formik.getFieldProps('message')}
                placeholder="What can we help you with?"
                className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-2xl p-3 border border-transparent focus:outline-none focus:border-primary/50"
              ></textarea>
              {formik.touched.message && formik.errors.message ? (
                <span className="text-[10px] text-red-500 font-semibold">{formik.errors.message}</span>
              ) : null}
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-primary hover:bg-primary/95 text-black font-bold rounded-2xl shadow transition-all"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Contact;
