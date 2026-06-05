import React, { useState } from 'react';
import { X, UserPlus, Trash2, Search, Mail, Building2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ContactManager({ isOpen, onClose, contacts, onRefreshContacts, onError }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  if (!isOpen) return null;

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !email.trim()) {
      onError('All fields are required.');
      return;
    }
    if (!validateEmail(email)) {
      onError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{ name: name.trim(), company: company.trim(), email: email.trim() }])
        .select();

      if (error) throw error;

      setName('');
      setCompany('');
      setEmail('');
      onRefreshContacts();
    } catch (err) {
      console.error('Add Contact Error:', err);
      onError(err.message || 'Failed to add contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Warning: Deleting this contact will automatically delete all deals associated with them. Are you sure?')) {
      return;
    }

    setIsDeletingId(id);
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onRefreshContacts();
    } catch (err) {
      console.error('Delete Contact Error:', err);
      onError(err.message || 'Failed to delete contact.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl glass-panel shadow-2xl border border-slate-200/80 flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/50">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Manage Contacts</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Add Contact Form */}
          <form onSubmit={handleAddContact} className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/60 space-y-4 shadow-sm">
            <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Add New Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                <input 
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 transition-colors shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 transition-colors shadow-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 transition-colors shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Add Contact
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Contacts List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Existing Contacts ({filteredContacts.length})</h3>
              
              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-xl bg-slate-50/30 shadow-sm">
              {filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  {searchQuery ? 'No contacts match your search.' : 'No contacts found. Add some contacts above.'}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition-colors">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{contact.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-indigo-600">
                            <Building2 className="w-3.5 h-3.5" />
                            {contact.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {contact.email}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        disabled={isDeletingId === contact.id}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer"
                        title="Delete Contact (Cascades to deals)"
                      >
                        {isDeletingId === contact.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
