import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

function SettingRow({ id, title, description, defaultChecked = false }: { id: string, title: string, description: string, defaultChecked?: boolean }) {
    return (
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor={id} className="text-base">{title}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch id={id} defaultChecked={defaultChecked} />
        </div>
    );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Admin Settings">
        <Button>Save Changes</Button>
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Modules</CardTitle>
                    <CardDescription>Enable or disable major features of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingRow id="reservations" title="Reservation Management" description="Allow customers to book tables in advance." defaultChecked={true} />
                    <SettingRow id="inventory" title="Inventory Management" description="Track ingredient stock levels." defaultChecked={true} />
                    <SettingRow id="crm" title="CRM & Loyalty Program" description="Manage customer relationships and rewards." />
                    <SettingRow id="delivery" title="Delivery Driver Tracking" description="Track delivery drivers in real-time."/>
                    <SettingRow id="suppliers" title="Suppliers & Purchase Orders" description="Manage suppliers and purchase orders." />
                </CardContent>
            </Card>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Ordering Channels</CardTitle>
                        <CardDescription>Control which ordering methods are available.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SettingRow id="online-ordering" title="Online Orders" description="Accept orders from your website." defaultChecked={true} />
                        <SettingRow id="collection" title="Collection / Takeaway" description="Allow customers to order for pickup." defaultChecked={true} />
                        <SettingRow id="delivery-channel" title="Delivery" description="Offer a delivery service." />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Hardware</CardTitle>
                        <CardDescription>Configure connected hardware like printers and displays.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label>Kitchen Printers</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <Input key={i} type="text" placeholder={`Printer ${i + 1} IP`} />
                                ))}
                            </div>
                        </div>
                        <Separator />
                        <SettingRow id="customer-display" title="Customer Facing Display" description="Show order details to customers at the counter." defaultChecked={true} />
                        <SettingRow id="kitchen-display" title="Kitchen Display System" description="Send orders to a screen instead of printing." />
                        <SettingRow id="label-printer" title="Label Printer" description="Enable printing for order labels." />
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </>
  );
}
