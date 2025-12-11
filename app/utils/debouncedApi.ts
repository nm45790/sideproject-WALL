import { useCallback, useRef } from "react";

interface DebouncedApiOptions {
  delay?: number;
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  useProxy?: boolean; // 프록시 사용 여부
}

interface ApiRequest {
  url: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  data?: any;
  headers?: Record<string, string>;
}

export const useDebouncedApi = (options: DebouncedApiOptions = {}) => {
  const {
    delay = 500,
    baseUrl = process.env.NEXT_PUBLIC_API_URL || "",
    defaultHeaders = { "Content-Type": "application/json" },
    // production 환경일 때만 프록시 사용
    useProxy = process.env.NODE_ENV === "production",
  } = options;

  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const makeRequest = useCallback(
    async (request: ApiRequest, requestId?: string) => {
      const id = requestId || `${request.method}-${request.url}`;

      // 이전 요청 취소
      if (abortControllers.current.has(id)) {
        abortControllers.current.get(id)?.abort();
      }

      // 새로운 AbortController 생성
      const abortController = new AbortController();
      abortControllers.current.set(id, abortController);

      try {
        let fetchUrl: string;
        let fetchOptions: RequestInit;

        if (useProxy) {
          // 프록시를 통한 요청
          fetchUrl = "/api/proxy";
          fetchOptions = {
            method: "POST", // 프록시는 항상 POST
            headers: { ...defaultHeaders },
            body: JSON.stringify({
              url: `${baseUrl}${request.url}`,
              method: request.method,
              data: request.data,
              headers: request.headers,
            }),
            signal: abortController.signal,
          };
        } else {
          // 직접 요청
          fetchUrl = `${baseUrl}${request.url}`;
          fetchOptions = {
            method: request.method,
            headers: { ...defaultHeaders, ...request.headers },
            body: request.data ? JSON.stringify(request.data) : undefined,
            signal: abortController.signal,
          };
        }

        const response = await fetch(fetchUrl, fetchOptions);

        if (!response.ok) {
          // 에러 응답 파싱
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage =
              errorData.message ||
              errorData.error ||
              `HTTP error! status: ${response.status}`;
          } catch (parseError) {
            // JSON 파싱 실패 시 기본 에러 메시지 사용
          }

          // 401(인증 오류)과 403(권한 오류)은 alert을 띄우지 않음 (자동 로그인 처리됨)
          if (
            response.status !== 401 &&
            response.status !== 403 &&
            typeof window !== "undefined"
          ) {
            alert(errorMessage);
          }

          throw new Error(errorMessage);
        }

        return await response.json();
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          throw error;
        }
      } finally {
        abortControllers.current.delete(id);
      }
    },
    [baseUrl, defaultHeaders, useProxy],
  );

  const debouncedRequest = useCallback(
    (request: ApiRequest, requestId?: string) => {
      const id = requestId || `${request.method}-${request.url}`;

      // 이전 타이머 클리어
      if (timeouts.current.has(id)) {
        clearTimeout(timeouts.current.get(id)!);
      }

      // 새로운 타이머 설정
      const timeout = setTimeout(() => {
        makeRequest(request, id);
        timeouts.current.delete(id);
      }, delay);

      timeouts.current.set(id, timeout);
    },
    [makeRequest, delay],
  );

  // HTTP 메서드별 함수들
  const api = {
    post: (
      url: string,
      data?: any,
      headers?: Record<string, string>,
      requestId?: string,
    ) => {
      debouncedRequest({ url, method: "POST", data, headers }, requestId);
    },

    put: (
      url: string,
      data?: any,
      headers?: Record<string, string>,
      requestId?: string,
    ) => {
      debouncedRequest({ url, method: "PUT", data, headers }, requestId);
    },

    patch: (
      url: string,
      data?: any,
      headers?: Record<string, string>,
      requestId?: string,
    ) => {
      debouncedRequest({ url, method: "PATCH", data, headers }, requestId);
    },

    delete: (
      url: string,
      headers?: Record<string, string>,
      requestId?: string,
    ) => {
      debouncedRequest({ url, method: "DELETE", headers }, requestId);
    },

    // 즉시 실행 (디바운스 없이)
    execute: (request: ApiRequest, requestId?: string) => {
      return makeRequest(request, requestId);
    },

    // 특정 요청 취소
    cancel: (requestId: string) => {
      if (timeouts.current.has(requestId)) {
        clearTimeout(timeouts.current.get(requestId)!);
        timeouts.current.delete(requestId);
      }
      if (abortControllers.current.has(requestId)) {
        abortControllers.current.get(requestId)?.abort();
        abortControllers.current.delete(requestId);
      }
    },

    // 모든 요청 취소
    cancelAll: () => {
      timeouts.current.forEach((timeout) => clearTimeout(timeout));
      timeouts.current.clear();
      abortControllers.current.forEach((controller) => controller.abort());
      abortControllers.current.clear();
    },
  };

  return api;
};

export default useDebouncedApi;
