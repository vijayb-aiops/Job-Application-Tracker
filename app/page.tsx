'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Link as LinkIcon, 
  Briefcase, 
  X,
  Trash2,
  Edit2,
  Upload,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Types for our Job Tracker
type TypeOption = 'Vendor' | 'Company';
type SourceType = 'Indeed' | 'Glassdoor' | 'Linkedin' | 'Company webpage' | 'Vendor webpage';
type JobType =
  | 'Full Time - Hybrid'
  | 'Contract - Hybrid'
  | 'Part time'
  | 'Full Time - Remote'
  | 'Contract - Remote';
type PositionType = 
  | 'AI Engineer' 
  | 'AI Developer' 
  | 'Data Analyst' 
  | 'Data Scientist' 
  | 'Gen AI Engineer' 
  | 'Gen AI Developer' 
  | 'ML Engineer' 
  | 'ML Developer' 
  | 'MLOps Engineer' 
  | 'LLMOps Engineer' 
  | 'Python Developer' 
  | 'Data Engineer'
  | 'DevOps Engineer'
  | 'Agentic AI role'
  | 'Back End Engineer'
  | 'Software Engineer'
  | 'AI Solutions Developer'
  | 'Applied AI/ML Engineer'
  | 'AI Product Engineer'
  | 'AI Deployment Engineer';
type RemarkType = 
  | 'Applied' 
  | 'Submitted-Resume' 
  | 'Interview-Scheduled' 
  | 'Initial Screeing' 
  | 'Second Round' 
  | 'Final Round' 
  | 'For Future Positions' 
  | 'Followup' 
  | 'Rejected';

interface JobEntry {
  id: string;
  type: TypeOption;
  source: SourceType;
  fullName: string;
  companyName: string;
  endClient: string;
  location: string;
  position: PositionType;
  jobType: JobType;
  email: string;
  phone: string;
  date: string;
  invitationLink: string;
  interviewTime: string;
  notes: string;
  remarks: RemarkType;
}

export default function JobTracker() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPosition, setFilterPosition] = useState<string>('');
  const [filterRemarks, setFilterRemarks] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof JobEntry; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });
  
  const [entries, setEntries] = useState<JobEntry[]>([]);
  const storageKey = 'job_tracker_entries';
  const [formData, setFormData] = useState({
    type: 'Vendor' as TypeOption,
    source: 'Indeed' as SourceType,
    fullName: '',
    companyName: '',
    endClient: '',
    location: '',
    position: 'AI Engineer' as PositionType,
    jobType: 'Full Time - Hybrid' as JobType,
    email: '',
    phone: '',
    date: '',
    invitationLink: '',
    interviewTime: '',
    notes: '',
    remarks: 'Applied' as RemarkType,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    console.log('Attempting to load from localStorage');
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored) as JobEntry[];
      if (Array.isArray(parsed)) {
        const normalized = parsed.map((entry: any) => ({
          id: entry.id || crypto.randomUUID(),
          type: entry.type || entry.resource || 'Company',
          source: entry.source || 'Linkedin',
          fullName: entry.fullName || entry.name || '',
          companyName: entry.companyName || entry.company || '',
          endClient: entry.endClient || '',
          location: entry.location || '',
          position: entry.position || 'AI Engineer',
          jobType: entry.jobType || 'Full Time - Hybrid',
          email: entry.email || '',
          phone: entry.phone || '',
          date: entry.date || new Date().toISOString().split('T')[0],
          invitationLink: entry.invitationLink || '',
          interviewTime: entry.interviewTime || '',
          notes: entry.notes || '',
          remarks: entry.remarks || 'Applied',
        })) as JobEntry[];
        setEntries(normalized);
        console.log(`Loaded ${normalized.length} entries from localStorage`);
      }
    } catch (error) {
      console.error('Failed to load entries from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(entries));
      console.log('Saved entries to localStorage');
    } catch (error) {
      console.error('Failed to save entries to localStorage', error);
    }
  }, [entries]);
  
  const formatDateDisplay = (dateStr: string) => {
    try {
      if (!dateStr) return dateStr;
      const [year, month, day] = dateStr.split('-').map(Number);
      if (!year || !month || !day) return dateStr;
      const localDate = new Date(year, month - 1, day);
      return format(localDate, 'MMM-dd-yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const storageUsage = useMemo(() => {
    try {
      const serialized = JSON.stringify(entries);
      const bytes = new TextEncoder().encode(serialized).length;
      return { bytes, kb: Math.ceil(bytes / 1024) };
    } catch {
      return { bytes: 0, kb: 0 };
    }
  }, [entries]);

  const storageWarning = storageUsage.bytes > 4.5 * 1024 * 1024;

  // Filtering and Sorting Logic
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];

    // Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(entry => 
        entry.fullName.toLowerCase().includes(lowerSearch) ||
        entry.companyName.toLowerCase().includes(lowerSearch) ||
        entry.endClient.toLowerCase().includes(lowerSearch) ||
        entry.location.toLowerCase().includes(lowerSearch) ||
        entry.email.toLowerCase().includes(lowerSearch) ||
        entry.phone.toLowerCase().includes(lowerSearch) ||
        entry.position.toLowerCase().includes(lowerSearch)
      );
    }

    // Dropdown Filters
    if (filterType) {
      result = result.filter(entry => entry.type === filterType);
    }
    if (filterPosition) {
      result = result.filter(entry => entry.position === filterPosition);
    }
    if (filterRemarks) {
      result = result.filter(entry => entry.remarks === filterRemarks);
    }
    if (filterDate) {
      result = result.filter(entry => entry.date === filterDate);
    }

    // Sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [entries, searchTerm, filterType, filterPosition, filterRemarks, filterDate, sortConfig]);

  const handleSort = (key: keyof JobEntry) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const newEntries: JobEntry[] = data.map((row: any) => ({
          id: crypto.randomUUID(),
          type: (row.Type || row.type || row.Resource || row.resource || 'Company') as TypeOption,
          source: (row.Source || row.source || 'Linkedin') as SourceType,
          fullName: (row['Full Name'] || row.fullName || row.Name || row.name || ''),
          companyName: (row.Company || row.company || row['Company Name'] || row.companyName || ''),
          endClient: (row.EndClient || row['End Client'] || row.endClient || ''),
          location: (row.Location || row.location || ''),
          position: (row.Position || row.position || 'AI Engineer') as PositionType,
          jobType: (row['Job Type'] || row.jobType || 'Full Time - Hybrid') as JobType,
          email: (row.Email || row.email || ''),
          phone: (row.Phone || row.phone || ''),
          date: row.Date || row.date || new Date().toISOString().split('T')[0],
          invitationLink: row.InvitationLink || row.invitationLink || '',
          interviewTime: row['Interview Time'] || row.interviewTime || '',
          notes: row.Notes || row.notes || '',
          remarks: (row.Remarks || row.remarks || 'Applied') as RemarkType,
        }));

        setEntries(prev => [...newEntries, ...prev]);
        alert(`Successfully imported ${newEntries.length} entries!`);
      } catch (error) {
        console.error("Error parsing excel file:", error);
        alert("Failed to parse Excel file. Please ensure it has the correct columns.");
      }
    };
    reader.readAsBinaryString(file);
    // Reset input
    e.target.value = '';
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(entries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Job Entries");
    XLSX.writeFile(workbook, `job_tracker_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const resetForm = () => {
    setFormData({
      type: 'Vendor',
      source: 'Indeed',
      fullName: '',
      companyName: '',
      endClient: '',
      location: '',
      position: 'AI Engineer',
      jobType: 'Full Time - Hybrid',
      email: '',
      phone: '',
      date: '',
      invitationLink: '',
      interviewTime: '',
      notes: '',
      remarks: 'Applied',
    });
  };

  const closeForm = () => {
    resetForm();
    setEditingEntryId(null);
    setIsFormOpen(false);
  };

  const handleFormChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedFullName = formData.fullName.trim();
    const trimmedCompanyName = formData.companyName.trim();
    if (!trimmedFullName) {
      alert('Full name is required.');
      return;
    }
    if (!trimmedCompanyName) {
      alert('Company is required.');
      return;
    }
    const baseEntry = {
      type: formData.type,
      source: formData.source,
      fullName: trimmedFullName,
      companyName: trimmedCompanyName,
      endClient: formData.endClient.trim(),
      location: formData.location,
      position: formData.position,
      jobType: formData.jobType,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      date: formData.date || new Date().toISOString().split('T')[0],
      invitationLink: formData.invitationLink.trim(),
      interviewTime: formData.interviewTime,
      notes: formData.notes.trim(),
      remarks: formData.remarks,
    };
    if (editingEntryId) {
      setEntries(prev => prev.map(entry => (
        entry.id === editingEntryId ? { ...entry, ...baseEntry } : entry
      )));
    } else {
      const newEntry: JobEntry = {
        id: crypto.randomUUID(),
        ...baseEntry,
      };
      setEntries(prev => [newEntry, ...prev]);
    }
    resetForm();
    setEditingEntryId(null);
    setIsFormOpen(false);
  };

  const handleEditEntry = (entry: JobEntry) => {
    setEditingEntryId(entry.id);
    setFormData({
      type: entry.type,
      source: entry.source,
      fullName: entry.fullName,
      companyName: entry.companyName,
      endClient: entry.endClient,
      location: entry.location,
      position: entry.position,
      jobType: entry.jobType,
      email: entry.email,
      phone: entry.phone,
      date: entry.date,
      invitationLink: entry.invitationLink,
      interviewTime: entry.interviewTime,
      notes: entry.notes,
      remarks: entry.remarks,
    });
    setIsFormOpen(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    const confirmed = window.confirm('Delete this entry? This cannot be undone.');
    if (!confirmed) return;
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
  };
  
  // Predefined options
  const typeOptions: TypeOption[] = ['Vendor', 'Company'];
  const sourceOptions: SourceType[] = ['Indeed', 'Glassdoor', 'Linkedin', 'Company webpage', 'Vendor webpage'];
  const positionOptions: PositionType[] = [
    'AI Engineer', 'AI Developer', 'Data Analyst', 'Data Scientist', 
    'Gen AI Engineer', 'Gen AI Developer', 'ML Engineer', 'ML Developer', 
    'MLOps Engineer', 'LLMOps Engineer', 'Python Developer', 'Data Engineer',
    'DevOps Engineer', 'Agentic AI role', 'Back End Engineer', 'Software Engineer',
    'AI Solutions Developer', 'Applied AI/ML Engineer', 'AI Product Engineer', 'AI Deployment Engineer'
  ];
  const jobTypeOptions: JobType[] = [
    'Full Time - Hybrid',
    'Contract - Hybrid',
    'Part time',
    'Full Time - Remote',
    'Contract - Remote',
  ];
  const locationOptions = [
    'Montreal',
    'Toronto',
    'Winnipeg',
    'Waterloo',
    'Ottawa',
    'Missisauga',
    'Vancouver',
  ];
  const remarkOptions: RemarkType[] = [
    'Applied',
    'Submitted-Resume',
    'Interview-Scheduled',
    'Initial Screeing',
    'Second Round',
    'Final Round',
    'For Future Positions',
    'Followup',
    'Rejected',
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">JobTracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm">
              <Upload size={18} />
              <span>Import Excel</span>
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button 
              onClick={exportToExcel}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
            <button 
              onClick={() => { resetForm(); setEditingEntryId(null); setIsFormOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus size={20} />
              <span>Add Entry</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {storageWarning && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
            Storage warning: you are using about {storageUsage.kb} KB in localStorage. Consider exporting data if it grows large.
          </div>
        )}
        <div className="mb-4 text-sm text-gray-600">
          Total applications: <span className="font-semibold text-gray-900">{entries.length}</span>
        </div>
        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by full name, company, or position..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="">All Types</option>
              {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select 
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="">All Positions</option>
              {positionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select 
              value={filterRemarks}
              onChange={(e) => setFilterRemarks(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="">All Status</option>
              {remarkOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            />
            {(searchTerm || filterType || filterPosition || filterRemarks || filterDate) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterPosition('');
                  setFilterRemarks('');
                  setFilterDate('');
                }}
                className="p-2.5 text-gray-500 hover:text-red-600 transition-colors"
                title="Clear Filters"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th 
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('companyName')}
                  >
                    <div className="flex items-center gap-1">
                      Company / End Client {sortConfig.key === 'companyName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-1">
                      Location {sortConfig.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('jobType')}
                  >
                    <div className="flex items-center gap-1">
                      Job Type {sortConfig.key === 'jobType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center gap-1">
                      Full Name / Position {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                  <th 
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('remarks')}
                  >
                    <div className="flex items-center gap-1">
                      Remarks {sortConfig.key === 'remarks' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedEntries.length > 0 ? (
                  filteredAndSortedEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{entry.companyName}</p>
                          <p className="text-sm text-gray-500">{entry.endClient || '—'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{entry.location || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{entry.jobType}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{entry.fullName}</p>
                          <p className="text-sm text-gray-500">{entry.position}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {entry.email && entry.email.split(',').map((email) => {
                            const trimmedEmail = email.trim();
                            if (!trimmedEmail) return null;
                            return (
                              <a
                                key={trimmedEmail}
                                href={`mailto:${trimmedEmail}`}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                              >
                                <Mail size={14} />
                                {trimmedEmail}
                              </a>
                            );
                          })}
                          {entry.phone && (
                            <a href={`tel:${entry.phone}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
                              <Phone size={14} />
                              {entry.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{entry.notes || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar size={14} />
                          {formatDateDisplay(entry.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.remarks === 'Applied' ? 'bg-blue-100 text-blue-800' :
                          entry.remarks === 'For Future Positions' ? 'bg-yellow-100 text-yellow-800' :
                          entry.remarks === 'Followup' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {entry.remarks}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {entry.invitationLink && (
                            <a 
                              href={entry.invitationLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="Open Invitation Link"
                            >
                              <LinkIcon size={16} />
                            </a>
                          )}
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            title="Edit Entry"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-600"
                            title="Delete Entry"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Briefcase size={48} className="text-gray-200" />
                        <p className="text-lg font-medium">No entries found</p>
                        <p className="text-sm">Start by adding your first job application tracking entry.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Entry Modal (Simplified for UI step) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEntryId ? 'Edit Job Entry' : 'Add New Job Entry'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleFormSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Type</label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Source</label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.source}
                  onChange={(e) => handleFormChange('source', e.target.value)}
                >
                  {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.fullName}
                  onChange={(e) => handleFormChange('fullName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Position</label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.position}
                  onChange={(e) => handleFormChange('position', e.target.value)}
                >
                  {positionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Company</label>
                <input
                  type="text"
                  placeholder="Company name"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.companyName}
                  onChange={(e) => handleFormChange('companyName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">End Client</label>
                <input
                  type="text"
                  placeholder="End client name"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.endClient}
                  onChange={(e) => handleFormChange('endClient', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Job Type</label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.jobType}
                  onChange={(e) => handleFormChange('jobType', e.target.value)}
                >
                  {jobTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Location</label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                >
                  <option value="">Select location</option>
                  {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com, jane@example.com"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 234 567 890"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Date</label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Invitation Link</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.invitationLink}
                  onChange={(e) => handleFormChange('invitationLink', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Interview Time</label>
                <input
                  type="time"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.interviewTime}
                  onChange={(e) => handleFormChange('interviewTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Add notes..."
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Remarks</label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.remarks}
                  onChange={(e) => handleFormChange('remarks', e.target.value)}
                >
                  {remarkOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {editingEntryId ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
