
import { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { QRCodeSVG } from "qrcode.react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const QRCodeDisplay = () => {
  const [currentUrl, setCurrentUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get the current URL when the component mounts
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-10">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-card shadow-md hover:shadow-lg transition-all">
            <QrCode className="h-4 w-4" />
            <span className="text-xs font-medium">Scan me</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="sm:max-w-md mx-auto rounded-t-xl">
          <SheetHeader className="text-center">
            <SheetTitle>Scan this QR Code</SheetTitle>
            <SheetDescription>
              Use your phone camera to scan this code and open the app on your mobile device
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="border-4 border-white shadow-md rounded-lg p-2 bg-white">
              <QRCodeSVG 
                value={currentUrl}
                size={200}
                includeMargin={true}
                level="L"
                imageSettings={{
                  src: "/favicon.ico",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default QRCodeDisplay;
