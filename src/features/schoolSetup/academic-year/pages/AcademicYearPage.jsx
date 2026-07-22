// import React, { useEffect, useMemo, useState } from "react";
// import { Plus, Search } from "lucide-react";
// import AcademicYearTable from "../components/AcademicYearTable";
// import AcademicYearModal from "../components/AcademicYearModal";

// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchAcademicYears,
//   addAcademicYear,
//   editAcademicYear,
//   removeAcademicYear,
// } from "../../../../redux/schoolSetup/academic-year/academicYearSlice.js";

// import "../styles/AcademicYear.css";
// import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

// // TODO: wire this up to wherever your app stores the logged-in admin's
// // current school (same assumption used for Class/Section school_id).
// // const CURRENT_SCHOOL_ID = 1;

// const AcademicYearPage = () => {
//   const dispatch = useDispatch();
//   const { academicYears, loading, error } = useSelector(
//     (state) => state.academicYears,
//   );

//   //   console.log("Academic Years from Redux state:", academicYears);

//   const [search, setSearch] = useState("");
//   const [selectedSchool, setSelectedSchool] = useState("");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingYear, setEditingYear] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);

//   // TODO: confirm this matches your actual auth slice's state shape.
//   // Assumed: state.auth.user holds the object shown in your login response,
//   // e.g. { id, username, email, phone, status, roles: ['ADMIN'], school_id? }
//   const { user, loading: authLoading } = useSelector((state) => state.auth);

//   const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
//   // console.log("User roles:", user?.roles);
//   // Non-admins only ever belong to one school — use theirs directly.
//   // Admins pick a school in the form's dropdown instead.
//   const schoolId = isAdmin ? null : user?.school_id;

//   // console.log("School ID:", schoolId);

//   const schools = useSelector((state) => state.schoolProfile?.schools || []);
//   const schoolsLoading = useSelector(
//     (state) => state.schoolProfile?.loading || false,
//   );

//   useEffect(() => {
//     if (isAdmin && schools.length === 0) {
//       dispatch(fetchSchools());
//     }
//   }, [dispatch, isAdmin, schools.length]);

//   useEffect(() => {
//     dispatch(fetchAcademicYears());
//   }, [dispatch]);

//   // const filteredYears = useMemo(() => {
//   //   const term = search.trim().toLowerCase();
//   //   if (!term) return academicYears;
//   //   return academicYears.filter((y) => y.name?.toLowerCase().includes(term));
//   // }, [academicYears, search]);

//   const filteredYears = useMemo(() => {
//     const term = search.trim().toLowerCase();

//     return academicYears.filter((y) => {
//       const matchesSearch =
//         !term ||
//         y.name?.toLowerCase().includes(term) ||
//         y.school_name?.toLowerCase().includes(term);

//       const matchesSchool = isAdmin
//         ? selectedSchool
//           ? String(y.school_id) === String(selectedSchool)
//           : true
//         : String(y.school_id) === String(schoolId);

//       return matchesSearch && matchesSchool;
//     });
//   }, [academicYears, search, selectedSchool, isAdmin, schoolId]);

//   const openAddModal = () => {
//     setEditingYear(null);
//     setModalOpen(true);
//   };

//   const openEditModal = (year) => {
//     setEditingYear(year);
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setEditingYear(null);
//   };

//   const handleSubmit = async (payload) => {
//     setSubmitting(true);

//     try {
//       if (editingYear) {
//         await dispatch(
//           editAcademicYear({
//             id: editingYear.id,
//             formData: payload,
//           }),
//         ).unwrap();
//       } else {
//         await dispatch(addAcademicYear(payload)).unwrap();
//       }

//       dispatch(fetchAcademicYears());
//       closeModal();
//     } catch (err) {
//       alert(err || "Failed to save academic year");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this academic year?")) return;

//     setDeletingId(id);

//     try {
//       await dispatch(removeAcademicYear(id)).unwrap();
//     } catch (err) {
//       alert(err || "Delete failed");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <div className="ay-page min-h-screen p-6">
//       {/* Header */}
//       <div className="flex items-start justify-between mb-6">
//         <div>
//           <h1 className="ay-title text-2xl font-bold">
//             Academic Year Management
//           </h1>
//           <p className="ay-subtitle text-[13.5px] mt-1">
//             Create and manage the academic years for your school.
//           </p>
//         </div>
//         <button
//           onClick={openAddModal}
//           className="ay-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
//         >
//           <Plus size={16} /> Add Academic Year
//         </button>
//       </div>

//       {/* Toolbar */}
//       <div className="ay-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-5">
//         <div className="relative flex-1 max-w-xs">
//           <Search
//             size={15}
//             className="ay-count-text absolute left-3 top-1/2 -translate-y-1/2"
//           />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search academic years…"
//             className="ay-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
//           />
//         </div>

//         {/* School Filter */}
//         {isAdmin && (
//           <select
//             value={selectedSchool}
//             onChange={(e) => setSelectedSchool(e.target.value)}
//             className="ay-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
//             disabled={schoolsLoading}
//           >
//             <option value="">All Schools</option>

//             {schools.map((school) => (
//               <option key={school.id} value={school.id}>
//                 {school.name}
//               </option>
//             ))}
//           </select>
//         )}

//         <span className="ay-count-text text-[12.5px] ml-auto">
//           {filteredYears.length} year{filteredYears.length === 1 ? "" : "s"}
//         </span>
//       </div>

//       {/* Content */}
//       {loading ? (
//         <p className="ay-loading px-2 py-10 text-[13.5px]">
//           Loading academic years…
//         </p>
//       ) : error ? (
//         <div className="text-center py-10">
//           <p className="ay-error text-[13.5px] mb-3">{error}</p>
//           <button
//             onClick={() => dispatch(fetchAcademicYears())}
//             className="ay-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       ) : (
//         <AcademicYearTable
//           academicYears={filteredYears}
//           onEdit={openEditModal}
//           onDelete={handleDelete}
//           deletingId={deletingId}
//           showSchoolColumn={isAdmin && !selectedSchool}
//         />
//       )}

//       <AcademicYearModal
//         isOpen={modalOpen}
//         onClose={closeModal}
//         academicYear={editingYear}
//         schoolId={schoolId}
//         isAdmin={isAdmin}
//         onSubmit={handleSubmit}
//         submitting={submitting}
//       />
//     </div>
//   );
// };

// export default AcademicYearPage;

/* ============================= delete modal CODE ============================= */

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import AcademicYearTable from "../components/AcademicYearTable";
import AcademicYearModal from "../components/AcademicYearModal";
import DeleteAcademicYearModal from "../components/DeleteAcademicYearModal";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchAcademicYears,
  addAcademicYear,
  editAcademicYear,
} from "../../../../redux/schoolSetup/academic-year/academicYearSlice.js";

import "../styles/AcademicYear.css";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

const AcademicYearPage = () => {
  const dispatch = useDispatch();
  const { academicYears, loading, error } = useSelector(
    (state) => state.academicYears,
  );

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // TODO: confirm this matches your actual auth slice's state shape.
  // Assumed: state.auth.user holds the object shown in your login response,
  // e.g. { id, username, email, phone, status, roles: ['ADMIN'], school_id? }
  const { user, loading: authLoading } = useSelector((state) => state.auth);

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  // Non-admins only ever belong to one school — use theirs directly.
  // Admins pick a school in the form's dropdown instead.
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  useEffect(() => {
    dispatch(fetchAcademicYears());
  }, [dispatch]);

  const filteredYears = useMemo(() => {
    const term = search.trim().toLowerCase();

    return academicYears.filter((y) => {
      const matchesSearch =
        !term ||
        y.name?.toLowerCase().includes(term) ||
        y.school_name?.toLowerCase().includes(term);

      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(y.school_id) === String(selectedSchool)
          : true
        : String(y.school_id) === String(schoolId);

      return matchesSearch && matchesSchool;
    });
  }, [academicYears, search, selectedSchool, isAdmin, schoolId]);

  const openAddModal = () => {
    setEditingYear(null);
    setModalOpen(true);
  };

  const openEditModal = (year) => {
    setEditingYear(year);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingYear(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      if (editingYear) {
        await dispatch(
          editAcademicYear({
            id: editingYear.id,
            formData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(addAcademicYear(payload)).unwrap();
      }

      dispatch(fetchAcademicYears());
      closeModal();
    } catch (err) {
      alert(err || "Failed to save academic year");
    } finally {
      setSubmitting(false);
    }
  };

  // AcademicYearTable calls onDelete(id) — matching every other table in
  // this app. DeleteAcademicYearModal needs the full record (name,
  // school_name, is_current) to show a meaningful confirmation, so look
  // it up here rather than changing the table's contract. This is the
  // same fix applied to SchoolProfilePage after the empty-name bug there.
  const openDeleteModal = (id) => {
    const year = academicYears.find((y) => String(y.id) === String(id));
    setDeleteTarget(year ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    dispatch(fetchAcademicYears()); // reload list after a successful delete
  };

  return (
    <div className="ay-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="ay-title text-2xl font-bold">
            Academic Year Management
          </h1>
          <p className="ay-subtitle text-[13.5px] mt-1">
            Create and manage the academic years for your school.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="ay-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Academic Year
        </button>
      </div>

      {/* Toolbar */}
      <div className="ay-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="ay-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search academic years…"
            className="ay-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

        {/* School Filter */}
        {isAdmin && (
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="ay-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
            disabled={schoolsLoading}
          >
            <option value="">All Schools</option>

            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        )}

        <span className="ay-count-text text-[12.5px] ml-auto">
          {filteredYears.length} year{filteredYears.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="ay-loading px-2 py-10 text-[13.5px]">
          Loading academic years…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="ay-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchAcademicYears())}
            className="ay-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <AcademicYearTable
          academicYears={filteredYears}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          deletingId={deleteTarget?.id ?? null}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      <AcademicYearModal
        isOpen={modalOpen}
        onClose={closeModal}
        academicYear={editingYear}
        schoolId={schoolId}
        isAdmin={isAdmin}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteAcademicYearModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        academicYear={deleteTarget}
      />
    </div>
  );
};

export default AcademicYearPage;
