import { useCallback, useRef } from "react";
import { api } from "../utils/api";

interface DebouncedRequestOptions {
  delay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onLoading?: (loading: boolean) => void;
}

interface RequestConfig {
  url: string;
  data?: any;
}

export const useDebouncedRequest = (options: DebouncedRequestOptions = {}) => {
  const { delay = 500, onSuccess, onError, onLoading } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const makeRequest = useCallback(
    async (method: "post" | "put" | "patch" | "delete", config: RequestConfig) => {
      try {
        onLoading?.(true);
        // api[method]를 사용하여 해당 HTTP 메서드로 요청 보냄
        const response = await api[method](config.url, config.data);
        onSuccess?.(response);
        return response;
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          onError?.(error);
          throw error;
        }
      } finally {
        onLoading?.(false);
      }
    },
    [onSuccess, onError, onLoading],
  );

  const debouncedRequest = useCallback(
    (method: "post" | "put" | "patch" | "delete", config: RequestConfig) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        makeRequest(method, config);
      }, delay);
    },
    [makeRequest, delay],
  );

  const post = useCallback(
    (url: string, data?: any) => {
      debouncedRequest("post", { url, data });
    },
    [debouncedRequest],
  );

  const put = useCallback(
    (url: string, data?: any) => {
      debouncedRequest("put", { url, data });
    },
    [debouncedRequest],
  );

  const patch = useCallback(
    (url: string, data?: any) => {
      debouncedRequest("patch", { url, data });
    },
    [debouncedRequest],
  );

  const delRequest = useCallback( // 'del' is a reserved keyword, renamed to 'delRequest'
    (url: string, data?: any) => {
      debouncedRequest("delete", { url, data });
    },
    [debouncedRequest],
  );

  const executeImmediately = useCallback(
    (method: "post" | "put" | "patch" | "delete", url: string, data?: any) => {
      return makeRequest(method, { url, data });
    },
    [makeRequest],
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    post,
    put,
    patch,
    delete: delRequest, // Changed to delRequest
    executeImmediately,
    cancel,
  };
};

export default useDebouncedRequest;
