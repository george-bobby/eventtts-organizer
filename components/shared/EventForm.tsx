"use client";
import React, { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  useFieldArray,
  ControllerRenderProps,
  FieldPath,
} from "react-hook-form";
import * as z from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/constants/categories";
// Note: Temporary workaround for TypeScript module resolution issue
// import { campusLocations } from "@/lib/campus-data";
const campusLocations = [
  { name: "Main Gate", lat: 12.863788, lng: 77.434897 },
  { name: "Cross Road", lat: 12.86279, lng: 77.437411 },
  { name: "Block 1", lat: 12.863154, lng: 77.437718 },
  { name: "Students Square", lat: 12.862314, lng: 77.43824 },
  { name: "Open Auditorium", lat: 12.86251, lng: 77.438496 },
  { name: "Block 4", lat: 12.862211, lng: 77.43886 },
  { name: "Xpress Cafe", lat: 12.862045, lng: 77.439374 },
  { name: "Block 6", lat: 12.862103, lng: 77.439809 },
  { name: "Amphi Theater", lat: 12.861424, lng: 77.438057 },
  { name: "PU Block", lat: 12.860511, lng: 77.437249 },
  { name: "Architecture Block", lat: 12.860132, lng: 77.438592 },
];
import { createEvent, updateEvent } from "@/lib/actions/event.action";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { FileUploader } from "./FileUploader";
import SubEventForm from "./SubEventForm";
import { useUploadThing } from "@/lib/uploadthing";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------- SUB EVENT SCHEMA ----------------
const subEventSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z
    .string()
    .trim()
    .min(2, { message: "Description must be at least 2 characters." })
    .optional(),
  photo: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  isOnline: z.boolean().optional(),
  location: z.string().trim().optional(),
  isFree: z.boolean(),
  price: z.string().trim().optional(),
  totalCapacity: z.string().trim().optional(),
});

// ---------------- EVENT SCHEMA ----------------
const formSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, { message: "Title must be at least 2 characters." }),
    category: z.string().min(1, { message: "Category is required." }),
    tags: z
      .array(
        z.string().min(2, { message: "Tag must be at least 2 characters." }),
      )
      .min(1, { message: "At least one tag is required." }),
    description: z
      .string()
      .trim()
      .min(2, { message: "Description must be at least 2 characters." }),
    photo: z.string().optional(),
    isOnline: z.boolean(),
    location: z.string().trim().optional(),
    campusLocation: z.string().trim().optional(),
    startDate: z.date({ required_error: "Start date is required." }),
    endDate: z.date({ required_error: "End date is required." }),
    startTime: z.string().min(1, { message: "Start time is required." }),
    endTime: z.string().min(1, { message: "End time is required." }),
    duration: z.string().trim().optional(),
    totalCapacity: z
      .string()
      .trim()
      .min(1, { message: "Capacity is required." }),
    isFree: z.boolean(),
    price: z.string().trim().optional(),
    ageRestriction: z.string().trim().optional(),
    url: z.string().trim().optional(),
    subEvents: z.array(subEventSchema).optional(),
    // Feedback fields
    feedbackEnabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If event is physical (not online), location is required
      if (!data.isOnline && (!data.location || data.location.trim() === "")) {
        return false;
      }
      // If event is not free, price is required
      if (!data.isFree && (!data.price || data.price.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message:
        "Location is required for physical events and price is required for paid events.",
      path: ["location"], // This will show the error on the location field
    },
  );

// Type alias for the form schema
type EventFormValues = z.infer<typeof formSchema>;

// ---------------- INTERFACES ----------------
interface IEvent {
  _id: string;
  title: string;
  category: any;
  tags: any[];
  description: string;
  photo?: string;
  isOnline?: boolean;
  location?: string;
  landmark?: string;
  campusLocation?: string;
  startDate: string | Date;
  endDate: string | Date;
  startTime: string;
  endTime: string;
  duration?: number;
  totalCapacity?: number;
  isFree: boolean;
  price?: number;
  ageRestriction?: number;
  url?: string;
  organizer: string;
}

interface Props {
  userId: string;
  type: "create" | "edit";
  event?: IEvent;
  eventId?: string;
}

const EventForm = ({ userId, type = "create", event, eventId }: Props) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [successEvent, setSuccessEvent] = useState<{ _id: string; title: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadErrorRef = useRef<string | null>(null);

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadError: (err: any) => {
      console.error("[EventForm] useUploadThing onUploadError:", err);
      uploadErrorRef.current = err.message || err.toString();
    },
    onClientUploadComplete: (res: any) => {
      console.log("[EventForm] useUploadThing onClientUploadComplete:", res);
      uploadErrorRef.current = null;
    }
  });

  // ---------------- INITIAL VALUES ----------------
  const getInitialValues = () => {
    if (event && type === "edit") {
      const tagNames = event.tags.map((tag) =>
        typeof tag === "object" ? tag.name : tag,
      );

      return {
        title: event.title || "",
        category: event.category._id || event.category || "",
        tags: tagNames || [],
        description: event.description || "",
        photo: event.photo || "",
        isOnline: event.isOnline || false,
        location: event.location || "",
        campusLocation: event.campusLocation || "",
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        duration: event.duration ? event.duration.toString() : "",
        totalCapacity: event.totalCapacity
          ? event.totalCapacity.toString()
          : "",
        isFree: event.isFree || false,
        price: event.price ? event.price.toString() : "",
        ageRestriction: event.ageRestriction
          ? event.ageRestriction.toString()
          : "",
        url: event.url || "",
        subEvents: [],
        feedbackEnabled: (event as any).feedbackEnabled ?? true,
      };
    }
    return {
      title: "",
      category: "",
      tags: [],
      description: "",
      photo: "",
      isOnline: false,
      location: "",
      campusLocation: "",
      startDate: new Date(),
      endDate: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      duration: "",
      totalCapacity: "",
      isFree: false,
      price: "",
      ageRestriction: "",
      url: "",
      subEvents: [],
      feedbackEnabled: true,
    };
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(),
  });

  const { fields, append, remove } = useFieldArray({
    name: "subEvents",
    control: form.control,
  });

  useEffect(() => {
    if (event && type === "edit") {
      form.reset(getInitialValues());
    }
  }, [event, type, form]);

  // ---------------- SUBMIT ----------------
  async function onSubmit(values: EventFormValues) {
    setIsSubmitting(true);
    setErrorMessage(null);
    let uploadedImageUrl = values.photo || "";

    try {
      if (type === "create" && files.length === 0) {
        form.setError("photo", {
          type: "manual",
          message: "Please upload an event image.",
        });
        toast({
          variant: "destructive",
          title: "Event image required",
          description: "Upload a cover image for your event before publishing.",
        });
        setIsSubmitting(false);
        return;
      }

      if (type === "edit" && files.length === 0) {
        const hasExistingImage =
          typeof values.photo === "string" &&
          values.photo.trim() !== "" &&
          !values.photo.startsWith("blob:");
        if (!hasExistingImage) {
          form.setError("photo", {
            type: "manual",
            message: "Please upload an event image or keep the existing one.",
          });
          toast({
            variant: "destructive",
            title: "Event image required",
            description: "Upload a cover image or restore the previous image.",
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (files.length > 0) {
        uploadErrorRef.current = null;
        const uploadedImages = await startUpload(files);
        if (!uploadedImages) {
          throw new Error(uploadErrorRef.current || "Please upload a valid image below of 4MB.");
        }
        uploadedImageUrl = uploadedImages[0].url;
      }

      if (type === "edit") {
        if (!eventId) throw new Error("Event ID is required for updating.");

        const updatedEvent = await updateEvent({
          userId,
          event: {
            _id: eventId,
            ...values,
            photo: uploadedImageUrl,
            imageUrl: uploadedImageUrl,
            duration: values.duration ? +values.duration : undefined,
            totalCapacity: values.totalCapacity
              ? +values.totalCapacity
              : undefined,
            price: values.price ? +values.price : undefined,
            ageRestriction: values.ageRestriction
              ? +values.ageRestriction
              : undefined,
          },
          path: `/event/${eventId}`,
        });

        if (updatedEvent) {
          form.reset();
          router.push(`/event/${updatedEvent._id}`);
          toast({
            title: "Success!",
            description: "Event updated successfully.",
          });
        }
      } else {
        const newEvent = await createEvent({
          ...values,
          photo: uploadedImageUrl,
          imageUrl: uploadedImageUrl,
          duration: values.duration ? +values.duration : undefined,
          totalCapacity: values.totalCapacity
            ? +values.totalCapacity
            : undefined,
          price: values.price ? +values.price : undefined,
          ageRestriction: values.ageRestriction
            ? +values.ageRestriction
            : undefined,
          organizer: userId,
        });

        if (newEvent) {
          form.reset();
          setSuccessEvent({ _id: newEvent._id, title: newEvent.title });
        }
      }
    } catch (error: any) {
      console.error("[EventForm] createEvent failed:", error);
      const msg = error?.message || "An unexpected error occurred. Check the browser console for details.";
      setErrorMessage(msg);
      toast({
        variant: "destructive",
        title: "Event creation failed",
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---------------- TAG HANDLING ----------------
  const handleKeyDown = (
    e: React.KeyboardEvent,
    field: ControllerRenderProps<EventFormValues, "tags">,
  ) => {
    if (
      (e.key === "Enter" && field.name === "tags") ||
      (e.key === "," && field.name === "tags")
    ) {
      e.preventDefault();
      const tagInput = e.target as HTMLInputElement;
      const tagValue = tagInput.value.trim().toLowerCase();

      if (tagValue.length > 15) {
        return form.setError("tags", {
          type: "required",
          message: "Max length should not exceed 15 characters",
        });
      }

      if (!field.value.includes(tagValue)) {
        form.setValue("tags", [...field.value, tagValue]);
        tagInput.value = "";
        form.clearErrors("tags");
      } else {
        form.setError("tags", { type: "validate", message: "Already exists" });
        form.trigger();
      }
    }
  };

  const removeTagHandler = (
    tag: string | { _id: string; name: string },
    field: ControllerRenderProps<EventFormValues, "tags">,
  ) => {
    const newTags = field.value.filter((t: any) =>
      typeof t === "object" && typeof tag === "object"
        ? t._id !== tag._id
        : t !== tag,
    );
    form.setValue("tags", newTags);
  };

  // ---------------- SUCCESS SCREEN ----------------
  if (successEvent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-500">
        {/* Animated check */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-foreground flex items-center justify-center shadow-2xl">
            <svg
              className="w-12 h-12 text-background"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -inset-2 rounded-full border border-border animate-ping opacity-20" />
        </div>

        {/* Headline */}
        <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
          <span className="w-8 h-px bg-border" />
          Event Published
        </div>
        <h2 className="text-4xl md:text-5xl font-display tracking-tight leading-tight text-foreground mb-3">
          {successEvent.title}
        </h2>
        <p className="text-muted-foreground text-base max-w-sm mb-10">
          Your event is live and ready for attendees. What would you like to do next?
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={() => router.push(`/event/${successEvent._id}`)}
            className="flex-1 h-12 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            View Event
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex-1 h-12 border border-border text-foreground font-medium rounded-full hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Dashboard
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSuccessEvent(null)}
          className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:underline transition-colors"
        >
          Create another event
        </button>
      </div>
    );
  }

  // ---------------- FORM JSX ----------------
  return (
    <>
      {/* Processing overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
          <div className="w-12 h-12 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Publishing your event…</p>
            <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
          </div>
        </div>
      )}
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({
              field,
            }: {
              field: ControllerRenderProps<EventFormValues, "title">;
            }) => (
              <FormItem className="w-full">
                <FormLabel className="text-foreground font-medium">Event Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Event title"
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category Field */}
          <FormField
            control={form.control}
            name="category"
            render={({
              field,
            }: {
              field: ControllerRenderProps<EventFormValues, "category">;
            }) => (
              <FormItem className="w-full md:w-1/2">
                <FormLabel className="text-foreground font-medium">
                  Category *
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full h-12 border-border focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-lg bg-background hover:bg-muted/40 transition-all duration-200">
                      <SelectValue
                        placeholder="Select Category"
                        className="text-foreground"
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 w-full bg-background border border-border rounded-lg shadow-xl">
                      {categories.map((category, index) => (
                        <SelectItem
                          key={index}
                          value={
                            category.title.toLowerCase() || `category-${index}`
                          }
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 focus:bg-red-100 cursor-pointer transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600 text-lg">
                              {category.icon}
                            </span>
                            <span className="text-foreground font-medium">
                              {category.title}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tags Field */}
          <FormField
            control={form.control}
            name="tags"
            render={({
              field,
            }: {
              field: ControllerRenderProps<EventFormValues, "tags">;
            }) => (
              <FormItem className="w-full md:w-1/2">
                <FormLabel className="text-foreground font-medium">
                  Tags
                </FormLabel>
                <FormControl>
                  <div>
                    <Input
                      placeholder="Add tags (press Enter or comma to add)"
                      onKeyDown={(e) => handleKeyDown(e, field)}
                      className="input-field h-12"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTagHandler(tag, field)}
                            className="ml-1 text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Event Type Toggle */}
          <FormField
            control={form.control}
            name="isOnline"
            render={({ field }: any) => (
              <FormItem className="w-full">
                <FormLabel className="text-foreground font-medium">
                  Event Type *
                </FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!field.value}
                        onChange={() => field.onChange(false)}
                        className="w-4 h-4 text-red-600 border-border focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Physical Event
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={field.value}
                        onChange={() => field.onChange(true)}
                        className="w-4 h-4 text-red-600 border-border focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Virtual Event
                      </span>
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({
            field,
          }: {
            field: ControllerRenderProps<EventFormValues, "description">;
          }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea
                  placeholder="Event description"
                  {...field}
                  className="textarea rounded-2xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Photo Upload */}
        <FormField
          control={form.control}
          name="photo"
          render={({
            field,
          }: {
            field: ControllerRenderProps<EventFormValues, "photo">;
          }) => (
            <FormItem className="w-full">
              <FormLabel>
                Event image{type === "create" ? " *" : ""}
              </FormLabel>
              <FormDescription>
                {type === "create"
                  ? "Required — upload a cover image (e.g. PNG or JPG, max 4MB)."
                  : "Upload a new image to replace the current cover, or keep the existing one."}
              </FormDescription>
              <FormControl>
                <FileUploader
                  onFieldChange={field.onChange}
                  imageUrl={field.value || ""}
                  setFiles={setFiles}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location Fields - Only show for physical events */}
        {!form.watch("isOnline") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }: any) => (
                <FormItem className="w-full">
                  <FormLabel className="text-foreground font-medium">
                    Event Location *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Event location"
                      {...field}
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campus Location Field */}
            <FormField
              control={form.control}
              name="campusLocation"
              render={({ field }: any) => (
                <FormItem className="w-full">
                  <FormLabel className="text-foreground font-medium">
                    Campus Location
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full h-12 border-border focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-lg bg-background hover:bg-muted/40 transition-all duration-200">
                        <SelectValue
                          placeholder="Select Campus Location"
                          className="text-foreground"
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 w-full bg-background border border-border rounded-lg shadow-xl">
                        {campusLocations.map(
                          (
                            location: {
                              name: string;
                              lat: number;
                              lng: number;
                            },
                            index: number,
                          ) => (
                            <SelectItem
                              key={index}
                              value={location.name || `location-${index}`}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 focus:bg-red-100 cursor-pointer transition-colors duration-150"
                            >
                              <span className="text-foreground font-medium">
                                {location.name}
                              </span>
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }: any) => (
              <FormItem className="w-full">
                <FormLabel className="text-foreground font-medium">
                  Start Date *
                </FormLabel>
                <FormControl>
                  <CustomDatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Pick start date"
                    disabled={(date: Date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    minDate={new Date()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }: any) => (
              <FormItem className="w-full">
                <FormLabel className="text-foreground font-medium">
                  End Date *
                </FormLabel>
                <FormControl>
                  <CustomDatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Pick end date"
                    disabled={(date: Date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    minDate={new Date()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Time Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }: any) => (
              <FormItem className="w-full">
                <FormLabel className="text-foreground font-medium">
                  Start Time *
                </FormLabel>
                <FormControl>
                  <Input type="time" {...field} className="input-field" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }: any) => (
              <FormItem className="w-full">
                <FormLabel className="text-foreground font-medium">
                  End Time *
                </FormLabel>
                <FormControl>
                  <Input type="time" {...field} className="input-field" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              💰 Event Pricing
            </h3>
          </div>

          <div className="bg-muted/40 rounded-xl p-6 border border-border">
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }: any) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                        id="isFree"
                        className="h-5 w-5 border-2 border-border data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <label
                        htmlFor="isFree"
                        className="text-base font-medium text-foreground cursor-pointer"
                      >
                        This is a free event
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!form.watch("isFree") && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }: any) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-foreground font-medium">
                      Event Price
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-muted-foreground text-lg font-semibold">
                            $
                          </span>
                        </div>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          className="pl-8 h-12 border-border focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-lg text-lg"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-gray-600">
                      Enter the ticket price in USD. Leave empty for free
                      events.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Capacity Field */}
          <FormField
            control={form.control}
            name="totalCapacity"
            render={({ field }: any) => (
              <FormItem className="w-full">
                <FormLabel className="text-foreground font-medium">
                  Event Capacity *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter capacity (e.g., 100) or -1 for unlimited"
                    {...field}
                    className="input-field"
                    min="-1"
                  />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  Set a maximum number of registrants. Enter -1 for unlimited
                  capacity.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* URL Field */}
          <FormField
            control={form.control}
            name="url"
            render={({ field }: any) => (
              <FormItem className="w-full">
                <FormLabel className="text-foreground font-medium">
                  Event URL
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Event URL (optional)"
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Feedback Settings Section */}
        <div className="col-span-2 border-t pt-8 mt-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold mb-2 text-blue-900">
              📝 Feedback Collection
            </h3>
            <p className="text-blue-700 mb-6">
              You can configure feedback questions in the event management page
              after creating the event.
            </p>

            {/* Feedback Enabled */}
            <FormField
              control={form.control}
              name="feedbackEnabled"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  EventFormValues,
                  "feedbackEnabled"
                >;
              }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-semibold text-foreground">
                      Enable feedback collection
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sub Events Section */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sub Events</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  title: "",
                  description: "",
                  photo: "",
                  startDate: new Date(),
                  endDate: new Date(),
                  startTime: "09:00",
                  endTime: "17:00",
                  isOnline: false,
                  location: "",
                  isFree: true,
                  price: "",
                  totalCapacity: "",
                })
              }
            >
              Add Sub Event
            </Button>
          </div>

          {fields.map((field: any, index: number) => (
            <div key={field.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Sub Event {index + 1}</h4>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
              <SubEventForm index={index} />
            </div>
          ))}
        </div>

        {/* Inline error banner */}
        {errorMessage && (
          <div className="col-span-2 flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-5 py-4">
            <svg className="w-5 h-5 text-destructive shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-destructive">Event creation failed</p>
              <p className="text-sm text-destructive/80 mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-destructive/60 hover:text-destructive transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="col-span-2 mt-4 mb-12">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Publishing...
              </span>
            ) : (
              `${type === "create" ? "Create Event" : "Update Event"}`
            )}
          </Button>
        </div>
      </form>
    </Form>
    </>
  );
};

export default EventForm;
