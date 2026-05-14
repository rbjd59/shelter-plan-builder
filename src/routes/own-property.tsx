import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

const search = z.object({ lang: z.enum(["en", "es", "ht"]).catch("en") });

export const Route = createFileRoute("/own-property")({
  validateSearch: search,
  component: OwnPropertyPage,
  head: () => ({
    meta: [
      { title: "Own Property — Sentinel Trust Property Management Group" },
      {
        name: "description",
        content:
          "No family in the U.S. to manage your real estate? Sentinel Trust Property Management Group manages, rents, and sells foreign-owned property under licensed legal supervision.",
      },
      { property: "og:title", content: "Own Property — Sentinel Trust Property Management Group" },
      {
        property: "og:description",
        content:
          "Property management, rental, and sale services for non-citizen owners — supervised by a licensed law group.",
      },
    ],
  }),
});

function OwnPropertyPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0e1a2b",
        color: "#f4efe6",
        fontFamily: "Inter Tight, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#c9a961",
            marginBottom: 10,
          }}
        >
          SENTINEL — PROPERTY DIVISION
        </div>
        <h1
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 56,
            fontWeight: 500,
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          Own Property
        </h1>
        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 22,
            fontStyle: "italic",
            color: "#c9a961",
            margin: "0 0 28px",
          }}
        >
          No family in the United States? No one you trust with your property? No one capable of
          managing real estate?
        </p>

        <p style={{ fontSize: 17, lineHeight: 1.65, maxWidth: 680, color: "#e6e0d2" }}>
          <strong>Sentinel Trust Property Management Group</strong> is an option to have your
          property <em>managed</em>, <em>rented</em>, or <em>sold</em> under the supervision of a
          licensed law group designed to handle foreign-owned real estate.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18, marginTop: 40 }}>
          {[
            {
              h: "Managed",
              p: "Ongoing oversight of your home or building — taxes paid, maintenance arranged, tenants vetted, accounting reported across borders.",
            },
            {
              h: "Rented",
              p: "Income-producing leasing handled end-to-end so your property continues to support your family even while you are outside the United States.",
            },
            {
              h: "Sold",
              p: "When the time comes to liquidate, sales are conducted under attorney supervision with proceeds routed to the trust or beneficiary you designate.",
            },
          ].map((p) => (
            <div
              key={p.h}
              style={{
                background: "#1a2940",
                padding: "22px 24px",
                borderRadius: 6,
                borderLeft: "3px solid #c9a961",
              }}
            >
              <h3
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 20,
                  fontWeight: 600,
                  margin: "0 0 6px",
                  color: "#c9a961",
                }}
              >
                {p.h}
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0, color: "#e6e0d2" }}>{p.p}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 44 }}>
          <p style={{ fontSize: 15, color: "#e6e0d2", margin: "0 0 14px" }}>
            Visit Sentinel Trust Services Group at:
          </p>
          <a
            href="https://www.defendermicasa.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#c9a961",
              color: "#0e1a2b",
              padding: "16px 30px",
              fontWeight: 700,
              textDecoration: "none",
              borderRadius: 4,
              letterSpacing: "0.02em",
            }}
          >
            www.defendermicasa.com →
          </a>
        </div>

        <p
          style={{
            marginTop: 36,
            fontSize: 12,
            color: "#8a9bb0",
            lineHeight: 1.55,
            maxWidth: 600,
          }}
        >
          Sentinel Trust Property Management Group is operated in partnership with a licensed
          Arizona law firm (launching Spring 2027). This page is informational only and is not
          legal advice or an offer to provide legal services.
        </p>
        <Link
          to="/"
          style={{ display: "inline-block", marginTop: 20, color: "#c9a961", textDecoration: "none" }}
        >
          ← Return home
        </Link>
      </div>
    </div>
  );
}
