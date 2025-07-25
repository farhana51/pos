
'use client'

import { useState } from "react";
import { MoreVertical, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockTeam } from "@/lib/data";
import withAuth from "@/components/withAuth";
import { TeamMember, UserRole } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamMemberDialog } from "./_components/TeamMemberDialog";


const roleColors: Record<string, string> = {
    Admin: 'bg-primary/10 text-primary',
    Advanced: 'bg-accent/20 text-accent-foreground',
    Basic: 'bg-muted text-muted-foreground',
}

function TeamPage() {
    const [team, setTeam] = useState<TeamMember[]>(mockTeam);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddMember = () => {
        setEditingMember(null);
        setIsDialogOpen(true);
    };

    const handleEditMember = (member: TeamMember) => {
        setEditingMember(member);
        setIsDialogOpen(true);
    };
    
    const handleSaveMember = (member: TeamMember) => {
        if(editingMember) {
            setTeam(team.map(m => m.id === member.id ? member : m));
        } else {
            const newMember = { ...member, id: Math.max(...team.map(m => m.id)) + 1, avatarUrl: 'https://placehold.co/100x100.png' };
            setTeam([...team, newMember]);
        }
    }

    return (
        <>
            <PageHeader title="Team Management">
                 <Button onClick={handleAddMember}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
            </PageHeader>
            <main className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Staff List</CardTitle>
                        <CardDescription>View and manage all staff members and their roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {team.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person face"/>
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {member.name}
                                        </TableCell>
                                        <TableCell>{member.userId}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={roleColors[member.role]}>{member.role}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleEditMember(member)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
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
            <TeamMemberDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                onSave={handleSaveMember}
                member={editingMember}
            />
        </>
    );
}

export default withAuth(TeamPage, ['Admin' as UserRole]);
