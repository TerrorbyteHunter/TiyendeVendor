import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, User, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { vendor } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch vendor profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profile'],
    enabled: !!vendor,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/profile", values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsSaving(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
      setIsSaving(false);
    },
  });

  // Initialize form with vendor data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || vendor?.name || "",
      email: profile?.email || vendor?.email || "",
      phone: profile?.phone || vendor?.phone || "",
      companyName: profile?.companyName || vendor?.companyName || "",
      address: profile?.address || vendor?.address || "",
      city: profile?.city || vendor?.city || "",
    },
  });

  // Update form values when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        companyName: profile.companyName || "",
        address: profile.address || "",
        city: profile.city || "",
      });
    }
  }, [profile, form]);

  const onSubmit = (values: ProfileFormValues) => {
    setIsSaving(true);
    updateProfileMutation.mutate(values);
  };

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Vendor Profile</CardTitle>
            <CardDescription>
              Manage your personal and business information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage 
                    src={vendor?.profileImage} 
                    alt={vendor?.name}
                  />
                  <AvatarFallback className="bg-primary text-2xl">
                    {vendor?.name?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{vendor?.name}</h3>
                  <p className="text-sm text-gray-500">{vendor?.companyName}</p>
                </div>
              </div>

              {/* Profile Form Section */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Your phone number" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your company name" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Your address" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Your city" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Account Information</CardTitle>
            <CardDescription>
              Your account details and membership information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Username</h3>
                <p className="mt-1">{vendor?.username}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                <p className="mt-1">
                  {vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Account ID</h3>
                <p className="mt-1">#{vendor?.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                <p className="mt-1">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Active
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Admin Contact Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Need Help?</CardTitle>
            <CardDescription>
              Contact the Tiyende administrator for support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <p className="text-sm text-blue-700">
                  If you need assistance with your account or have questions about using the platform, 
                  please contact our administrator using the information below.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium">Email</h3>
                  <a 
                    href="mailto:Lytonechibona@gmail.com" 
                    className="mt-1 text-blue-600 hover:underline"
                  >
                    Lytonechibona@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium">WhatsApp</h3>
                  <a 
                    href="https://wa.me/260978838939" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-1 text-blue-600 hover:underline"
                  >
                    +260 978 838 939
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <div className="w-full text-center text-sm text-gray-600">
              Office hours: Monday-Friday, 8:00 AM - 5:00 PM (CAT)
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
