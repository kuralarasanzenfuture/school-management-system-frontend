// import React, { useEffect, useMemo, useState } from "react";
// import { Plus, Search } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import ClassSubjectTable from "../components/ClassSubjectTable.jsx";
// import ClassSubjectModal from "../components/ClassSubjectModal.jsx";
// import {
//   fetchClassSubjects,
//   createClassSubjectThunk,
//   updateClassSubjectThunk,
//   deleteClassSubjectThunk,
// } from "../../../../redux/schoolSetup/class_subjects/classSubjectSlice.js";
// import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
// import "../styles/ClassSubject.css";

// const ClassSubjectPage = () => {
//   const dispatch = useDispatch();
//   const { classSubjects, loading, error } = useSelector(
//     (state) => state.classSubjects,
//   );
//   const { user } = useSelector((state) => state.auth);
//   const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
//   const schoolId = isAdmin ? null : user?.school_id;

//   const schools = useSelector((state) => state.schoolProfile?.schools || []);

//   const [search, setSearch] = useState("");
//   const [selectedSchool, setSelectedSchool] = useState("");

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);

//   // fetchClassSubjects takes NO arguments — it always returns everything,
//   // so school scoping has to happen client-side (below), not via the
//   // fetch call itself.
//   useEffect(() => {
//     dispatch(fetchClassSubjects());
//     if (isAdmin) dispatch(fetchSchools());
//   }, [dispatch, isAdmin]);

//   const filtered = useMemo(() => {
//     const term = search.trim().toLowerCase();

//     return classSubjects.filter((cx) => {
//       const matchesSearch = term
//         ? `${cx.class_name} ${cx.subject_name} ${cx.teacher_name || ""}`
//             .toLowerCase()
//             .includes(term)
//         : true;

//       const matchesSchool =
//         isAdmin && selectedSchool
//           ? String(cx.school_id) === String(selectedSchool)
//           : !isAdmin && schoolId
//             ? String(cx.school_id) === String(schoolId)
//             : true;

//       return matchesSearch && matchesSchool;
//     });
//   }, [classSubjects, search, selectedSchool, isAdmin, schoolId]);

//   const openAddModal = () => {
//     setEditingItem(null);
//     setModalOpen(true);
//   };

//   const openEditModal = (item) => {
//     setEditingItem(item);
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setEditingItem(null);
//   };

//   const handleSubmit = async (payload) => {
//     setSubmitting(true);
//     try {
//       if (editingItem) {
//         await dispatch(
//           updateClassSubjectThunk({
//             id: editingItem.id,
//             classSubjectData: payload,
//           }),
//         ).unwrap();
//       } else {
//         await dispatch(createClassSubjectThunk(payload)).unwrap();
//       }
//       dispatch(fetchClassSubjects());
//       closeModal();
//     } catch (err) {
//       alert(err || "Failed to save class subject");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this class subject mapping?")) return;
//     setDeletingId(id);
//     try {
//       await dispatch(deleteClassSubjectThunk(id)).unwrap();
//     } catch (err) {
//       alert(err || "Delete failed");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <div className="cx-page min-h-screen p-6">
//       {/* Header */}
//       <div className="flex items-start justify-between mb-6">
//         <div>
//           <h1 className="cx-title text-2xl font-bold">
//             Class Subject Management
//           </h1>
//           <p className="cx-subtitle text-[13.5px] mt-1">
//             Map subjects (and teachers) to classes for each academic year.
//           </p>
//         </div>
//         <button
//           onClick={openAddModal}
//           className="cx-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
//         >
//           <Plus size={16} /> Add Mapping
//         </button>
//       </div>

//       {/* Toolbar */}
//       <div className="cx-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
//         <div className="relative flex-1 max-w-xs">
//           <Search
//             size={15}
//             className="cx-count-text absolute left-3 top-1/2 -translate-y-1/2"
//           />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search class, subject, teacher…"
//             className="cx-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
//           />
//         </div>

//         {isAdmin && (
//           <select
//             value={selectedSchool}
//             onChange={(e) => setSelectedSchool(e.target.value)}
//             className="cx-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
//           >
//             <option value="">All Schools</option>
//             {schools.map((s) => (
//               <option key={s.id} value={s.id}>
//                 {s.name}
//               </option>
//             ))}
//           </select>
//         )}

//         <span className="cx-count-text text-[12.5px] ml-auto">
//           {filtered.length} mapping{filtered.length === 1 ? "" : "s"}
//         </span>
//       </div>

//       {/* Content */}
//       {loading ? (
//         <p className="cx-loading px-2 py-10 text-[13.5px]">
//           Loading class subjects…
//         </p>
//       ) : error ? (
//         <div className="text-center py-10">
//           <p className="cx-error text-[13.5px] mb-3">{error}</p>
//           <button
//             onClick={() => dispatch(fetchClassSubjects())}
//             className="cx-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       ) : (
//         <ClassSubjectTable
//           classSubjects={filtered}
//           onEdit={openEditModal}
//           onDelete={handleDelete}
//           deletingId={deletingId}
//           showSchoolColumn={isAdmin && !selectedSchool}
//         />
//       )}

//       <ClassSubjectModal
//         isOpen={modalOpen}
//         onClose={closeModal}
//         classSubject={editingItem}
//         onSubmit={handleSubmit}
//         submitting={submitting}
//       />
//     </div>
//   );
// };

// export default ClassSubjectPage;

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ClassSubjectTable from "../components/ClassSubjectTable";
import ClassSubjectModal from "../components/ClassSubjectModal";
import BulkAssignSubjectsModal from "../components/BulkAssignSubjectsModal";
import {
  fetchClassSubjects,
  createClassSubjectThunk,
  updateClassSubjectThunk,
  deleteClassSubjectThunk,
  addBulkAssignSubjects,
} from "../../../../redux/schoolSetup/class_subjects/classSubjectSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/ClassSubject.css";

const ClassSubjectPage = () => {
  const dispatch = useDispatch();
  const { classSubjects, loading, error } = useSelector(
    (state) => state.classSubjects,
  );
  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // fetchClassSubjects takes NO arguments — it always returns everything,
  // so school scoping has to happen client-side (below), not via the
  // fetch call itself.
  useEffect(() => {
    dispatch(fetchClassSubjects());
    if (isAdmin) dispatch(fetchSchools());
  }, [dispatch, isAdmin]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return classSubjects.filter((cx) => {
      const matchesSearch = term
        ? `${cx.class_name} ${cx.subject_name} ${cx.teacher_name || ""}`
            .toLowerCase()
            .includes(term)
        : true;

      const matchesSchool =
        isAdmin && selectedSchool
          ? String(cx.school_id) === String(selectedSchool)
          : !isAdmin && schoolId
            ? String(cx.school_id) === String(schoolId)
            : true;

      return matchesSearch && matchesSchool;
    });
  }, [classSubjects, search, selectedSchool, isAdmin, schoolId]);

  const openAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await dispatch(
          updateClassSubjectThunk({
            id: editingItem.id,
            classSubjectData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(createClassSubjectThunk(payload)).unwrap();
      }
      dispatch(fetchClassSubjects());
      closeModal();
    } catch (err) {
      alert(err || "Failed to save class subject");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class subject mapping?")) return;
    setDeletingId(id);
    try {
      await dispatch(deleteClassSubjectThunk(id)).unwrap();
    } catch (err) {
      alert(err || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkSubmit = async (payload) => {
    setBulkSubmitting(true);
    try {
      await dispatch(addBulkAssignSubjects(payload)).unwrap();
      dispatch(fetchClassSubjects());
      setBulkModalOpen(false);
    } catch (err) {
      alert(err || "Failed to bulk assign subjects");
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="cx-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="cx-title text-2xl font-bold">
            Class Subject Management
          </h1>
          <p className="cx-subtitle text-[13.5px] mt-1">
            Map subjects (and teachers) to classes for each academic year.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="cx-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors"
          >
            <Upload size={16} /> Bulk Assign
          </button>
          <button
            onClick={openAddModal}
            className="cx-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
          >
            <Plus size={16} /> Add Mapping
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="cx-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="cx-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class, subject, teacher…"
            className="cx-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

        {isAdmin && (
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="cx-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
          >
            <option value="">All Schools</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        <span className="cx-count-text text-[12.5px] ml-auto">
          {filtered.length} mapping{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="cx-loading px-2 py-10 text-[13.5px]">
          Loading class subjects…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="cx-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchClassSubjects())}
            className="cx-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <ClassSubjectTable
          classSubjects={filtered}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      <ClassSubjectModal
        isOpen={modalOpen}
        onClose={closeModal}
        classSubject={editingItem}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <BulkAssignSubjectsModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSubmit={handleBulkSubmit}
        submitting={bulkSubmitting}
      />
    </div>
  );
};

export default ClassSubjectPage;
