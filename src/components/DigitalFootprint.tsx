
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VulnerabilityReport } from "@/types";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Briefcase,
  Mail,
  User,
  Globe,
  Hash,
  Building
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DigitalFootprintProps {
  report: VulnerabilityReport;
}

// Update the interface used within the component to match the type in VulnerabilityReport
interface ProfessionalInfo {
  company: string;
  title?: string;
  period?: string;
}

interface EmailUsage {
  services: string[];
}

const DigitalFootprint = ({ report }: DigitalFootprintProps) => {
  const { digitalFootprint } = report;

  if (!digitalFootprint) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Digital Footprint</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No digital footprint information available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          Digital Footprint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Social Profiles */}
        {digitalFootprint.socialProfiles && digitalFootprint.socialProfiles.length > 0 && (
          <div>
            <h3 className="text-lg font-medium flex items-center mb-3">
              <Globe className="mr-2 h-5 w-5 text-blue-500" />
              Social Profiles
            </h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Network</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="hidden md:table-cell">URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {digitalFootprint.socialProfiles.map((profile, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{profile.network}</TableCell>
                      <TableCell>{profile.username || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {profile.url ? (
                          <a 
                            href={profile.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Visit
                          </a>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <Separator />

        {/* Professional Info */}
        {digitalFootprint.professionalInfo && digitalFootprint.professionalInfo.length > 0 && (
          <div>
            <h3 className="text-lg font-medium flex items-center mb-3">
              <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
              Professional Information
            </h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(digitalFootprint.professionalInfo as ProfessionalInfo[]).map((job, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                          {job.company}
                        </div>
                      </TableCell>
                      <TableCell>{job.title || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">{job.period || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Locations */}
          {digitalFootprint.locations && digitalFootprint.locations.length > 0 && (
            <div>
              <h3 className="text-lg font-medium flex items-center mb-3">
                <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                Known Locations
              </h3>
              <div className="space-y-2">
                {digitalFootprint.locations.map((location, index) => (
                  <div key={index} className="flex items-center p-2 rounded-md bg-secondary/50">
                    <MapPin className="mr-2 h-4 w-4 text-blue-400" />
                    <span>{location}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Usage - Only show if it exists */}
          {'emailUsage' in digitalFootprint && digitalFootprint.emailUsage && 'services' in digitalFootprint.emailUsage && (
            <div>
              <h3 className="text-lg font-medium flex items-center mb-3">
                <Mail className="mr-2 h-5 w-5 text-blue-500" />
                Email Services
              </h3>
              <div className="flex flex-wrap gap-2">
                {(digitalFootprint.emailUsage as EmailUsage).services.map((service, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interests - Only show if it exists */}
        {'interests' in digitalFootprint && digitalFootprint.interests && 
         Array.isArray(digitalFootprint.interests) && digitalFootprint.interests.length > 0 && (
          <div>
            <h3 className="text-lg font-medium flex items-center mb-3">
              <Hash className="mr-2 h-5 w-5 text-blue-500" />
              Identified Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {(digitalFootprint.interests as string[]).map((interest, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DigitalFootprint;
