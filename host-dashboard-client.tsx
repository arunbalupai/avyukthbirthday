'use client';

import { exportRsvps } from '@/app/actions';
import { type RsvpWithId } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Baby, FileDown, LogOut, Users, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

function ExportButton() {
    const { toast } = useToast();

    const handleExport = async () => {
        const result = await exportRsvps();
        if (result.data) {
            const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            const filename = `rsvps_${new Date().toISOString().split('T')[0]}.csv`;
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({
                title: 'Export Successful',
                description: 'Your RSVP list has been downloaded as a CSV file.',
            });
        } else if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Export Failed',
                description: result.error,
            });
        }
    };

    return (
        <Button onClick={handleExport} variant="secondary">
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
        </Button>
    );
}

interface HostDashboardClientProps {
  rsvps: RsvpWithId[];
  onLogout: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function HostDashboardClient({ rsvps, onLogout, onRefresh }: HostDashboardClientProps) {
  const router = useRouter();
  
  const totalRsvps = rsvps.length;
  const totalAdults = rsvps.reduce((sum, rsvp) => sum + rsvp.countAdults, 0);
  const totalKids = rsvps.reduce((sum, rsvp) => sum + rsvp.countKids, 0);
  const totalGuests = totalAdults + totalKids;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Live Summary</h2>
          <p className="text-muted-foreground">Here are the latest RSVP stats.</p>
        </div>
        <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                router.refresh();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={async () => {
                await onLogout();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-primary">{totalGuests}</div>
            <p className="text-xs text-muted-foreground">Total people attending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups RSVP'd</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{totalRsvps}</div>
            <p className="text-xs text-muted-foreground">Total number of submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guests (Age 7+)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{totalAdults}</div>
            <p className="text-xs text-muted-foreground">Adults and older children</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Little Friends (&lt;7)</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-[#15803d]">{totalKids}</div>
            <p className="text-xs text-muted-foreground">Young children</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Guest List</h3>
            <ExportButton />
        </div>
        <Card>
          <div className="guest-list-scroll">
            <Table>
                <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                    <TableHead className="font-bold">Guest Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-center">Guests</TableHead>
                    <TableHead className="text-right">Submitted</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {rsvps.length > 0 ? (
                    rsvps.map(rsvp => (
                    <TableRow key={rsvp.id}>
                        <TableCell className="font-medium">{rsvp.guestName}</TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span>{rsvp.mobileNumber}</span>
                                {rsvp.emailId && <span className="text-xs text-muted-foreground">{rsvp.emailId}</span>}
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                                <Badge className="text-base">{rsvp.countAdults + rsvp.countKids}</Badge>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {rsvp.countAdults} (7+) / {rsvp.countKids} (&lt;7)
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(rsvp.submittedAt).toLocaleDateString()}
                            <br/>
                            {new Date(rsvp.submittedAt).toLocaleTimeString()}
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No RSVPs yet. Share the link to get started!
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
