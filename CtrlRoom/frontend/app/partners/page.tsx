'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Mail, Edit2, TrendingUp, Trash2, Building2, Filter, Tag, Save, Bookmark, X, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/Button';

interface Partner {
  id: string;
  organizationName: string;
  schoolType?: string | null;
  websiteUrl?: string | null;
  partnerStatus?: string | null;
  partnerType?: string | null;
  courseNumber?: number | null;
  earlyReleaseForSeniors: boolean;
  tags: string[];
  contacts: Array<{ id: string; name: string; email: string; title?: string | null }>;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  isDefault: boolean;
}

export default function PartnersPage() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [filters, setFilters] = useState({
    partnerType: '',
    partnerStatus: '',
    schoolType: '',
    earlyReleaseEligible: '',
    tags: [] as string[],
  });
  const [formData, setFormData] = useState({
    organizationName: '',
    schoolType: '',
    websiteUrl: '',
    courseNumber: '',
    earlyReleaseForSeniors: false,
    tags: [] as string[],
    contacts: [{ name: '', email: '', title: '' }],
  });

  useEffect(() => {
    fetchPartners();
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const data = await api.getSavedSearches('partners');
      setSavedSearches(data);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    }
  };

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await api.getPartners();
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    try {
      if (editingId) {
        await api.updatePartner(editingId, {
          organizationName: formData.organizationName,
          schoolType: formData.schoolType,
          websiteUrl: formData.websiteUrl,
          courseNumber: formData.courseNumber ? parseInt(formData.courseNumber) : null,
          earlyReleaseForSeniors: formData.earlyReleaseForSeniors,
          tags: formData.tags,
          contacts: formData.contacts,
        });
      } else {
        await api.createPartner({
          organizationName: formData.organizationName,
          schoolType: formData.schoolType,
          websiteUrl: formData.websiteUrl,
          courseNumber: formData.courseNumber ? parseInt(formData.courseNumber) : null,
          earlyReleaseForSeniors: formData.earlyReleaseForSeniors,
          tags: formData.tags,
          createdById: user.id,
          contacts: { create: formData.contacts },
        });
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      await fetchPartners();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      organizationName: '',
      schoolType: '',
      websiteUrl: '',
      courseNumber: '',
      earlyReleaseForSeniors: false,
      tags: [],
      contacts: [{ name: '', email: '', title: '' }],
    });
  };

  const handleEdit = (partner: Partner) => {
    setFormData({
      organizationName: partner.organizationName,
      schoolType: partner.schoolType || '',
      websiteUrl: partner.websiteUrl || '',
      courseNumber: partner.courseNumber?.toString() || '',
      earlyReleaseForSeniors: partner.earlyReleaseForSeniors,
      tags: partner.tags || [],
      contacts: partner.contacts.map(c => ({
        name: c.name,
        email: c.email,
        title: c.title || '',
      })),
    });
    setEditingId(partner.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this partner?')) return;
    try {
      await api.deletePartner(id);
      await fetchPartners();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const filteredPartners = partners.filter(p => {
    // Text search
    const matchesSearch = !searchQuery ||
      p.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contacts.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // Advanced filters
    const matchesPartnerType = !filters.partnerType || p.partnerType === filters.partnerType;
    const matchesPartnerStatus = !filters.partnerStatus || p.partnerStatus === filters.partnerStatus;
    const matchesSchoolType = !filters.schoolType || p.schoolType === filters.schoolType;
    const matchesEarlyRelease = !filters.earlyReleaseEligible ||
      (filters.earlyReleaseEligible === 'true' && p.earlyReleaseForSeniors) ||
      (filters.earlyReleaseEligible === 'false' && !p.earlyReleaseForSeniors);
    const matchesTags = filters.tags.length === 0 ||
      filters.tags.every(tag => p.tags.includes(tag));

    return matchesSearch && matchesPartnerType && matchesPartnerStatus &&
           matchesSchoolType && matchesEarlyRelease && matchesTags;
  });

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) return;

    try {
      await api.createSavedSearch({
        name: saveSearchName,
        searchType: 'partners',
        filters: { searchQuery, ...filters }
      });
      setShowSaveSearch(false);
      setSaveSearchName('');
      fetchSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleLoadSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.filters.searchQuery || '');
    setFilters({
      partnerType: savedSearch.filters.partnerType || '',
      partnerStatus: savedSearch.filters.partnerStatus || '',
      schoolType: savedSearch.filters.schoolType || '',
      earlyReleaseEligible: savedSearch.filters.earlyReleaseEligible || '',
      tags: savedSearch.filters.tags || [],
    });
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      await api.deleteSavedSearch(id);
      fetchSavedSearches();
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      partnerType: '',
      partnerStatus: '',
      schoolType: '',
      earlyReleaseEligible: '',
      tags: [],
    });
  };

  const addTagFilter = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters({...filters, tags: [...filters.tags, tag]});
    }
  };

  const removeTagFilter = (tag: string) => {
    setFilters({...filters, tags: filters.tags.filter(t => t !== tag)});
  };

  // Get all unique tags from partners
  const allTags = Array.from(new Set(partners.flatMap(p => p.tags))).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Partners Directory</h1>
            <p className="mt-1 text-muted-foreground">Manage school and organizational partnerships.</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              resetForm();
              setShowForm(!showForm);
            }}
            className={showForm ? 'bg-slate-600 hover:bg-slate-700' : 'bg-cyan-500 hover:bg-cyan-600'}
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add Partner'}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {editingId ? 'Edit Partner' : 'Add New Partner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tech Academy High School"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">School Type</label>
                  <input
                    type="text"
                    placeholder="High School / Vocational"
                    value={formData.schoolType}
                    onChange={(e) => setFormData({...formData, schoolType: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Course Number</label>
                  <input
                    type="number"
                    placeholder="101"
                    value={formData.courseNumber}
                    onChange={(e) => setFormData({...formData, courseNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="earlyRelease"
                  checked={formData.earlyReleaseForSeniors}
                  onChange={(e) => setFormData({...formData, earlyReleaseForSeniors: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="earlyRelease" className="text-sm font-medium text-foreground">
                  Early Release Program for Seniors
                </label>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Tag size={16} />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.tags.filter((_, i) => i !== idx);
                          setFormData({...formData, tags: updated});
                        }}
                        className="hover:bg-cyan-200 rounded-full p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tags (press Enter to add)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      e.preventDefault();
                      const newTag = e.currentTarget.value.trim();
                      if (!formData.tags.includes(newTag)) {
                        setFormData({...formData, tags: [...formData.tags, newTag]});
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-xs text-muted-foreground">Tags help categorize and search partners. Press Enter to add a tag.</p>
              </div>

              {/* Contacts */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Primary Contact</label>
                {formData.contacts.map((contact, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Contact name"
                      value={contact.name}
                      onChange={(e) => {
                        const updated = [...formData.contacts];
                        updated[idx].name = e.target.value;
                        setFormData({...formData, contacts: updated});
                      }}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="email"
                      placeholder="contact@example.com"
                      value={contact.email}
                      onChange={(e) => {
                        const updated = [...formData.contacts];
                        updated[idx].email = e.target.value;
                        setFormData({...formData, contacts: updated});
                      }}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={contact.title}
                      onChange={(e) => {
                        const updated = [...formData.contacts];
                        updated[idx].title = e.target.value;
                        setFormData({...formData, contacts: updated});
                      }}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  {editingId ? 'Update Partner' : 'Add Partner'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search partners by name, contact, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={clsx(
                "px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors",
                showAdvancedSearch
                  ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={14} className={clsx("transition-transform", showAdvancedSearch && "rotate-180")} />
            </button>
            <button
              onClick={() => setShowSaveSearch(true)}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save size={16} />
              Save Search
            </button>
          </div>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Bookmark size={14} />
                Saved searches:
              </span>
              {savedSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => handleLoadSearch(search)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm flex items-center gap-1 transition-colors"
                >
                  {search.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSearch(search.id);
                    }}
                    className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Advanced Filters */}
          {showAdvancedSearch && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Partner Type</label>
                  <select
                    value={filters.partnerType}
                    onChange={(e) => setFilters({...filters, partnerType: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Types</option>
                    <option value="Educational Non-Profit">Educational Non-Profit</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Government">Government</option>
                    <option value="Community Organization">Community Organization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={filters.partnerStatus}
                    onChange={(e) => setFilters({...filters, partnerStatus: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">School Type</label>
                  <select
                    value={filters.schoolType}
                    onChange={(e) => setFilters({...filters, schoolType: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Types</option>
                    <option value="High School">High School</option>
                    <option value="Vocational">Vocational</option>
                    <option value="Community College">Community College</option>
                    <option value="University">University</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Early Release</label>
                  <select
                    value={filters.earlyReleaseEligible}
                    onChange={(e) => setFilters({...filters, earlyReleaseEligible: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All</option>
                    <option value="true">Eligible</option>
                    <option value="false">Not Eligible</option>
                  </select>
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {filters.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs"
                    >
                      {tag}
                      <button
                        onClick={() => removeTagFilter(tag)}
                        className="hover:bg-cyan-200 rounded-full p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.filter(tag => !filters.tags.includes(tag)).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTagFilter(tag)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Save Search Modal */}
          {showSaveSearch && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-foreground mb-4">Save Search</h3>
                <input
                  type="text"
                  placeholder="Enter search name..."
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveSearch}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveSearch(false);
                      setSaveSearchName('');
                    }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-foreground rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Partners Grid */}
        <div className="grid gap-4">
          {filteredPartners.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No partners found</p>
            </div>
          ) : (
            filteredPartners.map((partner) => (
              <div key={partner.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{partner.organizationName}</h3>
                        {partner.schoolType && (
                          <p className="text-sm text-muted-foreground mt-1">{partner.schoolType}</p>
                        )}
                      </div>
                      {partner.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {partner.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {partner.tags.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                              +{partner.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {partner.contacts.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {partner.contacts.map((contact) => (
                          <div key={contact.id} className="text-sm">
                            <p className="font-medium text-foreground">{contact.name}</p>
                            <p className="text-muted-foreground">{contact.title || 'Contact'} • {contact.email}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {partner.contacts[0]?.email && (
                      <Link href={`/email?partnerId=${partner.id}`}>
                        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                          <Mail size={16} />
                          Email
                        </Button>
                      </Link>
                    )}
                    <button
                      onClick={() => handleEdit(partner)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-foreground rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

