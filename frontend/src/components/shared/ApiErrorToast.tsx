import { useEffect, useState } from 'react';

const eventName = 'careerconnect-api-error';

type FeedbackPosition = {
  top: number;
  left: number;
  width: number;
};

export function showApiError(message: string) {
  window.dispatchEvent(new CustomEvent<string>(eventName, { detail: message }));
}

function getFieldLabel(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  const labelElement = element.labels?.[0];
  const label = labelElement?.textContent?.replace(/\(optional\)/i, '').trim();

  return label || element.getAttribute('aria-label') || 'This field';
}

function getValidationMessage(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  const label = getFieldLabel(element);
  const validity = element.validity;

  if (validity.valueMissing) return `Please complete ${label}.`;
  if (validity.typeMismatch && element.type === 'email') return 'Enter a valid email address.';
  if (validity.typeMismatch && element.type === 'url') return 'Enter a valid website address, including https://.';
  if (validity.tooShort) return `Add at least ${element.getAttribute('minlength')} characters to ${label}.`;
  if (validity.tooLong) return `${label} cannot contain more than ${element.getAttribute('maxlength')} characters.`;
  if (validity.patternMismatch) return `${label} has an invalid format.`;
  if (validity.rangeUnderflow) return `${label} is below the allowed value.`;
  if (validity.rangeOverflow) return `${label} is above the allowed value.`;
  if (validity.badInput) return `${label} has an invalid value.`;

  return `${label} is invalid.`;
}

function getFeedbackPosition(element: Element | null): FeedbackPosition {
  if (element instanceof HTMLElement) {
    const bounds = element.getBoundingClientRect();
    return {
      top: bounds.bottom + 8,
      left: Math.max(12, Math.min(bounds.left, window.innerWidth - 332)),
      width: Math.min(Math.max(bounds.width, 260), 420),
    };
  }

  return { top: 96, left: Math.max(12, (window.innerWidth - 380) / 2), width: 380 };
}

export default function ApiErrorToast() {
  const [feedback, setFeedback] = useState<{ message: string; position: FeedbackPosition } | null>(null);

  useEffect(() => {
    let animationFrameId: number | undefined;
    let invalidForm: HTMLFormElement | null = null;

    const isFormControl = (element: Element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
      element instanceof HTMLInputElement
      || element instanceof HTMLSelectElement
      || element instanceof HTMLTextAreaElement;

    const clearValidationFeedback = (form: HTMLFormElement) => {
      form.querySelectorAll('[data-inline-validation-error]')
        .forEach((feedback) => feedback.remove());
    };

    const showValidationFeedback = (
      anchor: Element,
      message: string
    ) => {
      const feedback = document.createElement('p');
      feedback.dataset.inlineValidationError = 'true';
      feedback.setAttribute('role', 'alert');
      feedback.className = 'm-0 mt-2 text-sm font-medium text-[#c53659]';
      feedback.textContent = message;
      anchor.insertAdjacentElement('afterend', feedback);
    };

    const handleApiError = (event: Event) => {
      const apiErrorEvent = event as CustomEvent<string>;
      setFeedback({
        message: apiErrorEvent.detail,
        position: getFeedbackPosition(document.activeElement),
      });
    };

    const handleInvalid = (event: Event) => {
      const element = event.target;
      if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) return;

      event.preventDefault();
      invalidForm = element.form;

      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = window.requestAnimationFrame(() => {
        const invalidFields = invalidForm
          ? Array.from(invalidForm.querySelectorAll(':invalid')).filter(isFormControl)
          : [element];
        if (!invalidForm) return;

        clearValidationFeedback(invalidForm);

        const hasMissingRequiredField = invalidFields.some(
          (field) => field.validity.valueMissing
        );
        const submitButton = invalidForm?.querySelector('[type="submit"]');

        if (hasMissingRequiredField && submitButton) {
          showValidationFeedback(
            submitButton,
            'Please complete all required fields.'
          );
        } else {
          invalidFields.forEach((field) => {
            showValidationFeedback(field, getValidationMessage(field));
          });
        }

        animationFrameId = undefined;
      });
    };

    window.addEventListener(eventName, handleApiError);
    window.addEventListener('invalid', handleInvalid, true);
    const handleInput = (event: Event) => {
      const form = event.target instanceof Element
        ? event.target.closest('form')
        : null;
      if (form instanceof HTMLFormElement) clearValidationFeedback(form);
    };
    window.addEventListener('input', handleInput, true);
    return () => {
      window.removeEventListener(eventName, handleApiError);
      window.removeEventListener('invalid', handleInvalid, true);
      window.removeEventListener('input', handleInput, true);
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeoutId = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  if (!feedback) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: feedback.position.top,
        left: feedback.position.left,
        width: feedback.position.width,
        pointerEvents: 'none',
      }}
      className="z-[100] text-xs font-medium text-[#c53659]"
    >
      {feedback.message}
    </div>
  );
}
