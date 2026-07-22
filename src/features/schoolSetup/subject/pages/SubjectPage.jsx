// import React, { useEffect, useMemo, useState } from "react";
// import { Plus, Search } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import SubjectTable from "../components/SubjectTable.jsx";
// import SubjectModal from "../components/SubjectModal.jsx";
// import StatusFilterDropdown from "../components/StatusFilterDropdown.jsx";
// import {
//   fetchSubjects,
//   createSubjectThunk,
//   updateSubjectThunk,
//   deleteSubjectThunk,
// } from "../../../../redux/schoolSetup/subject/subjectSlice.js";
// import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
// import "../styles/Subject.css";

// const SubjectPage = () => {
//   const dispatch = useDispatch();
//   const { subjects, loading, error } = useSelector((state) => state.subjects);
//   const { user } = useSelector((state) => state.auth);
//   const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
//   const schoolId = isAdmin ? null : user?.school_id;

//   const schools = useSelector((state) => state.schoolProfile?.schools || []);

//   const [search, setSearch] = useState("");
//   const [selectedSchool, setSelectedSchool] = useState("");
//   const [statusFilter, setStatusFilter] = useState(["active", "inactive"]);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);

//   // fetchSubjects takes schoolId directly — pass the admin's selected
//   // filter school (or undefined for "all") and the non-admin's own
//   // school. Re-fetches whenever the admin changes the school filter.
//   useEffect(() => {
//     if (isAdmin) {
//       dispatch(fetchSchools());
//       dispatch(fetchSubjects(selectedSchool || undefined));
//     } else if (schoolId) {
//       dispatch(fetchSubjects(schoolId));
//     }
//   }, [dispatch, isAdmin, schoolId, selectedSchool]);

//   // const filtered = useMemo(() => {
//   //   const term = search.trim().toLowerCase();

//   //   return subjects.filter((subj) => {
//   //     const matchesSearch = term
//   //       ? `${subj.name} ${subj.code || ""}`.toLowerCase().includes(term)
//   //       : true;

//   //     const matchesStatus = statusFilter.includes(subj.status);

//   //     return matchesSearch && matchesStatus;
//   //   });
//   // }, [subjects, search, statusFilter]);

//   const filtered = useMemo(() => {
//     const term = search.trim().toLowerCase();

//     return subjects.filter((subj) => {
//       const matchesSearch = term
//         ? `${subj.name} ${subj.code || ""}`.toLowerCase().includes(term)
//         : true;

//       const matchesStatus =
//         statusFilter.length === 0 || statusFilter.includes(subj.status);

//       const matchesSchool = isAdmin
//         ? !selectedSchool || String(subj.school_id) === String(selectedSchool)
//         : String(subj.school_id) === String(schoolId);

//       return matchesSearch && matchesStatus && matchesSchool;
//     });
//   }, [subjects, search, statusFilter, isAdmin, selectedSchool, schoolId]);

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

//   const refetch = () => {
//     if (isAdmin) dispatch(fetchSubjects(selectedSchool || undefined));
//     else dispatch(fetchSubjects(schoolId));
//   };

//   const handleSubmit = async (payload) => {
//     setSubmitting(true);
//     try {
//       if (editingItem) {
//         await dispatch(
//           updateSubjectThunk({ id: editingItem.id, subjectData: payload }),
//         ).unwrap();
//       } else {
//         await dispatch(createSubjectThunk(payload)).unwrap();
//       }
//       refetch();
//       closeModal();
//     } catch (err) {
//       alert(err || "Failed to save subject");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this subject?")) return;
//     setDeletingId(id);
//     try {
//       await dispatch(deleteSubjectThunk(id)).unwrap();
//     } catch (err) {
//       alert(err || "Delete failed");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <div className="sj-page min-h-screen p-6">
//       {/* Header */}
//       <div className="flex items-start justify-between mb-6">
//         <div>
//           <h1 className="sj-title text-2xl font-bold">Subject Management</h1>
//           <p className="sj-subtitle text-[13.5px] mt-1">
//             Manage the subjects taught at your school.
//           </p>
//         </div>
//         <button
//           onClick={openAddModal}
//           className="sj-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
//         >
//           <Plus size={16} /> Add Subject
//         </button>
//       </div>

//       {/* Toolbar */}
//       <div className="sj-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
//         <div className="relative flex-1 max-w-xs">
//           <Search
//             size={15}
//             className="sj-count-text absolute left-3 top-1/2 -translate-y-1/2"
//           />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search subjects…"
//             className="sj-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
//           />
//         </div>

//         {isAdmin && (
//           <select
//             value={selectedSchool}
//             onChange={(e) => setSelectedSchool(e.target.value)}
//             className="sj-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
//           >
//             <option value="">All Schools</option>
//             {schools.map((s) => (
//               <option key={s.id} value={s.id}>
//                 {s.name}
//               </option>
//             ))}
//           </select>
//         )}

//         <StatusFilterDropdown
//           selected={statusFilter}
//           onChange={setStatusFilter}
//         />

//         <span className="sj-count-text text-[12.5px] ml-auto">
//           {filtered.length} subject{filtered.length === 1 ? "" : "s"}
//         </span>
//       </div>

//       {/* Content */}
//       {loading ? (
//         <p className="sj-loading px-2 py-10 text-[13.5px]">Loading subjects…</p>
//       ) : error ? (
//         <div className="text-center py-10">
//           <p className="sj-error text-[13.5px] mb-3">{error}</p>
//           <button
//             onClick={refetch}
//             className="sj-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       ) : (
//         <SubjectTable
//           subjects={filtered}
//           onEdit={openEditModal}
//           onDelete={handleDelete}
//           deletingId={deletingId}
//           showSchoolColumn={isAdmin && !selectedSchool}
//         />
//       )}

//       <SubjectModal
//         isOpen={modalOpen}
//         onClose={closeModal}
//         subject={editingItem}
//         onSubmit={handleSubmit}
//         submitting={submitting}
//       />
//     </div>
//   );
// };

// export default SubjectPage;

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import SubjectTable from "../components/SubjectTable.jsx";
import SubjectModal from "../components/SubjectModal.jsx";
import DeleteSubjectModal from "../components/DeleteSubjectModal.jsx";
import StatusFilterDropdown from "../components/StatusFilterDropdown.jsx";
import {
  fetchSubjects,
  createSubjectThunk,
  updateSubjectThunk,
} from "../../../../redux/schoolSetup/subject/subjectSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/Subject.css";

const SubjectPage = () => {
  const dispatch = useDispatch();
  const { subjects, loading, error } = useSelector((state) => state.subjects);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [statusFilter, setStatusFilter] = useState(["active", "inactive"]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // fetchSubjects takes schoolId directly — pass the admin's selected
  // filter school (or undefined for "all") and the non-admin's own
  // school. Re-fetches whenever the admin changes the school filter.
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchSchools());
      dispatch(fetchSubjects(selectedSchool || undefined));
    } else if (schoolId) {
      dispatch(fetchSubjects(schoolId));
    }
  }, [dispatch, isAdmin, schoolId, selectedSchool]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return subjects.filter((subj) => {
      const matchesSearch = term
        ? `${subj.name} ${subj.code || ""}`.toLowerCase().includes(term)
        : true;

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(subj.status);

      const matchesSchool = isAdmin
        ? !selectedSchool || String(subj.school_id) === String(selectedSchool)
        : String(subj.school_id) === String(schoolId);

      return matchesSearch && matchesStatus && matchesSchool;
    });
  }, [subjects, search, statusFilter, isAdmin, selectedSchool, schoolId]);

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

  const refetch = () => {
    if (isAdmin) dispatch(fetchSubjects(selectedSchool || undefined));
    else dispatch(fetchSubjects(schoolId));
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await dispatch(
          updateSubjectThunk({ id: editingItem.id, subjectData: payload }),
        ).unwrap();
      } else {
        await dispatch(createSubjectThunk(payload)).unwrap();
      }
      refetch();
      closeModal();
    } catch (err) {
      alert(err || "Failed to save subject");
    } finally {
      setSubmitting(false);
    }
  };

  // SubjectTable calls onDelete(id) — matching every other table in this
  // app. DeleteSubjectModal needs the full record (name, code) to show a
  // meaningful confirmation, so look it up here rather than changing the
  // table's contract. Same fix applied to every other module's page.
  const openDeleteModal = (id) => {
    const subject = subjects.find((s) => String(s.id) === String(id));
    setDeleteTarget(subject ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    refetch(); // reload list after a successful delete
  };

  return (
    <div className="sj-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="sj-title text-2xl font-bold">Subject Management</h1>
          <p className="sj-subtitle text-[13.5px] mt-1">
            Manage the subjects taught at your school.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="sj-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {/* Toolbar */}
      <div className="sj-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="sj-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects…"
            className="sj-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

        {isAdmin && (
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="sj-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
          >
            <option value="">All Schools</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        <StatusFilterDropdown
          selected={statusFilter}
          onChange={setStatusFilter}
        />

        <span className="sj-count-text text-[12.5px] ml-auto">
          {filtered.length} subject{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="sj-loading px-2 py-10 text-[13.5px]">Loading subjects…</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="sj-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={refetch}
            className="sj-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <SubjectTable
          subjects={filtered}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          deletingId={deleteTarget?.id ?? null}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      <SubjectModal
        isOpen={modalOpen}
        onClose={closeModal}
        subject={editingItem}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteSubjectModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        subject={deleteTarget}
      />
    </div>
  );
};

export default SubjectPage;
