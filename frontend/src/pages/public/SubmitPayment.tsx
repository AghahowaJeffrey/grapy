/**
 * Public Payment Submission Page
 * Students can submit payment proofs without authentication
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fetchPublicCategoryApi, submitPaymentApi } from "../../api/public";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf"
];

const submissionSchema = z.object({
  student_name: z.string().min(2, "Name must be at least 2 characters"),
  student_phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+\d\s()-]+$/, "Invalid phone number format"),
  amount_paid: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount must have at most 2 decimal places"),
  receipt: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Receipt file is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "File size must be less than 10MB"
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only JPG, PNG, and PDF files are accepted"
    )
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

const SubmitPayment = () => {
  const { token } = useParams<{ token: string }>();
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Fetch category details
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError
  } = useQuery({
    queryKey: ["publicCategory", token],
    queryFn: () => fetchPublicCategoryApi(token!),
    enabled: !!token
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema)
  });

  // Watch receipt file for preview
  const receiptFile = watch("receipt");
  if (receiptFile && receiptFile.length > 0 && !receiptPreview) {
    const file = receiptFile[0];
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (data: SubmissionFormData) => {
      const formData = new FormData();
      formData.append("student_name", data.student_name);
      formData.append("student_phone", data.student_phone);
      formData.append("amount_paid", data.amount_paid.toString());
      formData.append("receipt", data.receipt[0]);
      return submitPaymentApi(token!, formData);
    },
    onSuccess: (data) => {
      setSubmissionSuccess(true);
      setSubmissionId(data.id);
    }
  });

  const onSubmit = (data: SubmissionFormData) => {
    submitMutation.mutate(data);
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 font-medium">
            Loading payment category...
          </p>
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md card shadow-lg text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid or Expired Link
          </h2>
          <p className="text-gray-600">
            This payment submission link is invalid or has expired. Please
            contact your course representative for a valid link.
          </p>
        </div>
      </div>
    );
  }

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md card shadow-lg text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your payment proof has been submitted and is now pending review by
            the course representative.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Submission Reference</p>
            <p className="text-2xl font-bold text-blue-600">#{submissionId}</p>
          </div>
          <p className="text-sm text-gray-600">
            Please save this reference number for your records. You will be
            notified once your submission has been reviewed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Payment Proof
          </h1>
          <p className="text-xl font-semibold text-blue-600">
            {category.title}
          </p>
          {category.description && (
            <p className="text-gray-600 mt-2">{category.description}</p>
          )}
        </div>

        {/* Expected Amount Card */}
        {category.amount_expected && (
          <div className="bg-white rounded-xl border-2 border-blue-200 p-6 mb-8 text-center">
            <p className="text-gray-600 text-sm mb-2">Expected Amount</p>
            <p className="text-3xl font-bold text-blue-600">
              $
              {typeof category.amount_expected === "number"
                ? category.amount_expected.toFixed(2)
                : category.amount_expected}
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="card shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitMutation.error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-slideIn">
                <span className="text-red-600 text-lg mt-0.5">⚠️</span>
                <p className="text-red-700 text-sm font-medium">
                  {(submitMutation.error as any)?.response?.data?.detail ||
                    "Submission failed. Please check your information and try again."}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="student_name"
                className="block text-sm font-medium text-gray-900"
              >
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="student_name"
                type="text"
                placeholder="Enter your full name"
                {...register("student_name")}
                className={`input ${errors.student_name ? "input-error" : ""}`}
                disabled={submitMutation.isPending}
              />
              {errors.student_name && (
                <p className="text-red-600 text-sm font-medium">
                  {errors.student_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="student_phone"
                className="block text-sm font-medium text-gray-900"
              >
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                id="student_phone"
                type="tel"
                placeholder="+234 800 000 0000"
                {...register("student_phone")}
                className={`input ${errors.student_phone ? "input-error" : ""}`}
                disabled={submitMutation.isPending}
              />
              {errors.student_phone && (
                <p className="text-red-600 text-sm font-medium">
                  {errors.student_phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="amount_paid"
                className="block text-sm font-medium text-gray-900"
              >
                Amount Paid <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  id="amount_paid"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount_paid", { valueAsNumber: true })}
                  className={`input pl-8 ${errors.amount_paid ? "input-error" : ""}`}
                  disabled={submitMutation.isPending}
                />
              </div>
              {errors.amount_paid && (
                <p className="text-red-600 text-sm font-medium">
                  {errors.amount_paid.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="receipt"
                className="block text-sm font-medium text-gray-900"
              >
                Payment Receipt <span className="text-red-600">*</span>
              </label>
              <div className="relative border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer">
                <input
                  id="receipt"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  {...register("receipt")}
                  className="hidden"
                  disabled={submitMutation.isPending}
                  onChange={(e) => {
                    register("receipt").onChange(e);
                    setReceiptPreview(null);
                  }}
                />
                <label htmlFor="receipt" className="cursor-pointer block">
                  <div className="text-3xl mb-2">📎</div>
                  <p className="font-medium text-gray-900">
                    Click to upload receipt
                  </p>
                  <p className="text-sm text-gray-600">
                    JPG, PNG, or PDF (Max 10MB)
                  </p>
                </label>
              </div>
              {errors.receipt && (
                <p className="text-red-600 text-sm font-medium">
                  {errors.receipt.message}
                </p>
              )}

              {receiptPreview && (
                <div className="mt-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="w-full max-h-64 object-contain rounded"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Payment Proof"
              )}
            </button>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-600 text-center">
                By submitting this form, you confirm that the information
                provided is accurate and the payment receipt is genuine.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitPayment;
