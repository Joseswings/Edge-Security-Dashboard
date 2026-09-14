import { useCallback, useEffect, useRef, useState } from "react";
import { getDashboard } from "./api.js";

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const requestRef = useRef(null);

  const refresh = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError("");
    const timeout = setTimeout(
      () => controller.abort(new Error("timeout")),
      10000,
    );
    try {
      const result = await getDashboard(controller.signal);
      if (requestRef.current !== controller) return;
      setData(result);
      setUpdatedAt(new Date());
    } catch (err) {
      if (requestRef.current !== controller) return;
      if (
        controller.signal.aborted &&
        controller.signal.reason?.message !== "timeout"
      )
        return;
      setError(
        controller.signal.aborted
          ? "La API tardó demasiado en responder. Comprueba el backend y vuelve a intentar."
          : err instanceof TypeError
            ? "No se pudo conectar con la API. Comprueba que el backend esté iniciado."
            : err.message,
      );
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [refresh]);

  return { data, loading, error, updatedAt, refresh };
}
