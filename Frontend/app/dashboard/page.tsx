"use client";

import { Button } from "@/components/ui/button";
import { Building2, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../store/slices/userSlice';
import type { RootState } from '../store/store';
import { useEffect, useState } from 'react';
import axios from "axios";
import { getCookie } from "@/app/utils/cookies";

type Workspace = {
  id: string; 
  name: string;
};

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);


  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const totalPages = Math.ceil(workspaces.length / itemsPerPage);

  useEffect(() => {
    const getWorkSpaces = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces/`, { headers: { token: getCookie("token") } });
      setWorkspaces(response.data);
    }
    getWorkSpaces();
  }, [currentPage, itemsPerPage])

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    dispatch(clearUser());
    router.push('/');
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
  };

  const displayedWorkspaces = workspaces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">

        <div className="bg-card rounded-lg p-6 shadow-sm flex justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl font-semibold">
                {user.name && user.name.trim() !== '' 
                  ? user.name.split(' ').map(n => n[0]).join('') 
                  : 'N/A'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="flex items-center gap-2"
            onClick={() => router.push("/configure-business")}
          >
            <Building2 className="h-5 w-5" />
            Configure My Business
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push("/xero-integration")}
          >
            <FileSpreadsheet className="h-5 w-5" />
            Setup Xero Integration
          </Button>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Your Workspaces</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace ID</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedWorkspaces.length > 0 ? (
                displayedWorkspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell className="font-mono">{workspace.id}</TableCell>
                    <TableCell>{workspace.name}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No workspaces available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <label htmlFor="items-per-page" className="text-sm font-medium">Items per page:</label>
              <select id="items-per-page" onChange={handleItemsPerPageChange} value={itemsPerPage} className="border rounded-md p-1">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
            <div className="flex items-center">
              <button onClick={handlePrevPage} disabled={currentPage === 1} className={`bg-gray-300 px-4 py-2 rounded-md flex items-center ${currentPage === 1 ? 'opacity-50' : ''}`}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="m-4">Page {currentPage} of {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`bg-gray-300 px-4 py-2 rounded-md flex items-center ${currentPage === totalPages ? 'opacity-50' : ''}`}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}