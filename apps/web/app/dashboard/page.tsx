"use client";

import { useEffect } from "react";
import { useWebsitesStore } from "../../stores/website-store";

export default function DashboardPage() {
  const { websites, isLoading, error, fetchWebsites } = useWebsitesStore();

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Websites</h1>
      <p>Monitored websites from your RunState backend.</p>

      {isLoading && <p style={{ marginTop: 20 }}>Loading websites...</p>}

      {error && <p style={{ marginTop: 20, color: "red" }}>{error}</p>}

      {!isLoading && !error && websites.length === 0 && (
        <p style={{ marginTop: 20 }}>No websites added yet.</p>
      )}

      {!isLoading && !error && websites.length > 0 && (
        <table
          style={{
            width: "100%",
            marginTop: 24,
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th align="left">URL</th>
              <th align="left">Status</th>
              <th align="left">Latest Response Time</th>
            </tr>
          </thead>
          <tbody>
            {websites.map((website) => (
              <tr key={website.id}>
                <td style={{ padding: "12px 0" }}>{website.url}</td>
                <td>{website.status ?? "unknown"}</td>
                <td>
                  {website.latestResponseTimeMs != null
                    ? `${website.latestResponseTimeMs} ms`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}