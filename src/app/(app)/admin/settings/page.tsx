
'use client'

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import withAuth from "@/components/withAuth";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/types";
import { useState } from "react";

function SettingRow({ id, title, description, isChecked, onCheckedChange }: { id: string, title:string, description: string, isChecked: boolean, onCheckedChange: (checked: boolean) => void }) {
    return (
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor={id} className="text-base">{title}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch id={id} checked={isChecked} onCheckedChange={onCheckedChange} />
        </div>
    );
}

function SettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        reservations: true,
        inventory: true,
        crm: false,
        deliveryTracking: false,
        suppliers: false,
        onlineOrdering: true,
        collection: true,
        deliveryChannel: false,
        customerDisplay: true,
        kitchenDisplay: false,
        labelPrinter: false,
    });

    const [printerIps, setPrinterIps] = useState<string[]>(['192.168.1.101', '', '', '', '']);

    const handleSettingChange = (key: keyof typeof settings) => (value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handlePrinterIpChange = (index: number, value: string) => {
        const newIps = [...printerIps];
        newIps[index] = value;
        setPrinterIps(newIps);
    }

    const handleSaveChanges = () => {
        // Here you would typically send the settings to your backend
        console.log("Saving settings:", { settings, printerIps });
        toast({
            title: "Settings Saved",
            description: "Your changes have been successfully saved.",
        });
    }

  return (
    <>
      <PageHeader title="Admin Settings">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Modules</CardTitle>
                        <CardDescription>Enable or disable major features of the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SettingRow id="reservations" title="Reservation Management" description="Allow customers to book tables in advance." isChecked={settings.reservations} onCheckedChange={handleSettingChange('reservations')} />
                        <SettingRow id="inventory" title="Inventory Management" description="Track ingredient stock levels." isChecked={settings.inventory} onCheckedChange={handleSettingChange('inventory')} />
                        <SettingRow id="crm" title="CRM & Loyalty Program" description="Manage customer relationships and rewards." isChecked={settings.crm} onCheckedChange={handleSettingChange('crm')} />
                        <SettingRow id="delivery" title="Delivery Driver Tracking" description="Track delivery drivers in real-time." isChecked={settings.deliveryTracking} onCheckedChange={handleSettingChange('deliveryTracking')} />
                        <SettingRow id="suppliers" title="Suppliers & Purchase Orders" description="Manage suppliers and purchase orders." isChecked={settings.suppliers} onCheckedChange={handleSettingChange('suppliers')} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Ordering Channels</CardTitle>
                        <CardDescription>Control which ordering methods are available.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SettingRow id="online-ordering" title="Online Orders" description="Accept orders from your website." isChecked={settings.onlineOrdering} onCheckedChange={handleSettingChange('onlineOrdering')} />
                        <SettingRow id="collection" title="Collection / Takeaway" description="Allow customers to order for pickup." isChecked={settings.collection} onCheckedChange={handleSettingChange('collection')} />
                        <SettingRow id="delivery-channel" title="Delivery" description="Offer a delivery service." isChecked={settings.deliveryChannel} onCheckedChange={handleSettingChange('deliveryChannel')} />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Hardware</CardTitle>
                        <CardDescription>Configure connected hardware like printers and displays.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label>Kitchen Printers</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {printerIps.map((ip, i) => (
                                    <Input 
                                        key={i} 
                                        type="text" 
                                        placeholder={`Printer ${i + 1} IP`} 
                                        value={ip}
                                        onChange={(e) => handlePrinterIpChange(i, e.target.value)}
                                    />
                                ))}
                            </div>
                        </div>
                        <Separator />
                        <SettingRow id="customer-display" title="Customer Facing Display" description="Show order details to customers at the counter." isChecked={settings.customerDisplay} onCheckedChange={handleSettingChange('customerDisplay')} />
                        <SettingRow id="kitchen-display" title="Kitchen Display System" description="Send orders to a screen instead of printing." isChecked={settings.kitchenDisplay} onCheckedChange={handleSettingChange('kitchenDisplay')} />
                        <SettingRow id="label-printer" title="Label Printer" description="Enable printing for order labels." isChecked={settings.labelPrinter} onCheckedChange={handleSettingChange('labelPrinter')} />
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </>
  );
}

export default withAuth(SettingsPage, ['Admin' as UserRole]);
