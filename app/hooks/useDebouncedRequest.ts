import { useCallback, useRef } from "react";

interface DebouncedRequestOptions {
  delay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onLoading?: (loading: boolean) => void;
}

interface RequestConfig {
  url: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  data?: any;
  headers?: Record<string, string>;
}

export const useDebouncedRequest = (options: DebouncedRequestOptions = {}) => {
  const { delay = 500, onSuccess, onError, onLoading } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const makeRequest = useCallback(
    async (config: RequestConfig) => {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새로운 AbortController 생성
      abortControllerRef.current = new AbortController();

      try {
        onLoading?.(true);

        const response = await fetch(config.url, {
          method: config.method,
          headers: {
            "Content-Type": "application/json",
            ...config.headers,
          },
          body: config.data ? JSON.stringify(config.data) : undefined,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        onSuccess?.(data);
        return data;
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
    (config: RequestConfig) => {
      // 이전 타이머 클리어
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 새로운 타이머 설정
      timeoutRef.current = setTimeout(() => {
        makeRequest(config);
      }, delay);
    },
    [makeRequest, delay],
  );

  // POST 요청
  const post = useCallback(
    (url: string, data?: any, headers?: Record<string, string>) => {
      debouncedRequest({ url, method: "POST", data, headers });
    },
    [debouncedRequest],
  );

  // PUT 요청
  const put = useCallback(
    (url: string, data?: any, headers?: Record<string, string>) => {
      debouncedRequest({ url, method: "PUT", data, headers });
    },
    [debouncedRequest],
  );

  // PATCH 요청
  const patch = useCallback(
    (url: string, data?: any, headers?: Record<string, string>) => {
      debouncedRequest({ url, method: "PATCH", data, headers });
    },
    [debouncedRequest],
  );

  // DELETE 요청
  const del = useCallback(
    (url: string, headers?: Record<string, string>) => {
      debouncedRequest({ url, method: "DELETE", headers });
    },
    [debouncedRequest],
  );

  // 즉시 실행 (디바운스 없이)
  const executeImmediately = useCallback(
    (config: RequestConfig) => {
      return makeRequest(config);
    },
    [makeRequest],
  );

  // 취소 함수
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    post,
    put,
    patch,
    delete: del,
    executeImmediately,
    cancel,
  };
};

export default useDebouncedRequest;
