import { format } from "date-fns";
import { MoreVertical, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockReservations } from "@/lib/data";

const statusColors: Record<string, string> = {
    Confirmed: 'text-green-600 bg-green-100',
    Pending: 'text-yellow-600 bg-yellow-100',
    Cancelled: 'text-red-600 bg-red-100',
}

export default function ReservationsPage() {
    return (
        <>
            <PageHeader title="Reservations">
                 <Button>
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
                                {mockReservations.map((res) => (
                                    <TableRow key={res.id}>
                                        <TableCell className="font-medium">{res.customerName}</TableCell>
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
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Confirm</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
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
        </>
    );
}
