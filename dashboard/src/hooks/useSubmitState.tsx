import { useState } from 'react';

export function useSubmitState() {
  const [submitState, setSubmitState] = useState<{
    loading: boolean;
    error: Error | null;
    fieldsWithError?: string[];
  }>({
    loading: false,
    error: null,
    fieldsWithError: [],
  });

  return { submitState, setSubmitState };
}

export default useSubmitState;
