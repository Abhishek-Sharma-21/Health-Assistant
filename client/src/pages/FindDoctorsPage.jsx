import React, { useState } from "react";
import { UserCheck, Star, MapPin, Search, Calendar, Phone, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const DOCTORS_LIST = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    specialty: "General Physician",
    rating: 4.8,
    reviews: 120,
    distance: "2 km away",
    location: "Sharma Clinic, Sector 15",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
    available: "Today, 4:00 PM"
  },
  {
    id: "2",
    name: "Dr. Rahul Mehta",
    specialty: "Dermatologist",
    rating: 4.7,
    reviews: 210,
    distance: "3.5 km away",
    location: "SkinCare Specialty Center",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    available: "Tomorrow, 10:30 AM"
  },
  {
    id: "3",
    name: "Dr. Sneha Kapoor",
    specialty: "Pediatrician",
    rating: 4.9,
    reviews: 160,
    distance: "1.8 km away",
    location: "Kids Care Health Hub",
    image: "https://images.unsplash.com/photo-1594824813566-78a05c6d3df3?w=300&auto=format&fit=crop&q=80",
    available: "Today, 6:00 PM"
  }
];

const SPECIALTIES = ["All", "General Physician", "Dermatologist", "Cardiologist", "Pediatrician", "Gynecologist"];

export function FindDoctorsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [bookedDoc, setBookedDoc] = useState(null);

  const filteredDoctors = selectedSpecialty === "All"
    ? DOCTORS_LIST
    : DOCTORS_LIST.filter(d => d.specialty === selectedSpecialty);

  const handleBook = (doctor) => {
    setBookedDoc(doctor);
    toast.success(`Appointment requested with ${doctor.name}!`);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
          Find Doctors
        </h1>
        <p className="text-sm text-muted-foreground">
          Find and book appointments with trusted healthcare professionals.
        </p>
      </div>

      {/* Specialty Filter Chips */}
      <div className="flex flex-wrap gap-2 pb-2">
        {SPECIALTIES.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
              selectedSpecialty === spec
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Main Grid: Doctor Cards + Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Cards List (2 Columns on Desktop) */}
        <div className="lg:col-span-2 space-y-4">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="glass-card rounded-2xl p-4 sm:p-5 border border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-cyan-500/40"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-border/60"
                />
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-base text-foreground">{doc.name}</h3>
                  <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                  
                  <div className="flex items-center gap-3 text-xs pt-1">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500" /> {doc.rating}
                      <span className="text-muted-foreground font-normal">({doc.reviews})</span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-cyan-600" /> {doc.distance}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleBook(doc)}
                className="w-full sm:w-auto text-xs font-bold px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>

        {/* Map View Card */}
        <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-4 flex flex-col justify-between h-fit">
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-600" /> Nearby Clinics
            </h3>
            <p className="text-xs text-muted-foreground">Showing verified clinics near your location.</p>
          </div>

          <div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center border border-border">
            {/* Map Placeholder graphic */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-teal-500/20" />
            <div className="text-center z-10 p-3 space-y-2">
              <MapPin className="h-8 w-8 text-cyan-600 mx-auto animate-bounce" />
              <span className="text-xs font-bold text-foreground block">Sharma Clinic</span>
              <span className="text-[10px] text-muted-foreground block">2 km away</span>
            </div>
          </div>

          <button
            onClick={() => toast("Map view loaded successfully.")}
            className="w-full text-xs font-semibold py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
          >
            View on Interactive Map
          </button>
        </div>
      </div>
    </div>
  );
}
