import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaArrowLeft, FaTrash, FaEnvelope, FaPhone } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useDocumentMeta } from "@/hooks/use-document-title";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Lead } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function AdminLeadsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useDocumentMeta({
    title: "Manage Leads | Admin",
    description: "Manage contact leads and inquiries.",
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const adminPassword = localStorage.getItem("adminPassword");
      if (!adminPassword) {
        setLocation("/admin/login");
        return;
      }

      try {
        await apiRequest("POST", "/api/admin/check", undefined, {
          "X-Admin-Password": adminPassword,
        });
      } catch (error) {
        localStorage.removeItem("adminPassword");
        setLocation("/admin/login");
      }
    };

    checkAuth();
  }, [setLocation]);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/admin/leads"],
    queryFn: async () => {
      const adminPassword = localStorage.getItem("adminPassword");
      const res = await apiRequest("GET", "/api/admin/leads", undefined, {
        "X-Admin-Password": adminPassword || "",
      });
      return await res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const adminPassword = localStorage.getItem("adminPassword");
      const res = await apiRequest("PATCH", `/api/admin/leads/${id}/status`, { status }, {
        "X-Admin-Password": adminPassword || "",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const adminPassword = localStorage.getItem("adminPassword");
      const res = await apiRequest("DELETE", `/api/admin/leads/${id}`, undefined, {
        "X-Admin-Password": adminPassword || "",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new":
        return "default";
      case "contacted":
        return "secondary";
      case "qualified":
        return "default";
      case "closed":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-500";
      case "contacted":
        return "text-yellow-500";
      case "qualified":
        return "text-green-500";
      case "closed":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="outline" size="sm" data-testid="button-back">
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <motion.h1
            className="text-4xl font-bold text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Leads Management
          </motion.h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading leads...</div>
        ) : leads.length === 0 ? (
          <Card className="glassmorphism">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No leads yet. Leads will appear here when users submit the contact form.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leads.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glassmorphism" data-testid={`card-lead-${lead.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2" data-testid={`text-lead-name-${lead.id}`}>
                          {lead.name}
                        </CardTitle>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-primary" />
                            <a href={`mailto:${lead.email}`} className="hover:underline" data-testid={`link-email-${lead.id}`}>
                              {lead.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-primary" />
                            <span data-testid={`text-business-${lead.id}`}>{lead.businessNeeds}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Select
                          value={lead.status}
                          onValueChange={(status) =>
                            updateStatusMutation.mutate({ id: lead.id, status })
                          }
                        >
                          <SelectTrigger className="w-[140px]" data-testid={`select-status-${lead.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteLeadMutation.mutate(lead.id)}
                          disabled={deleteLeadMutation.isPending}
                          data-testid={`button-delete-${lead.id}`}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {lead.message && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground" data-testid={`text-message-${lead.id}`}>
                        <strong>Message:</strong> {lead.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Submitted: {new Date(lead.createdAt).toLocaleString()}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
