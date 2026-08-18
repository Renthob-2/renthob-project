import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

interface OtpVerificationProps {
  email: string;
  /** Verify the 6-digit code. Throw or return an error to show a message. */
  onVerify: (code: string) => Promise<{ error: Error | null }>;
  /** Re-send the code to the same email. */
  onResend: () => Promise<{ error: Error | null }>;
  onBack: () => void;
  backLabel?: string;
  title?: string;
  description?: string;
}

const RESEND_COOLDOWN = 60;

export default function OtpVerification({
  email,
  onVerify,
  onResend,
  onBack,
  backLabel = "Use a different email",
  title = "Enter your code",
  description,
}: OtpVerificationProps) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submit = async (value: string) => {
    if (value.length !== 6 || isVerifying) return;
    setIsVerifying(true);
    setError(null);
    const { error: verifyError } = await onVerify(value);
    setIsVerifying(false);
    if (verifyError) {
      setError(verifyError.message || "That code is invalid or has expired.");
      setCode("");
    }
  };

  const handleChange = (value: string) => {
    setCode(value);
    setError(null);
    if (value.length === 6) void submit(value);
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    const { error: resendError } = await onResend();
    setIsResending(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {description ?? (
            <>
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below
              to continue.
            </>
          )}
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={handleChange}
          disabled={isVerifying}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={() => submit(code)}
        disabled={code.length !== 6 || isVerifying}
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify"
        )}
      </Button>

      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Didn't get the code? Check your spam folder.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : cooldown > 0 ? (
            `Resend code in ${cooldown}s`
          ) : (
            "Resend code"
          )}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          {backLabel}
        </button>
      </div>
    </div>
  );
}
