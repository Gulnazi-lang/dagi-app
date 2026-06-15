"use client";

// Запасной экран на случай сбоя в корневом layout (заменяет всю страницу,
// поэтому содержит свои html/body без провайдеров).
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
          background: "#fbf6ef",
          color: "#1a1a1a",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px",
          margin: 0,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 28, color: "#0e7c8c" }}>DUD</div>
        <p style={{ marginTop: 16, fontWeight: 600 }}>Something went wrong</p>
        <button
          onClick={reset}
          style={{
            marginTop: 20,
            background: "#0e7c8c",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
