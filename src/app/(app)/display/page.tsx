
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function DisplayPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2">
            <div className="p-12 flex flex-col justify-center">
              <h1 className="text-5xl font-headline text-primary mb-4">Welcome!</h1>
              <p className="text-lg text-muted-foreground">
                Please review your order on the screen. Let us know if you need any assistance.
              </p>
            </div>
            <div className="relative h-96 md:h-full">
              <Image
                src="https://placehold.co/600x600.png"
                alt="Restaurant interior"
                fill
                className="object-cover"
                data-ai-hint="restaurant interior"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
