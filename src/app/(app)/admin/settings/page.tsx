

'use client'

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import withAuth from "@/components/withAuth";
import { useToast } from "@/hooks/use-toast";
import { mockTables } from "@/lib/data";
import { UserRole } from "@/lib/types";
import { FilePlus2 } from "lucide-react";
import { useEffect, useState } from "react";

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

const defaultSettings = {
    reservations: true,
    inventory: true,
    crm: false,
    deliveryTracking: true,
    suppliers: false,
    onlineOrdering: true,
    collection: true,
    delivery: true,
    restaurant: true,
    customerDisplay: true,
    kitchenDisplay: false,
    labelPrinter: true,
};

function SettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState(defaultSettings);

    const [discountSettings, setDiscountSettings] = useState({
        enabled: true,
        type: 'percentage' as 'percentage' | 'amount',
    });

    const [onlineOrderingApi, setOnlineOrderingApi] = useState({
        url: '',
        apiKey: '',
    });

    const [locationIqApiKey, setLocationIqApiKey] = useState('');
    
    useEffect(() => {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
        const savedDiscountSettings = localStorage.getItem('discountSettings');
        if (savedDiscountSettings) {
            setDiscountSettings(JSON.parse(savedDiscountSettings));
        }
        const savedApiSettings = localStorage.getItem('onlineOrderingApi');
        if (savedApiSettings) {
            setOnlineOrderingApi(JSON.parse(savedApiSettings));
        }
         const savedLocationIqKey = localStorage.getItem('locationIqApiKey');
        if (savedLocationIqKey) {
            setLocationIqApiKey(savedLocationIqKey);
        }
    }, []);


    const [printerIps, setPrinterIps] = useState<string[]>(['192.168.1.101', '', '', '', '']);

    const handleSettingChange = (key: keyof typeof settings) => (value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleDiscountSettingChange = (key: keyof typeof discountSettings, value: any) => {
        setDiscountSettings(prev => ({...prev, [key]: value}));
    }

     const handleApiSettingChange = (key: keyof typeof onlineOrderingApi, value: string) => {
        setOnlineOrderingApi(prev => ({...prev, [key]: value}));
    }


    const handlePrinterIpChange = (index: number, value: string) => {
        const newIps = [...printerIps];
        newIps[index] = value;
        setPrinterIps(newIps);
    }

    const handleSaveChanges = () => {
        // Here you would typically send the settings to your backend
        console.log("Saving settings:", { settings, printerIps, discountSettings, onlineOrderingApi, locationIqApiKey });
        localStorage.setItem('appSettings', JSON.stringify(settings));
        localStorage.setItem('discountSettings', JSON.stringify(discountSettings));
        localStorage.setItem('onlineOrderingApi', JSON.stringify(onlineOrderingApi));
        localStorage.setItem('locationIqApiKey', locationIqApiKey);
        window.dispatchEvent(new Event('storage')); // Notify other components of changes
        toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully. Some changes may require a refresh.",
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
                        <CardTitle className="font-headline">Core Services</CardTitle>
                        <CardDescription>Enable or disable the main features of your application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SettingRow id="restaurant" title="Restaurant (Floor Plan)" description="Manage table layout and dine-in orders." isChecked={settings.restaurant} onCheckedChange={handleSettingChange('restaurant')} />
                        <SettingRow id="collection" title="Collection / Takeaway" description="Allow customers to order for pickup." isChecked={settings.collection} onCheckedChange={handleSettingChange('collection')} />
                        <SettingRow id="delivery" title="Delivery" description="Offer a delivery service." isChecked={settings.delivery} onCheckedChange={handleSettingChange('delivery')} />
                        <SettingRow id="online-ordering" title="Online Orders" description="Accept orders from your website." isChecked={settings.onlineOrdering} onCheckedChange={handleSettingChange('onlineOrdering')} />
                        <SettingRow id="reservations" title="Reservation Management" description="Allow customers to book tables in advance." isChecked={settings.reservations} onCheckedChange={handleSettingChange('reservations')} />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Advanced Modules</CardTitle>
                        <CardDescription>Enable or disable additional features of the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SettingRow id="inventory" title="Inventory Management" description="Track ingredient stock levels." isChecked={settings.inventory} onCheckedChange={handleSettingChange('inventory')} />
                        <SettingRow id="crm" title="CRM & Loyalty Program" description="Manage customer relationships and rewards." isChecked={settings.crm} onCheckedChange={handleSettingChange('crm')} />
                        <SettingRow id="suppliers" title="Suppliers & Purchase Orders" description="Manage suppliers and purchase orders." isChecked={settings.suppliers} onCheckedChange={handleSettingChange('suppliers')} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Third-Party APIs</CardTitle>
                        <CardDescription>Configure keys for external services.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div>
                            <h3 className="text-base font-medium">LocationIQ API</h3>
                            <p className="text-sm text-muted-foreground mb-2">Used for address autocompletion in the delivery form.</p>
                            <div className="space-y-2">
                                <Label htmlFor="locationiq-api-key">API Key</Label>
                                <Input
                                    id="locationiq-api-key"
                                    type="password"
                                    placeholder="Enter your LocationIQ API Key"
                                    value={locationIqApiKey}
                                    onChange={(e) => setLocationIqApiKey(e.target.value)}
                                />
                            </div>
                         </div>
                         <Separator />
                         <div>
                             <h3 className="text-base font-medium">Online Ordering API</h3>
                             <p className="text-sm text-muted-foreground mb-2">Used for fetching online orders from an external service.</p>
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="api-url">API URL</Label>
                                    <Input
                                        id="api-url"
                                        placeholder="https://api.example.com/orders"
                                        value={onlineOrderingApi.url}
                                        onChange={(e) => handleApiSettingChange('url', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="api-key">API Key</Label>
                                    <Input
                                        id="api-key"
                                        type="password"
                                        placeholder="Enter your API Key"
                                        value={onlineOrderingApi.apiKey}
                                        onChange={(e) => handleApiSettingChange('apiKey', e.target.value)}
                                    />
                                </div>
                             </div>
                         </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Discount Settings</CardTitle>
                        <CardDescription>Configure discounts for orders.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <SettingRow 
                            id="discount-enabled"
                            title="Enable Discounts"
                            description="Allow staff to apply discounts to orders during payment."
                            isChecked={discountSettings.enabled}
                            onCheckedChange={(checked) => handleDiscountSettingChange('enabled', checked)}
                        />
                         {discountSettings.enabled && (
                            <>
                                <div>
                                    <Label>Discount Type</Label>
                                    <RadioGroup 
                                        value={discountSettings.type} 
                                        onValueChange={(value: 'percentage' | 'amount') => handleDiscountSettingChange('type', value)}
                                        className="mt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="percentage" id="r-percentage" />
                                            <Label htmlFor="r-percentage">Percentage (%)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="amount" id="r-amount" />
                                            <Label htmlFor="r-amount">Fixed Amount (£)</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </>
                        )}
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
