'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  Link as LinkIcon, 
  Briefcase, 
  Building2, 
  Globe,
  ChevronDown,
  X,
  Trash2,
  Edit2,
  ExternalLink,
  Upload,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Types for our Job Tracker
type ResourceType = 'Vendor' | 'Company';
type SourceType = 'Indeed' | 'Glassdoor' | 'Linkedin' | 'Company webpage' | 'Vendor webpage';
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
  | 'Data Engineer';
type RemarkType = 'Applied' | 'For Future Positions' | 'Followup' | 'Rejected';

interface JobEntry {
  id: string;
  resource: ResourceType;
  source: SourceType;
  name: string;
  position: PositionType;
  email: string;
  phone: string;
  date: string;
  invitationLink: string;
  remarks: RemarkType;
}

export default function JobTracker() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResource, setFilterResource] = useState<string>('');
  const [filterPosition, setFilterPosition] = useState<string>('');
  const [filterRemarks, setFilterRemarks] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof JobEntry; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });
  
  const [entries, setEntries] = useState<JobEntry[]>([]);
  
  const formatDateDisplay = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM-dd-yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Filtering and Sorting Logic
  const filteredAndSortedEntries = React.useMemo(() => {
    let result = [...entries];

    // Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(entry => 
        entry.name.toLowerCase().includes(lowerSearch) ||
        entry.email.toLowerCase().includes(lowerSearch) ||
        entry.phone.toLowerCase().includes(lowerSearch) ||
        entry.position.toLowerCase().includes(lowerSearch)
      );
    }

    // Dropdown Filters
    if (filterResource) {
      result = result.filter(entry => entry.resource === filterResource);
    }
    if (filterPosition) {
      result = result.filter(entry => entry.position === filterPosition);
    }
    if (filterRemarks) {
      result = result.filter(entry => entry.remarks === filterRemarks);
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
  }, [entries, searchTerm, filterResource, filterPosition, filterRemarks, sortConfig]);

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
          resource: (row.Resource || row.resource || 'Company') as ResourceType,
          source: (row.Source || row.source || 'Linkedin') as SourceType,
          name: (row.Name || row.name || 'Unknown'),
          position: (row.Position || row.position || 'AI Engineer') as PositionType,
          email: (row.Email || row.email || ''),
          phone: (row.Phone || row.phone || ''),
          date: row.Date || row.date || new Date().toISOString().split('T')[0],
          invitationLink: row.InvitationLink || row.invitationLink || '',
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
    // Reset form state if needed
  };
  
  // Predefined options
  const resourceOptions: ResourceType[] = ['Vendor', 'Company'];
  const sourceOptions: SourceType[] = ['Indeed', 'Glassdoor', 'Linkedin', 'Company webpage', 'Vendor webpage'];
  const positionOptions: PositionType[] = [
    'AI Engineer', 'AI Developer', 'Data Analyst', 'Data Scientist', 
    'Gen AI Engineer', 'Gen AI Developer', 'ML Engineer', 'ML Developer', 
    'MLOps Engineer', 'LLMOps Engineer', 'Python Developer', 'Data Engineer'
  ];
  const remarkOptions: RemarkType[] = ['Applied', 'For Future Positions', 'Followup', 'Rejected'];

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
              onClick={() => { resetForm(); setIsFormOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus size={20} />
              <span>Add Entry</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or position..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select 
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="">All Resources</option>
              {resourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
            {(searchTerm || filterResource || filterPosition || filterRemarks) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterResource('');
                  setFilterPosition('');
                  setFilterRemarks('');
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
                    onClick={() => handleSort('resource')}
                  >
                    <div className="flex items-center gap-1">
                      Resource {sortConfig.key === 'resource' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('source')}
                  >
                    <div className="flex items-center gap-1">
                      Source {sortConfig.key === 'source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name / Position {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
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
                        <div className="flex items-center gap-2">
                          {entry.resource === 'Company' ? (
                            <Building2 className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Globe className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-900">{entry.resource}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{entry.source}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{entry.name}</p>
                          <p className="text-sm text-gray-500">{entry.position}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {entry.email && (
                            <a href={`mailto:${entry.email}`} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                              <Mail size={14} />
                              {entry.email}
                            </a>
                          )}
                          {entry.phone && (
                            <a href={`tel:${entry.phone}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
                              <Phone size={14} />
                              {entry.phone}
                            </a>
                          )}
                        </div>
                      </td>
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
                          <button className="text-gray-400 hover:text-gray-600" title="Edit Entry">
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
              <h2 className="text-xl font-bold text-gray-900">Add New Job Entry</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Resource Type</label>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  {resourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Source</label>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <input type="text" placeholder="John Doe" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Position</label>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  {positionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input type="email" placeholder="john@example.com" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input type="tel" placeholder="+1 234 567 890" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Date</label>
                <input type="date" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Invitation Link</label>
                <input type="url" placeholder="https://..." className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Remarks</label>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  {remarkOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
