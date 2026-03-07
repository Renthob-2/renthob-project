import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { X, Upload, Loader2, ImagePlus, Save } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

const AMENITIES_OPTIONS = [
  { id: "borehole", label: "Running Water (Borehole)" },
  { id: "prepaid_meter", label: "Prepaid Meter" },
  { id: "generator", label: "Generator" },
  { id: "inverter", label: "Inverter" },
  { id: "solar", label: "Solar Power" },
  { id: "hybrid_power", label: "Hybrid Power" },
  { id: "parking", label: "Parking Space" },
  { id: "security_gate", label: "Security Gate" },
  { id: "fenced", label: "Fenced Compound" },
  { id: "floored_compound", label: "Floored Compound" },
  { id: "ensuite", label: "Fully Ensuite" },
  { id: "wifi", label: "WiFi" },
  { id: "gym", label: "Gym" },
  { id: "pool", label: "Swimming Pool" },
  { id: "security", label: "24/7 Security" },
  { id: "ac", label: "Air Conditioning" },
  { id: "furnished", label: "Furnished" },
  { id: "balcony", label: "Balcony" },
  { id: "laundry", label: "Laundry" },
  { id: "elevator", label: "Elevator" },
];

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "duplex", label: "Duplex" },
  { value: "studio", label: "Studio" },
  { value: "penthouse", label: "Penthouse" },
  { value: "villa", label: "Villa" },
  { value: "office", label: "Office Space" },
  { value: "shop", label: "Shop" },
];

const LISTING_PURPOSES = [
  { value: "rent", label: "Rent" },
  { value: "shortlet", label: "Short-let" },
  { value: "sale", label: "Sale" },
  { value: "lease", label: "Lease" },
];

const PROPERTY_CONDITIONS = [
  { value: "new", label: "New" },
  { value: "fairly_used", label: "Fairly Used" },
  { value: "renovated", label: "Renovated" },
  { value: "old", label: "Old" },
];

const NEIGHBORHOOD_FEATURES_OPTIONS = [
  { id: "gated_estate", label: "Gated Estate" },
  { id: "tiled_estate", label: "Tiled Estate" },
  { id: "estate_security", label: "Estate Security" },
  { id: "close_to_main_road", label: "Close to Main Road" },
  { id: "close_to_market", label: "Close to Market" },
  { id: "close_to_school", label: "Close to School" },
  { id: "close_to_hospital", label: "Close to Hospital" },
  { id: "close_to_church_mosque", label: "Close to Church/Mosque" },
  { id: "close_to_bus_stop", label: "Close to Bus Stop" },
  { id: "tarred_road", label: "Tarred Road Access" },
  { id: "flood_free", label: "Flood-Free Area" },
  { id: "quiet_neighborhood", label: "Quiet Neighborhood" },
  { id: "commercial_area", label: "Commercial Area" },
  { id: "residential_area", label: "Residential Area" },
];

const BEST_SUITED_OPTIONS = [
  { id: "working_professionals", label: "Working Professionals" },
  { id: "families", label: "Families" },
  { id: "students", label: "Students" },
  { id: "shortlet_guests", label: "Short-let Guests" },
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
];

const DESCRIPTION_PLACEHOLDER = `A newly built 2-bedroom apartment in a gated estate in Ajah with 24-hour power support, borehole water, and secure parking. Ideal for young professionals or small families seeking quiet living with easy access to Lekki-Epe Expressway.`;

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description must be less than 2000 characters"),
  property_type: z.enum(["apartment", "house", "duplex", "studio", "penthouse", "villa", "office", "shop"]),
  listing_purpose: z.string().default("rent"),
  property_condition: z.string().default("new"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Price must be a positive number"),
  price_period: z.enum(["month", "year"]),
  location: z.string().min(3, "Location is required"),
  address: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  bedrooms: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Must be a valid number"),
  bathrooms: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Must be a valid number"),
  square_feet: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  neighborhood_features: z.array(z.string()).default([]),
  best_suited_for: z.array(z.string()).default([]),
  work_from_home_friendly: z.boolean().default(false),
  car_dependent_area: z.boolean().default(false),
  walkable_area: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface PropertyListingFormProps {
  property?: Property;
  isEditing?: boolean;
}

export default function PropertyListingForm({ property, isEditing = false }: PropertyListingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      property_type: "apartment",
      listing_purpose: "rent",
      property_condition: "new",
      price: "",
      price_period: "year",
      location: "",
      address: "",
      city: "",
      state: "Lagos",
      bedrooms: "1",
      bathrooms: "1",
      square_feet: "",
      amenities: [],
      neighborhood_features: [],
      best_suited_for: [],
      work_from_home_friendly: false,
      car_dependent_area: false,
      walkable_area: false,
    },
  });

  useEffect(() => {
    if (isEditing && property) {
      form.reset({
        title: property.title,
        description: property.description || "",
        property_type: property.property_type,
        listing_purpose: (property as any).listing_purpose || "rent",
        property_condition: (property as any).property_condition || "new",
        price: property.price.toString(),
        price_period: property.price_period as "month" | "year",
        location: property.location,
        address: property.address || "",
        city: property.city,
        state: property.state,
        bedrooms: property.bedrooms.toString(),
        bathrooms: property.bathrooms.toString(),
        square_feet: property.square_feet?.toString() || "",
        amenities: property.amenities || [],
        best_suited_for: (property as any).best_suited_for || [],
        work_from_home_friendly: (property as any).work_from_home_friendly || false,
        car_dependent_area: (property as any).car_dependent_area || false,
        walkable_area: (property as any).walkable_area || false,
      });
      setExistingImages(property.images || []);
    }
  }, [isEditing, property, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file type", description: `${file.name} is not an image`, variant: "destructive" });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds 5MB limit`, variant: "destructive" });
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > 10) {
      toast({ title: "Too many images", description: "Maximum 10 images allowed", variant: "destructive" });
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const imageUrl = existingImages[index];
    setImagesToDelete((prev) => [...prev, imageUrl]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteRemovedImages = async () => {
    if (imagesToDelete.length === 0) return;

    const filePaths = imagesToDelete.map((url) => {
      const parts = url.split("/property-images/");
      return parts[1] || "";
    }).filter(Boolean);

    if (filePaths.length > 0) {
      await supabase.storage.from("property-images").remove(filePaths);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!user || images.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of images) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("property-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({ title: "Error", description: `You must be logged in to ${isEditing ? "update" : "create"} a listing`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await deleteRemovedImages();
      }

      const newImageUrls = await uploadImages();
      const allImages = isEditing ? [...existingImages, ...newImageUrls] : newImageUrls;

      const propertyData = {
        title: values.title,
        description: values.description,
        property_type: values.property_type,
        listing_purpose: values.listing_purpose,
        property_condition: values.property_condition,
        price: parseFloat(values.price),
        price_period: values.price_period,
        location: values.location,
        address: values.address || null,
        city: values.city,
        state: values.state,
        bedrooms: parseInt(values.bedrooms),
        bathrooms: parseInt(values.bathrooms),
        square_feet: values.square_feet ? parseInt(values.square_feet) : null,
        amenities: values.amenities,
        images: allImages,
        best_suited_for: values.best_suited_for,
        work_from_home_friendly: values.work_from_home_friendly,
        car_dependent_area: values.car_dependent_area,
        walkable_area: values.walkable_area,
      };

      if (isEditing && property) {
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", property.id)
          .eq("owner_id", user.id);

        if (error) throw error;

        toast({ title: "Success!", description: "Your property listing has been updated." });
      } else {
        const { error } = await supabase.from("properties").insert({
          ...propertyData,
          owner_id: user.id,
          status: "pending",
        });

        if (error) throw error;

        toast({ title: "Success!", description: "Your property listing has been submitted for review." });
      }

      navigate("/my-properties");
    } catch (error: any) {
      console.error(`Error ${isEditing ? "updating" : "creating"} listing:`, error);
      toast({ 
        title: `Error ${isEditing ? "updating" : "creating"} listing`, 
        description: error.message || "Something went wrong", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {isEditing ? "Edit Property" : "List Your Property"}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? "Update your property listing details below." 
                : "Fill in the details below to create your property listing. All listings are reviewed before going live."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Property Identity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Identity</h3>
                  <p className="text-sm text-muted-foreground">This defines what is being listed. No ambiguity.</p>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Modern 2 Bedroom Apartment in Lekki" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="property_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROPERTY_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="listing_purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Purpose</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LISTING_PURPOSES.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                  {p.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="property_condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROPERTY_CONDITIONS.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₦)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2500000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="price_period"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Period</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="month">Per Month</SelectItem>
                                <SelectItem value="year">Per Year</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Description Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Description Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Summarize in 3–5 lines. Avoid hype words. Focus on facts + benefits. Match Nigerian context.
                  </p>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={DESCRIPTION_PLACEHOLDER}
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>Include key features, nearby landmarks, and what makes it special.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location</h3>
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area/Neighborhood</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Lekki Phase 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 15 Admiralty Way" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Lagos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NIGERIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Details</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="square_feet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Feet (Optional)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="e.g., 1200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Amenities & Neighborhood */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Amenities & Neighborhood</h3>
                  <p className="text-sm text-muted-foreground">Select all that apply to the building or estate.</p>
                  <FormField
                    control={form.control}
                    name="amenities"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {AMENITIES_OPTIONS.map((amenity) => (
                            <FormField
                              key={amenity.id}
                              control={form.control}
                              name="amenities"
                              render={({ field }) => (
                                <FormItem
                                  key={amenity.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(amenity.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, amenity.id])
                                          : field.onChange(field.value?.filter((value) => value !== amenity.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {amenity.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Lifestyle Fit */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Lifestyle Fit</h3>
                  <p className="text-sm text-muted-foreground">Help tenants understand if this property matches their lifestyle.</p>

                  <FormField
                    control={form.control}
                    name="best_suited_for"
                    render={() => (
                      <FormItem>
                        <FormLabel>Best Suited For</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                          {BEST_SUITED_OPTIONS.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="best_suited_for"
                              render={({ field }) => (
                                <FormItem
                                  key={option.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, option.id])
                                          : field.onChange(field.value?.filter((v) => v !== option.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-3 gap-6 pt-2">
                    <FormField
                      control={form.control}
                      name="work_from_home_friendly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Work-From-Home Friendly</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="car_dependent_area"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Car-Dependent Area</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="walkable_area"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Walkable Area</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Images</h3>
                  <FormDescription>
                    Upload up to 10 images. First image will be the cover photo.
                  </FormDescription>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && imagePreviews.length === 0 && (
                          <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}

                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && existingImages.length === 0 && (
                          <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            Cover
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                          New
                        </span>
                      </div>
                    ))}
                    
                    {(existingImages.length + images.length) < 10 && (
                      <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer transition-colors">
                        <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Add Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || uploadingImages}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {uploadingImages ? "Uploading Images..." : isEditing ? "Saving Changes..." : "Creating Listing..."}
                      </>
                    ) : (
                      <>
                        {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        {isEditing ? "Save Changes" : "Submit Listing"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
