import React from "react";
import { Link } from "react-router-dom";
import "./styles/NotFound.css";
import bgGif from "./bg.gif";

/**
 * Animated 404 page. Drop your own animated background asset at
 * /public/404-bg.gif (or swap the backgroundImage below for whatever
 * asset you're using) — inline styles are used just for that one
 * per-instance image reference, everything else is themed via NotFound.css.
 */
export default function NotFoundPage() {
    return (
        <section className="nf-page">
            <div className="nf-container">
                <div
                    className="nf-bg"
                    style={{
                        backgroundImage: `url(${bgGif})`,
                    }}
                >
                    <h1 className="nf-code">404</h1>
                </div>

                <div className="nf-content">
                    <h3 className="nf-heading">Looks like you're lost</h3>
                    <p className="nf-subtext">
                        The page you are looking for isn't available.
                    </p>
                    <Link to="/" className="nf-link">
                        Go to Home
                    </Link>
                </div>
            </div>
        </section>
    );
}