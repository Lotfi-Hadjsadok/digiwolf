'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  Search,
  Users,
  TrendingUp,
  AlertCircle,
  Globe,
  Clock,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  Tag,
  Calendar,
  User,
} from 'lucide-react';
import { getLeads, updateLeadStatus, bulkDeleteLeads, getLeadStats } from '@/app/actions/leads';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  category: string;
  businessDescription: string | null;
  browser: string | null;
  userAgent: string | null;
  phoneModel: string | null;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'ABANDONED';
  isAbandoned: boolean;
  abandonedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Stats {
  total: number;
  abandoned: number;
  active: number;
  byCategory: Array<{ category: string; count: number }>;
  byBrowser: Array<{ browser: string; count: number }>;
  byTime: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

interface AdminDashboardProps {
  initialLeads: Lead[];
  initialStats: Stats | null;
}

export function AdminDashboard({ initialLeads, initialStats }: AdminDashboardProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [stats, setStats] = useState<Stats | null>(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = Array.from(new Set(leads.map((lead) => lead.category)));

  const handleLogout = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await getLeads({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      if (result.success) {
        setLeads(result.leads);
        setSelectedLeads(new Set()); // Clear selection on refresh
      }
    } catch (error) {
      console.error('Error refreshing leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStats = async () => {
    try {
      const result = await getLeadStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };


  const handleStatusChange = async (leadId: string, newStatus: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'ABANDONED') => {
    const result = await updateLeadStatus(leadId, newStatus);
    if (result.success) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                status: newStatus,
                isAbandoned: newStatus === 'ABANDONED',
                abandonedAt: newStatus === 'ABANDONED' ? new Date() : null,
              }
            : lead
        )
      );
      handleRefresh();
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((lead) => lead.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedLeads.size} lead(s)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await bulkDeleteLeads(Array.from(selectedLeads));
      if (result.success) {
        setSelectedLeads(new Set());
        handleRefresh();
        handleRefreshStats();
      }
    } catch (error) {
      console.error('Error deleting leads:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleRefresh();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, categoryFilter, statusFilter]);

  const filteredLeads = leads.filter((lead) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !lead.name.toLowerCase().includes(query) &&
        !lead.email?.toLowerCase().includes(query) &&
        !lead.phone.includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  const getBrowserName = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20';
      case 'CONTACTED':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20';
      case 'QUALIFIED':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20';
      case 'CONVERTED':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20';
      case 'ABANDONED':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20 hover:bg-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'New';
      case 'CONTACTED':
        return 'Contacted';
      case 'QUALIFIED':
        return 'Qualified';
      case 'CONVERTED':
        return 'Converted';
      case 'ABANDONED':
        return 'Abandoned';
      default:
        return status;
    }
  };

  const StatusBadge = ({ lead }: { lead: Lead }) => {
    const statusOptions: Array<{ value: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'ABANDONED'; label: string }> = [
      { value: 'NEW', label: 'New' },
      { value: 'CONTACTED', label: 'Contacted' },
      { value: 'QUALIFIED', label: 'Qualified' },
      { value: 'CONVERTED', label: 'Converted' },
      { value: 'ABANDONED', label: 'Abandoned' },
    ];

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="cursor-pointer outline-none">
            <Badge
              variant="outline"
              className={`${getStatusBadgeClasses(lead.status)} cursor-pointer transition-colors`}
            >
              {getStatusLabel(lead.status)}
            </Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(lead.id, option.value)}
              className="cursor-pointer hover:bg-transparent focus:bg-transparent"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${getStatusBadgeClasses(option.value)}`}
                >
                  {option.label}
                </Badge>
                {lead.status === option.value && (
                  <span className="text-xs text-muted-foreground">(current)</span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage and analyze leads</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">Not abandoned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abandoned Leads</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.abandoned}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0
                    ? `${Math.round((stats.abandoned / stats.total) * 100)}% of total`
                    : '0%'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads Today</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byTime.today}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.byTime.thisWeek} this week
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Leads by Browser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.byBrowser.length > 0 ? (
                    stats.byBrowser.map((item) => (
                      <div key={item.browser} className="flex items-center justify-between">
                        <span className="text-sm">{item.browser}</span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No browser data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leads by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.byCategory.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{item.category}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Leads</CardTitle>
                <CardDescription>View and manage all leads</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedLeads.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className={`w-4 h-4 mr-2 ${isDeleting ? 'animate-spin' : ''}`} />
                    Delete ({selectedLeads.size})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="QUALIFIED">Qualified</SelectItem>
                  <SelectItem value="CONVERTED">Converted</SelectItem>
                  <SelectItem value="ABANDONED">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLeads.has(lead.id)}
                            onCheckedChange={() => handleSelectLead(lead.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-sm text-white hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </a>
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {lead.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getBrowserName(lead.userAgent)}
                          </div>
                          {lead.browser && (
                            <div className="text-xs text-muted-foreground">{lead.browser}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(lead.createdAt), 'h:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge lead={lead} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No leads found
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <Card key={lead.id} className={selectedLeads.has(lead.id) ? 'ring-2 ring-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <Checkbox
                          checked={selectedLeads.has(lead.id)}
                          onCheckedChange={() => handleSelectLead(lead.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold text-lg">{lead.name}</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-2 text-white hover:underline"
                            >
                              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium">{lead.phone}</span>
                            </a>
                            
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="flex items-center gap-2 text-muted-foreground hover:underline"
                              >
                                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm">{lead.email}</span>
                              </a>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <Badge variant="outline" className="capitalize text-xs">
                                {lead.category}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{getBrowserName(lead.userAgent)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(lead.createdAt), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <StatusBadge lead={lead} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

