"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { GlobalSettingsForm } from '@/components/admin/GlobalSettingsForm';

const AdminPage = () => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/login');
      } else if (!isAdmin) {
        // Logged in but not an admin, redirect to home or access denied page
        router.push('/'); // Or a specific access denied page
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading || (!user && !loading) || (user && !isAdmin && !loading)) {
    // Show a loading spinner or a simple message while checking auth status
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Loading admin panel...</p>
      </div>
    );
  }



// Only render the admin panel if user is logged in and is an admin
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-6">Welcome, Admin! Here you can manage app settings and pet data.</p>
      <div className="space-y-8"> {/* Added a div for spacing */}
        <GlobalSettingsForm /> {/* Integrated the settings form */}
        {/* Other admin features will be added here */} 
      </div>
    </div>
  );};

export default AdminPage;