// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//     ArrowLeft,
//     Pencil,
//     School as SchoolIcon,
//     Mail,
//     Phone,
//     Globe,
//     MapPin,
//     Hash,
//     CalendarPlus,
//     CalendarClock,
// } from "lucide-react";
// // ASSUMPTION: fetchSchoolById is exported from the same slice as the
// // other school thunks — adjust the path if it actually lives elsewhere.
// import { fetchSchoolById } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
// import { getImageUrl } from "../../../../common/utils/imageUrl.js";
// import "../styles/SchoolView.css";

// function formatDateTime(value) {
//     if (!value) return "—";
//     const d = new Date(value);
//     if (isNaN(d)) return value;
//     return d.toLocaleString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//     });
// }

// /** A single labeled field with an icon — the recurring building block of every section below. */
// function InfoRow({ icon: Icon, label, value, isLink }) {
//     return (
//         <div className="scv-row flex items-start gap-3">
//             <div className="scv-row-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
//                 <Icon size={15} />
//             </div>
//             <div className="min-w-0">
//                 <p className="scv-row-label text-[11.5px] font-semibold uppercase tracking-wide">
//                     {label}
//                 </p>
//                 {value ? (
//                     isLink ? (
//                         <a
//                             href={value.startsWith("http") ? value : `https://${value}`}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="scv-row-link text-[14px] font-medium break-all"
//                         >
//                             {value}
//                         </a>
//                     ) : (
//                         <p className="scv-row-value text-[14px] font-medium break-words">{value}</p>
//                     )
//                 ) : (
//                     <p className="scv-row-empty text-[14px]">Not provided</p>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default function SchoolViewPage() {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { id } = useParams();

//     // ASSUMPTION: fetchSchoolById.fulfilled writes to state.schoolProfile.school
//     // (singular), separate from the .schools list array used by the table
//     // page. Adjust these three selector keys if your reducer names them
//     // differently.
//     const school = useSelector((state) => state.schoolProfile?.school ?? null);
//     const loading = useSelector((state) => state.schoolProfile?.loading ?? false);
//     const error = useSelector((state) => state.schoolProfile?.error ?? null);

//     useEffect(() => {
//         if (id) dispatch(fetchSchoolById(id));
//     }, [dispatch, id]);

//     const logo = school?.logo_url ? getImageUrl(school.logo_url) : null;
//     const isActive = school?.status === "active";

//     const addressLines = [school?.address_line1, school?.address_line2].filter(Boolean);
//     const cityStateLine = [school?.city, school?.district, school?.state]
//         .filter(Boolean)
//         .join(", ");
//     const countryPostal = [school?.country, school?.postal_code].filter(Boolean).join(" — ");

//     if (loading && !school) {
//         return (
//             <div className="scv-page min-h-screen p-6">
//                 <p className="scv-loading px-2 py-10 text-[13.5px]">Loading school…</p>
//             </div>
//         );
//     }

//     if (error && !school) {
//         return (
//             <div className="scv-page min-h-screen p-6">
//                 <div className="text-center py-10">
//                     <p className="scv-error text-[13.5px] mb-3">{error}</p>
//                     <button
//                         onClick={() => dispatch(fetchSchoolById(id))}
//                         className="scv-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
//                     >
//                         Retry
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     if (!school) {
//         return (
//             <div className="scv-page min-h-screen p-6">
//                 <p className="scv-loading px-2 py-10 text-[13.5px]">School not found.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="scv-page min-h-screen p-6">
//             {/* ── Back link ── */}
//             <button
//                 onClick={() => navigate("/school-profile")}
//                 className="scv-back-link inline-flex items-center gap-1.5 text-[13px] font-semibold mb-5 transition-colors"
//             >
//                 <ArrowLeft size={15} /> Back to Schools
//             </button>

//             {/* ── Hero card ── */}
//             <div className="scv-hero rounded-2xl px-6 py-6 mb-5 flex items-center justify-between flex-wrap gap-4">
//                 <div className="flex items-center gap-4">
//                     <div className="scv-logo w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
//                         {logo ? (
//                             <img src={logo} alt={school.name} className="w-full h-full object-cover" />
//                         ) : (
//                             <SchoolIcon size={26} />
//                         )}
//                     </div>
//                     <div>
//                         <div className="flex items-center gap-2.5 flex-wrap">
//                             <h1 className="scv-name text-[20px] font-bold">{school.name}</h1>
//                             <span
//                                 className={`scv-status ${isActive ? "scv-status-active" : "scv-status-inactive"}`}
//                             >
//                                 {school.status}
//                             </span>
//                         </div>
//                         {school.code && (
//                             <p className="scv-code text-[13px] mt-1 inline-flex items-center gap-1.5">
//                                 <Hash size={12} /> {school.code}
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 <button
//                     onClick={() => navigate(`/school-profile/${school.id}`)}
//                     className="scv-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
//                 >
//                     <Pencil size={15} /> Edit School
//                 </button>
//             </div>

//             {/* ── Detail sections ── */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//                 {/* Contact */}
//                 <div className="scv-card rounded-2xl p-5">
//                     <h2 className="scv-section-title text-[13px] font-bold uppercase tracking-wide mb-4">
//                         Contact
//                     </h2>
//                     <div className="flex flex-col gap-4">
//                         <InfoRow icon={Mail} label="Email" value={school.email} />
//                         <InfoRow icon={Phone} label="Phone" value={school.phone} />
//                         <InfoRow icon={Globe} label="Website" value={school.website} isLink />
//                     </div>
//                 </div>

//                 {/* Address */}
//                 <div className="scv-card rounded-2xl p-5">
//                     <h2 className="scv-section-title text-[13px] font-bold uppercase tracking-wide mb-4">
//                         Address
//                     </h2>
//                     <div className="flex flex-col gap-4">
//                         <InfoRow
//                             icon={MapPin}
//                             label="Street Address"
//                             value={addressLines.length ? addressLines.join(", ") : null}
//                         />
//                         <InfoRow icon={MapPin} label="City / District / State" value={cityStateLine || null} />
//                         <InfoRow icon={MapPin} label="Country / Postal Code" value={countryPostal || null} />
//                     </div>
//                 </div>

//                 {/* Record info */}
//                 <div className="scv-card rounded-2xl p-5 lg:col-span-2">
//                     <h2 className="scv-section-title text-[13px] font-bold uppercase tracking-wide mb-4">
//                         Record Info
//                     </h2>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <InfoRow icon={CalendarPlus} label="Created" value={formatDateTime(school.created_at)} />
//                         <InfoRow icon={CalendarClock} label="Last Updated" value={formatDateTime(school.updated_at)} />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

/* ====================================================  */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Pencil,
    School as SchoolIcon,
    Mail,
    Phone,
    Globe,
    MapPin,
    Hash,
    CalendarPlus,
    CalendarClock,
} from "lucide-react";

// ASSUMPTION: updateSchool is exported alongside fetchSchoolById
import {
    fetchSchoolById,
    editSchool as updateSchool,
} from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { getImageUrl } from "../../../../common/utils/imageUrl.js";

// IMPORT YOUR MODAL COMPONENT (Adjust path as needed)
import SchoolModal from "../components/SchoolModal.jsx";
import "../styles/SchoolView.css";

function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/** A single labeled field with an icon — the recurring building block of every section below. */
function InfoRow({ icon: Icon, label, value, isLink }) {
    return (
        <div className="scv-row flex items-start gap-3">
            <div className="scv-row-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={15} />
            </div>
            <div className="min-w-0">
                <p className="scv-row-label text-[11.5px] font-semibold uppercase tracking-wide">
                    {label}
                </p>
                {value ? (
                    isLink ? (
                        <a
                            href={value.startsWith("http") ? value : `https://${value}`}
                            target="_blank"
                            rel="noreferrer"
                            className="scv-row-link text-[14px] font-medium break-all"
                        >
                            {value}
                        </a>
                    ) : (
                        <p className="scv-row-value text-[14px] font-medium break-words">{value}</p>
                    )
                ) : (
                    <p className="scv-row-empty text-[14px]">Not provided</p>
                )}
            </div>
        </div>
    );
}

export default function SchoolViewPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    // Local state for controlling the Edit Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const school = useSelector((state) => state.schoolProfile?.school ?? null);
    const loading = useSelector((state) => state.schoolProfile?.loading ?? false);
    const error = useSelector((state) => state.schoolProfile?.error ?? null);

    useEffect(() => {
        if (id) dispatch(fetchSchoolById(id));
    }, [dispatch, id]);

    // Handler to open the modal
    const handleOpenEditModal = () => {
        setEditingSchool(school);
        setModalOpen(true);
    };

    // Handler to close the modal
    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingSchool(null);
    };

    // Handler to submit modal form updates
    const handleModalSubmit = async (formData) => {
        setSubmitting(true);
        try {
            // Dispatch update thunk with school ID and updated form data
            await dispatch(updateSchool({ id: school.id, data: formData })).unwrap();

            // Refresh details and close modal upon success
            dispatch(fetchSchoolById(id));
            handleCloseModal();
        } catch (err) {
            console.error("Failed to update school:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const logo = school?.logo_url ? getImageUrl(school.logo_url) : null;
    const isActive = school?.status === "active";

    const addressLines = [school?.address_line1, school?.address_line2].filter(Boolean);
    const cityStateLine = [school?.city, school?.district, school?.state]
        .filter(Boolean)
        .join(", ");
    const countryPostal = [school?.country, school?.postal_code].filter(Boolean).join(" — ");

    if (loading && !school) {
        return (
            <div className="scv-page min-h-screen p-6">
                <p className="scv-loading px-2 py-10 text-[13.5px]">Loading school…</p>
            </div>
        );
    }

    if (error && !school) {
        return (
            <div className="scv-page min-h-screen p-6">
                <div className="text-center py-10">
                    <p className="scv-error text-[13.5px] mb-3">{error}</p>
                    <button
                        onClick={() => dispatch(fetchSchoolById(id))}
                        className="scv-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!school) {
        return (
            <div className="scv-page min-h-screen p-6">
                <p className="scv-loading px-2 py-10 text-[13.5px]">School not found.</p>
            </div>
        );
    }

    return (
        <div className="scv-page min-h-screen p-6">
            {/* ── Back link ── */}
            <button
                onClick={() => navigate("/school-profile")}
                className="scv-back-link inline-flex items-center gap-1.5 text-[13px] font-semibold mb-5 transition-colors"
            >
                <ArrowLeft size={15} /> Back to Schools
            </button>

            {/* ── Hero card ── */}
            <div className="scv-hero rounded-2xl px-6 py-6 mb-5 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="scv-logo w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                        {logo ? (
                            <img src={logo} alt={school.name} className="w-full h-full object-cover" />
                        ) : (
                            <SchoolIcon size={26} />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="scv-name text-[20px] font-bold">{school.name}</h1>
                            <span
                                className={`scv-status ${isActive ? "scv-status-active" : "scv-status-inactive"}`}
                            >
                                {school.status}
                            </span>
                        </div>
                        {school.code && (
                            <p className="scv-code text-[13px] mt-1 inline-flex items-center gap-1.5">
                                <Hash size={12} /> {school.code}
                            </p>
                        )}
                    </div>
                </div>

                {/* Updated Edit Button to trigger modal */}
                <button
                    onClick={handleOpenEditModal}
                    className="scv-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
                >
                    <Pencil size={15} /> Edit School
                </button>
            </div>

            {/* ── Detail sections ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Contact */}
                <div className="scv-card rounded-2xl p-5">
                    <h2 className="scv-section-title text-[13px] font-bold uppercase tracking-wide mb-4">
                        Contact
                    </h2>
                    <div className="flex flex-col gap-4">
                        <InfoRow icon={Mail} label="Email" value={school.email} />
                        <InfoRow icon={Phone} label="Phone" value={school.phone} />
                        <InfoRow icon={Globe} label="Website" value={school.website} isLink />
                    </div>
                </div>

                {/* Address */}
                <div className="scv-card rounded-2xl p-5">
                    <h2 className="scv-section-title text-[13px] font-bold uppercase tracking-wide mb-4">
                        Address
                    </h2>
                    <div className="flex flex-col gap-4">
                        <InfoRow
                            icon={MapPin}
                            label="Street Address"
                            value={addressLines.length ? addressLines.join(", ") : null}
                        />
                        <InfoRow icon={MapPin} label="City / District / State" value={cityStateLine || null} />
                        <InfoRow icon={MapPin} label="Country / Postal Code" value={countryPostal || null} />
                    </div>
                </div>

                {/* Record info */}
                <div className="scv-card rounded-2xl p-5 lg:col-span-2">
                    <h2 className="scv-section-title text-[13px] font-bold uppercase tracking-wide mb-4">
                        Record Info
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoRow icon={CalendarPlus} label="Created" value={formatDateTime(school.created_at)} />
                        <InfoRow icon={CalendarClock} label="Last Updated" value={formatDateTime(school.updated_at)} />
                    </div>
                </div>
            </div>

            {/* ── Edit School Modal ── */}
            <SchoolModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                school={editingSchool}
                onSubmit={handleModalSubmit}
                submitting={submitting}
            />
        </div>
    );
}