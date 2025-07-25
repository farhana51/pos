
'use client'

import { format } from "date-fns";
import { MoreVertical, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockReservations } from "@/lib/data";
import withAuth from "@/components/withAuth";
import { UserRole, Reservation } from "@/lib/types";
import { useState } from "react";
import { ReservationDialog } from "./_components/ReservationDialog";

const statusColors: Record<string, string> = {
    Confirmed: 'text-green-600 bg-green-100',
    Pending: 'text-yellow-600 bg-yellow-100',
    Cancelled: 'text-red-600 bg-red-100',
    'Seated': 'text-blue-600 bg-blue-100',
}

function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

    const handleAddReservation = () => {
        setEditingReservation(null);
        setIsDialogOpen(true);
    };

    const handleEditReservation = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setIsDialogOpen(true);
    };

    const handleSaveReservation = (reservationToSave: Omit<Reservation, 'id' | 'status'>) => {
        if (editingReservation) {
            // Update existing reservation
            const updatedReservations = reservations.map(res =>
                res.id === editingReservation.id ? { ...editingReservation, ...reservationToSave } : res
            );
            setReservations(updatedReservations);
        } else {
            // Add new reservation
            const newReservation: Reservation = {
                id: Math.max(0, ...reservations.map(r => r.id)) + 1,
                status: 'Pending', // Default status for new reservations
                ...reservationToSave
            };
            setReservations([...reservations, newReservation].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()));
        }
    };
    
    const handleCancelReservation = (id: number) => {
        setReservations(reservations.map(res => res.id === id ? {...res, status: 'Cancelled'} : res));
    }


    return (
        <>
            <PageHeader title="Reservations">
                 <Button onClick={handleAddReservation}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Reservation
                </Button>
            </PageHeader>
            <main className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Upcoming Reservations</CardTitle>
                        <CardDescription>View and manage all customer bookings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Party Size</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservations.map((res) => (
                                    <TableRow key={res.id}>
                                        <TableCell className="font-medium">
                                            <div>{res.customerName}</div>
                                            <div className="text-xs text-muted-foreground">{res.phone}</div>
                                        </TableCell>
                                        <TableCell>{res.partySize}</TableCell>
                                        <TableCell>{format(new Date(res.time), 'PPP')}</TableCell>
                                        <TableCell>{format(new Date(res.time), 'p')}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusColors[res.status]}>{res.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleEditReservation(res)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Confirm</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleCancelReservation(res.id)} className="text-destructive">Cancel</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
            <ReservationDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                onSave={handleSaveReservation}
                reservation={editingReservation}
            />
        </>
    );
}

export default withAuth(ReservationsPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole], 'reservations');
