/**
 * Public Payment Submission Page
 * Students can submit payment proofs without authentication
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchPublicCategoryApi, submitPaymentApi } from '../../api/public';
import '../../styles/public-submission.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

const submissionSchema = z.object({
  student_name: z.string().min(2, 'Name must be at least 2 characters'),
  student_phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+\d\s()-]+$/, 'Invalid phone number format'),
  amount_paid: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  receipt: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Receipt file is required')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      'File size must be less than 10MB'
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only JPG, PNG, and PDF files are accepted'
    ),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

const SubmitPayment = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);

  // Fetch category details
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: ['publicCategory', token],
    queryFn: () => fetchPublicCategoryApi(token!),
    enabled: !!token,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
  });

  // Watch receipt file for preview
  const receiptFile = watch('receipt');
  if (receiptFile && receiptFile.length > 0 && !receiptPreview) {
    const file = receiptFile[0];
    if (file.type.startsWith('image/')) {
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
      formData.append('student_name', data.student_name);
      formData.append('student_phone', data.student_phone);
      formData.append('amount_paid', data.amount_paid.toString());
      formData.append('receipt', data.receipt[0]);
      return submitPaymentApi(token!, formData);
    },
    onSuccess: (data) => {
      setSubmissionSuccess(true);
      setSubmissionId(data.id);
    },
  });

  const onSubmit = (data: SubmissionFormData) => {
    submitMutation.mutate(data);
  };

  if (categoryLoading) {
    return (
      <div className="public-container">
        <div className="public-card">
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading payment category...</p>
          </div>
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="public-container">
        <div className="public-card">
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <h2>Invalid or Expired Link</h2>
            <p>
              This payment submission link is invalid or has expired. Please contact your
              course representative for a valid link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submissionSuccess) {
    return (
      <div className="public-container">
        <div className="public-card">
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h2>Payment Submitted Successfully!</h2>
            <p className="success-message">
              Your payment proof has been submitted and is now pending review by the course
              representative.
            </p>
            <div className="submission-ref">
              <span className="ref-label">Submission Reference:</span>
              <span className="ref-id">#{submissionId}</span>
            </div>
            <p className="success-note">
              Please save this reference number for your records. You will be notified once
              your submission has been reviewed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-container">
      <div className="public-card">
        <div className="public-header">
          <h1>Payment Proof System</h1>
          <h2>{category.title}</h2>
          {category.description && <p className="category-description">{category.description}</p>}
          {category.amount_expected && (
            <div className="expected-amount">
              <span>Expected Amount:</span>
              <strong>${category.amount_expected.toFixed(2)}</strong>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="public-form">
          {submitMutation.error && (
            <div className="error-banner">
              <span>⚠️</span>
              <p>
                {(submitMutation.error as any)?.response?.data?.detail ||
                  'Submission failed. Please check your information and try again.'}
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="student_name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="student_name"
              type="text"
              placeholder="Enter your full name"
              {...register('student_name')}
              className={errors.student_name ? 'input-error' : ''}
              disabled={submitMutation.isPending}
            />
            {errors.student_name && (
              <span className="error-text">{errors.student_name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="student_phone">
              Phone Number <span className="required">*</span>
            </label>
            <input
              id="student_phone"
              type="tel"
              placeholder="+234 800 000 0000"
              {...register('student_phone')}
              className={errors.student_phone ? 'input-error' : ''}
              disabled={submitMutation.isPending}
            />
            {errors.student_phone && (
              <span className="error-text">{errors.student_phone.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount_paid">
              Amount Paid <span className="required">*</span>
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                id="amount_paid"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount_paid', { valueAsNumber: true })}
                className={errors.amount_paid ? 'input-error' : ''}
                disabled={submitMutation.isPending}
              />
            </div>
            {errors.amount_paid && (
              <span className="error-text">{errors.amount_paid.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="receipt">
              Payment Receipt <span className="required">*</span>
            </label>
            <div className="file-input-wrapper">
              <input
                id="receipt"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                {...register('receipt')}
                className={errors.receipt ? 'input-error' : ''}
                disabled={submitMutation.isPending}
                onChange={(e) => {
                  register('receipt').onChange(e);
                  // Clear preview when new file is selected
                  setReceiptPreview(null);
                }}
              />
              <div className="file-input-hint">
                Accepted formats: JPG, PNG, PDF (Max 10MB)
              </div>
            </div>
            {errors.receipt && <span className="error-text">{errors.receipt.message}</span>}

            {receiptPreview && (
              <div className="file-preview">
                <p className="preview-label">Preview:</p>
                <img src={receiptPreview} alt="Receipt preview" className="preview-image" />
              </div>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Payment Proof'
            )}
          </button>

          <div className="form-footer">
            <p>
              By submitting this form, you confirm that the information provided is accurate and
              the payment receipt is genuine.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitPayment;
