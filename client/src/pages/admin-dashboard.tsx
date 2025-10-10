import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaUsers, FaBlog, FaEnvelope, FaSignOutAlt, FaChartLine } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDocumentMeta } from "@/hooks/use-document-title";
import { apiRequest } from "@/lib/queryClient";
import type { Lead } from "@shared/schema";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  
  useDocumentMeta({
    title: "Admin Dashboard | Neural Coder AI",
    description: "Administration dashboard for Neural Coder AI.",
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

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/admin/leads"],
    queryFn: async () => {
      const adminPassword = localStorage.getItem("adminPassword");
      const res = await apiRequest("GET", "/api/admin/leads", undefined, {
        "X-Admin-Password": adminPassword || "",
      });
      return await res.json();
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("adminPassword");
    setLocation("/admin/login");
  };

  const newLeadsCount = leads.filter(l => l.status === "new").length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-4xl font-bold text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Admin Dashboard
          </motion.h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            data-testid="button-logout"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glassmorphism" data-testid="card-leads-stats">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <FaUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-leads">{leads.length}</div>
                <p className="text-xs text-muted-foreground">
                  {newLeadsCount} new leads
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/admin/leads">
              <Card className="glassmorphism cursor-pointer hover:bg-accent/50 transition-colors" data-testid="card-manage-leads">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Manage Leads</CardTitle>
                  <FaEnvelope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">View All</div>
                  <p className="text-xs text-muted-foreground">
                    Click to manage contact leads
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/admin/blog">
              <Card className="glassmorphism cursor-pointer hover:bg-accent/50 transition-colors" data-testid="card-manage-blog">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                  <FaBlog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Manage</div>
                  <p className="text-xs text-muted-foreground">
                    Create and edit blog posts
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glassmorphism" data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/leads">
                <Button variant="outline" className="w-full justify-start" data-testid="button-view-leads">
                  <FaEnvelope className="mr-2" />
                  View All Leads
                </Button>
              </Link>
              <Link href="/admin/blog">
                <Button variant="outline" className="w-full justify-start" data-testid="button-manage-blog">
                  <FaBlog className="mr-2" />
                  Manage Blog Posts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
