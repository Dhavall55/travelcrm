'use client';

import React, { useState } from 'react';
import { useStore, User } from '@/lib/store';
import { 
  ShieldAlert, 
  Users, 
  Search, 
  ShieldCheck, 
  Check, 
  X, 
  Lock,
  Eye,
  PlusCircle,
  Trash2,
  KeyRound
} from 'lucide-react';

const availableRoles = [
  'Agency Admin',
  'Sales Agent',
  'Operations',
  'Finance',
  'Vendor',
  'Customer'
] as const;

// Module configuration for matrix display
const moduleAccessGrid = [
  { module: 'Analytics Dashboard', view: ['Agency Admin', 'Sales Agent', 'Operations', 'Finance'], create: ['Agency Admin'], edit: ['Agency Admin'], delete: ['Agency Admin'] },
  { module: 'Leads CRM Pipeline', view: ['Agency Admin', 'Sales Agent'], create: ['Agency Admin', 'Sales Agent'], edit: ['Agency Admin', 'Sales Agent'], delete: ['Agency Admin'] },
  { module: 'Customer Database', view: ['Agency Admin', 'Sales Agent', 'Operations'], create: ['Agency Admin', 'Sales Agent'], edit: ['Agency Admin', 'Sales Agent', 'Operations'], delete: ['Agency Admin'] },
  { module: 'Itinerary Planner', view: ['Agency Admin', 'Sales Agent', 'Operations'], create: ['Agency Admin', 'Sales Agent', 'Operations'], edit: ['Agency Admin', 'Sales Agent', 'Operations'], delete: ['Agency Admin'] },
  { module: 'Vendor Registry', view: ['Agency Admin', 'Operations', 'Finance'], create: ['Agency Admin', 'Operations'], edit: ['Agency Admin', 'Operations'], delete: ['Agency Admin'] },
  { module: 'Financial Ledgers', view: ['Agency Admin', 'Finance'], create: ['Agency Admin', 'Finance'], edit: ['Agency Admin', 'Finance'], delete: ['Agency Admin'] },
  { module: 'Access & Staff Control', view: ['Agency Admin'], create: ['Agency Admin'], edit: ['Agency Admin'], delete: ['Agency Admin'] },
];

export default function EmployeesPage() {
  const { users, currentAgency, auditLogs, logAction } = useStore();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<string>('Sales Agent');

  const agencyUsers = users.filter(
    (u) =>
      u.agencyId === currentAgency.id &&
      (u.name + ' ' + u.role + ' ' + u.email)
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // Set default selected user
  React.useEffect(() => {
    if (agencyUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(agencyUsers[0].id);
    }
  }, [agencyUsers, selectedUserId]);

  const activeUser = agencyUsers.find(u => u.id === selectedUserId);
  const agencyAuditLogs = auditLogs.filter(log => log.agencyId === currentAgency.id);

  const handleRoleChange = (userId: string, newRole: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    useStore.getState().setCurrentUser({
      ...userToUpdate,
      role: newRole
    });

    // Update global list
    const updatedList = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    useStore.setState({ users: updatedList });

    logAction('UPDATE', 'UserRole', `Transferred role of ${userToUpdate.name} to ${newRole}`);
    alert(`Access Level updated for ${userToUpdate.name}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Access Control & Staff Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Modify employee security roles, inspect real-time RBAC module permissions, and audit user logs.
          </p>
        </div>
      </div>

      {/* Grid workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs items-start">
        {/* Left Side: Staff Directory (2 columns) */}
        <div className="lg:col-span-2 p-5 bg-card border border-border rounded-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Staff Directory</h2>
          
          <div className="relative text-xs">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff by name or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary/40 border border-border focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {agencyUsers.map((usr) => (
              <div 
                key={usr.id} 
                onClick={() => {
                  setSelectedUserId(usr.id);
                  setSelectedRoleForMatrix(usr.role);
                }}
                className={`p-3 bg-secondary/20 hover:bg-secondary/40 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  selectedUserId === usr.id ? 'border-primary bg-primary/5' : 'border-border/50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {usr.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{usr.name}</h4>
                    <span className="text-[9px] text-muted-foreground">{usr.email}</span>
                  </div>
                </div>

                <div className="text-right">
                  <select
                    value={usr.role}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                    className="px-2 py-1 bg-card border border-border rounded text-[10px] focus:outline-none"
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {agencyUsers.length === 0 && (
              <p className="text-center py-6 text-muted-foreground">No staff matched.</p>
            )}
          </div>
        </div>

        {/* Right Side: Permission Matrix & Audit Feed (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Permission Matrix */}
          <div className="p-5 bg-card border border-border rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                RBAC Access Rights Matrix
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-muted-foreground">Role:</span>
                <select
                  value={selectedRoleForMatrix}
                  onChange={(e) => setSelectedRoleForMatrix(e.target.value)}
                  className="px-2 py-1 bg-secondary border border-border rounded text-[10px] focus:outline-none font-semibold text-primary"
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto text-[11px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-[9px] text-muted-foreground uppercase font-bold">
                    <th className="pb-2">Workspace Module</th>
                    <th className="pb-2 text-center">View</th>
                    <th className="pb-2 text-center">Create</th>
                    <th className="pb-2 text-center">Edit</th>
                    <th className="pb-2 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {moduleAccessGrid.map((row, idx) => {
                    const hasView = row.view.includes(selectedRoleForMatrix);
                    const hasCreate = row.create.includes(selectedRoleForMatrix);
                    const hasEdit = row.edit.includes(selectedRoleForMatrix);
                    const hasDel = row.delete.includes(selectedRoleForMatrix);

                    return (
                      <tr key={idx} className="hover:bg-secondary/10">
                        <td className="py-2.5 font-medium text-foreground">{row.module}</td>
                        <td className="py-2.5 text-center">
                          {hasView ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                        </td>
                        <td className="py-2.5 text-center">
                          {hasCreate ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                        </td>
                        <td className="py-2.5 text-center">
                          {hasEdit ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                        </td>
                        <td className="py-2.5 text-center">
                          {hasDel ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/30 text-[10px] text-indigo-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Permission matrices are evaluated at the Next.js API Middleware layer for ultimate API security.</span>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="p-5 bg-card border border-border rounded-xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Staff Logs Audit Trail</h2>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {agencyAuditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-secondary/35 border border-border/30 text-xs flex justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-foreground">{log.userName}</span>
                      <span className="text-[8px] px-1 rounded bg-secondary text-muted-foreground border border-border/50 uppercase font-bold">
                        {log.action}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{log.details}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground text-right shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
              {agencyAuditLogs.length === 0 && (
                <p className="text-center py-6 text-muted-foreground">No logs recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
