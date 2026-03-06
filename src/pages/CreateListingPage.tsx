import { BackButton } from "@/components/BackButton";
import PropertyListingForm from "@/components/property/PropertyListingForm";

export default function CreateListingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <PropertyListingForm />
    </div>
  );
}
