import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText, Trash2, ShieldAlert } from 'lucide-react';
import api from '@/services/api';

import type { Property } from './PropertiesPage';
import type { Tenant } from './TenantsPage';

export interface Agreement {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  agreed_rent: number;
  deposit: number;
  status: 'active' | 'expired' | 'terminated';
}

export function AgreementsPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'terminated'>('all');
  
  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    agreed_rent: '',
    deposit: '0'
  });

  const { data: agreements = [], isLoading: isLoadingAgreements } = useQuery<Agreement[]>({
    queryKey: ['agreements'],
    queryFn: () => api.get('/agreements/').then(res => res.data)
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: () => api.get('/properties/').then(res => res.data)
  });

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants/').then(res => res.data)
  });

  const filteredAgreements = agreements.filter(a => {
    const property = properties.find(p => p.id === a.property_id);
    const tenant = tenants.find(t => t.id === a.tenant_id);
    const propertyName = property?.name.toLowerCase() || '';
    const tenantName = tenant ? `${tenant.first_name} ${tenant.last_name}`.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = propertyName.includes(query) || tenantName.includes(query);
    
    if (statusFilter !== 'all') {
      return matchesSearch && a.status === statusFilter;
    }
    return matchesSearch;
  });

  const createMutation = useMutation({
    mutationFn: (newAgreement: Omit<Agreement, 'id' | 'status'> & { status?: 'active' | 'expired' | 'terminated' }) => api.post('/agreements/', newAgreement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agreements'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsOpen(false);
      setFormData({ property_id: '', tenant_id: '', start_date: '', end_date: '', agreed_rent: '', deposit: '0' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/agreements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agreements'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteId(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      property_id: formData.property_id,
      tenant_id: formData.tenant_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      agreed_rent: parseFloat(formData.agreed_rent),
      deposit: parseFloat(formData.deposit)
    });
  };

  const isLoading = isLoadingAgreements;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Agreements</h2>
          <p className="text-muted-foreground">Manage rental agreements between properties and tenants.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="hover:scale-105 transition-transform"><Plus className="mr-2 h-4 w-4" /> New Agreement</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Rental Agreement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_id">Property</Label>
                  <select 
                    id="property_id" 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.property_id} 
                    onChange={e => setFormData({...formData, property_id: e.target.value})} 
                    required
                  >
                    <option value="">Select Property</option>
                    {properties.filter(p => p.is_available).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant_id">Tenant</Label>
                  <select 
                    id="tenant_id" 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.tenant_id} 
                    onChange={e => setFormData({...formData, tenant_id: e.target.value})} 
                    required
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input id="start_date" type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agreed_rent">Rent Amount (₹)</Label>
                  <Input id="agreed_rent" type="number" step="0.01" value={formData.agreed_rent} onChange={e => setFormData({...formData, agreed_rent: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">Security Deposit (₹)</Label>
                  <Input id="deposit" type="number" step="0.01" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Agreement'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : agreements.length === 0 ? (
          <div className="border-dashed border-2 border-muted bg-muted/5 flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-2xl">
            <FileText className="h-12 w-12 opacity-30 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No agreements registered yet</span>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card/30 backdrop-blur-sm p-3 rounded-2xl border border-border/20 shadow-sm">
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </span>
                <Input 
                  type="text" 
                  placeholder="Search agreements (property/tenant)..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="pl-9 w-full"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {(['all', 'active', 'expired', 'terminated'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={statusFilter === filter ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(filter)}
                    size="sm"
                    className="capitalize flex-1 md:flex-initial"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            {filteredAgreements.length === 0 ? (
              <div className="border-dashed border-2 border-muted bg-muted/5 flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-2xl">
                <FileText className="h-12 w-12 opacity-30 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No matching agreements found</span>
              </div>
            ) : (
              <div className="bg-card/20 backdrop-blur-sm border border-border/20 rounded-2xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Property</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-right">Rent</TableHead>
                      <TableHead className="text-right">Deposit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgreements.map((a) => (
                      <TableRow key={a.id} className="hover:bg-muted/10 group">
                        <TableCell className="font-semibold text-foreground">{properties.find(p => p.id === a.property_id)?.name || `Property`}</TableCell>
                        <TableCell>{tenants.find(t => t.id === a.tenant_id)?.first_name} {tenants.find(t => t.id === a.tenant_id)?.last_name}</TableCell>
                        <TableCell>{new Date(a.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(a.end_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-bold text-foreground">₹{Number(a.agreed_rent).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{Number(a.deposit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                            a.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            {a.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            onClick={() => setDeleteId(a.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you absolutely sure you want to terminate/delete this agreement? This action will restore property availability.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Terminating...' : 'Terminate Agreement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
