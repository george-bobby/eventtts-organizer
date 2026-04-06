"use client";

import { useEffect } from "react";

declare global {
    interface Window {
        clarity?: (...args: any[]) => void;
    }
}

export default function ClarityTracking() {
    useEffect(() => {
        // Initialize Clarity tracking
        (function (c: any, l: any, a: any, r: any, i: any) {
            let t: any, y: any;
            c[a] =
                c[a] ||
                function () {
                    (c[a].q = c[a].q || []).push(arguments);
                };
            t = l.createElement(r);
            t.async = 1;
            t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);
    }, []);

    return null;
}
