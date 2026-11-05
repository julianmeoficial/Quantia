"use client";

import { useRef } from "react";
import styled from "styled-components";

import { gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";

/**
 * Original login artwork (DESIGN.md §3 signature motif): a research thread connecting an
 * observation note, an evidence card and a result. Decorative only — hidden from AT and
 * pointer events. GSAP draws the thread once on mount; reduced motion shows it static.
 */
const Frame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: ${({ theme }) => theme.radii.featured};
  background: ${({ theme }) => theme.colors.selection.bg};
  overflow: hidden;
  pointer-events: none;

  svg {
    width: 100%;
    height: 100%;
  }

  .paper {
    fill: ${({ theme }) => theme.colors.bg.surface};
    stroke: ${({ theme }) => theme.colors.border.subtle};
  }
  .ink {
    stroke: ${({ theme }) => theme.colors.brand.primary};
  }
  .muted {
    stroke: ${({ theme }) => theme.colors.border.control};
  }
  .node {
    fill: ${({ theme }) => theme.colors.bg.surface};
    stroke: ${({ theme }) => theme.colors.brand.primary};
  }
  .sage {
    fill: ${({ theme }) => theme.colors.status.success.bg};
    stroke: ${({ theme }) => theme.colors.status.success.icon};
  }
  .accent {
    fill: ${({ theme }) => theme.colors.brand.primary};
  }
`;

export function ResearchThreadArt() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.allowMotion, () => {
        const thread = scope.current?.querySelector<SVGPathElement>("[data-thread]");
        const length = thread?.getTotalLength() ?? 0;
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-card]", {
          autoAlpha: 0,
          y: 18,
          duration: 0.5,
          stagger: 0.12,
        });
        if (thread && length > 0) {
          tl.fromTo(
            thread,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" },
            "-=0.35",
          );
        }
        tl.from(
          "[data-node]",
          { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%", duration: 0.3, stagger: 0.14 },
          "<0.15",
        ).from("[data-line]", { autoAlpha: 0, x: -6, duration: 0.3, stagger: 0.04 }, "-=0.4");
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <Frame ref={scope} aria-hidden>
      <svg viewBox="0 0 400 300" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Observation note */}
        <g data-card>
          <rect className="paper" x="28" y="34" width="132" height="96" rx="12" strokeWidth="1.5" />
          <circle className="node" cx="56" cy="62" r="10" strokeWidth="1.8" />
          <circle className="ink" cx="56" cy="62" r="4" strokeWidth="1.8" />
          <path data-line className="muted" d="M76 58h62M76 70h44" strokeWidth="3" />
          <path data-line className="muted" d="M44 96h96M44 110h70" strokeWidth="3" />
        </g>
        {/* Evidence card */}
        <g data-card>
          <rect
            className="paper"
            x="226"
            y="22"
            width="146"
            height="108"
            rx="12"
            strokeWidth="1.5"
          />
          <path className="ink" d="M246 50h32v40h-32z" strokeWidth="1.8" />
          <path className="ink" d="M252 60h20M252 70h20M252 80h12" strokeWidth="1.6" />
          <path data-line className="muted" d="M292 54h60M292 68h48M292 82h56" strokeWidth="3" />
          <path data-line className="muted" d="M246 108h104" strokeWidth="3" />
        </g>
        {/* Result */}
        <g data-card>
          <rect
            className="paper"
            x="110"
            y="178"
            width="180"
            height="96"
            rx="12"
            strokeWidth="1.5"
          />
          <rect className="sage" x="130" y="232" width="18" height="24" rx="3" strokeWidth="1.5" />
          <rect className="sage" x="156" y="216" width="18" height="40" rx="3" strokeWidth="1.5" />
          <rect className="sage" x="182" y="200" width="18" height="56" rx="3" strokeWidth="1.5" />
          <path className="ink" d="M126 256h150" strokeWidth="1.6" />
          <path data-line className="muted" d="M216 208h52M216 222h40" strokeWidth="3" />
        </g>
        {/* The research thread */}
        <path
          data-thread
          className="ink"
          d="M94 130c0 34 24 40 58 30s78-48 104-30 50 2 50-30"
          strokeWidth="2"
          strokeDasharray="0"
        />
        <path data-thread-tail className="ink" d="M200 160v18" strokeWidth="2" opacity="0.5" />
        <circle data-node className="node" cx="94" cy="130" r="6" strokeWidth="2" />
        <circle data-node className="node" cx="200" cy="162" r="6" strokeWidth="2" />
        <circle data-node className="node" cx="306" cy="130" r="6" strokeWidth="2" />
        <circle data-node className="accent" cx="200" cy="162" r="2.5" />
      </svg>
    </Frame>
  );
}
