import React, { useEffect, useState } from "react";
import { Loader2, Clock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { computeWorkingHours } from "../../../features/employeeShift/shiftTimeUtils.js";

const EMPTY = {
    school_id: "",
    name: "",
    start_time: "",
    end_time: "",
    grace_minutes: "10",
    working_hours: "",
    status: "active",
};

/**
 * Add/edit form for a single employee shift.
 *
 * `working_hours` auto-fills from start_time/end_time whenever either
 * changes, but stays editable — useful for split shifts or shifts with
 * an unpaid break that shouldn't count toward working hours.
 *
 * @param {object|null} initialData
 * @param {(payload: object) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function EmployeeShiftForm({
    initialData = null,
    onSubmit,
    onCancel,
    submitting,
}) {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    const schools = useSelector((state) => state.schoolProfile?.schools || []);
    const schoolsLoading = useSelector(
        (state) => state.schoolProfile?.loading || false,
    );

    useEffect(() => {
        if (isAdmin) dispatch(fetchSchools());
    }, [dispatch, isAdmin]);

    const isEdit = Boolean(initialData?.id);
    const [data, setData] = useState(EMPTY);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setData({
                school_id: initialData.school_id ?? "",
                name: initialData.name || "",
                start_time: (initialData.start_time || "").slice(0, 5),
                end_time: (initialData.end_time || "").slice(0, 5),
                grace_minutes:
                    initialData.grace_minutes != null
                        ? String(initialData.grace_minutes)
                        : "10",
                working_hours:
                    initialData.working_hours != null
                        ? String(initialData.working_hours)
                        : "",
                status: initialData.status || "active",
            });
        } else {
            setData({ ...EMPTY, school_id: isAdmin ? "" : (schoolId ?? "") });
        }
        setErrors({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    useEffect(() => {
        if (!initialData && !isAdmin && schoolId) {
            setData((d) => (d.school_id ? d : { ...d, school_id: schoolId }));
        }
    }, [schoolId, isAdmin, initialData]);

    const set = (key) => (e) => {
        setData((d) => ({ ...d, [key]: e.target.value }));
        if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
    };

    const setTime = (key) => (e) => {
        const value = e.target.value;
        setData((d) => {
            const next = { ...d, [key]: value };
            const startTime = key === "start_time" ? value : d.start_time;
            const endTime = key === "end_time" ? value : d.end_time;
            if (startTime && endTime) {
                next.working_hours = computeWorkingHours(startTime, endTime);
            }
            return next;
        });
        if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
    };

    const validate = () => {
        const e = {};
        if (isAdmin && !data.school_id) e.school_id = "Please select a school";
        if (!data.name.trim()) e.name = "Shift name is required";
        if (!data.start_time) e.start_time = "Start time is required";
        if (!data.end_time) e.end_time = "End time is required";
        if (
            data.grace_minutes !== "" &&
            (Number.isNaN(Number(data.grace_minutes)) ||
                Number(data.grace_minutes) < 0)
        ) {
            e.grace_minutes = "Enter a valid number";
        }
        if (
            data.working_hours !== "" &&
            (Number.isNaN(Number(data.working_hours)) ||
                Number(data.working_hours) < 0)
        ) {
            e.working_hours = "Enter a valid number";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        onSubmit({
            school_id: Number(isAdmin ? data.school_id : schoolId),
            name: data.name.trim(),
            start_time: data.start_time,
            end_time: data.end_time,
            grace_minutes:
                data.grace_minutes === "" ? 10 : Number(data.grace_minutes),
            working_hours:
                data.working_hours === "" ? null : Number(data.working_hours),
            status: data.status,
        });
    };

    const inputCls = (key) =>
        `es-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "es-input-error" : ""}`;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isAdmin && (
                <div className="flex flex-col gap-1.5">
                    <label className="es-field-label text-[13px] font-medium">
                        School <span className="es-field-required">*</span>
                    </label>
                    <select
                        className={inputCls("school_id")}
                        value={data.school_id}
                        onChange={set("school_id")}
                        disabled={schoolsLoading}
                    >
                        <option value="">
                            {schoolsLoading ? "Loading schools..." : "Select a school"}
                        </option>
                        {schools.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <div className="h-4">
                        {errors.school_id && (
                            <p className="es-field-error text-[11px]">{errors.school_id}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <label className="es-field-label text-[13px] font-medium">
                    Shift Name <span className="es-field-required">*</span>
                </label>
                <input
                    autoFocus
                    className={inputCls("name")}
                    placeholder="e.g. Morning Shift"
                    value={data.name}
                    onChange={set("name")}
                    maxLength={100}
                />
                <div className="h-4">
                    {errors.name && (
                        <p className="es-field-error text-[11px]">{errors.name}</p>
                    )}
                </div>
            </div>

            {/* Time range — visually grouped as one unit with a connecting rule */}
            <div className="es-time-range-group rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} className="es-time-range-icon" />
                    <span className="es-field-label text-[12.5px] font-semibold uppercase tracking-wide">
                        Shift Hours
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="es-field-label text-[13px] font-medium">
                            Start Time <span className="es-field-required">*</span>
                        </label>
                        <input
                            type="time"
                            className={inputCls("start_time")}
                            value={data.start_time}
                            onChange={setTime("start_time")}
                        />
                        <div className="h-4">
                            {errors.start_time && (
                                <p className="es-field-error text-[11px]">
                                    {errors.start_time}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="es-field-label text-[13px] font-medium">
                            End Time <span className="es-field-required">*</span>
                        </label>
                        <input
                            type="time"
                            className={inputCls("end_time")}
                            value={data.end_time}
                            onChange={setTime("end_time")}
                        />
                        <div className="h-4">
                            {errors.end_time && (
                                <p className="es-field-error text-[11px]">
                                    {errors.end_time}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="es-field-label text-[13px] font-medium">
                        Grace Period (minutes)
                    </label>
                    <input
                        type="number"
                        min="0"
                        className={inputCls("grace_minutes")}
                        value={data.grace_minutes}
                        onChange={set("grace_minutes")}
                    />
                    <div className="h-4">
                        {errors.grace_minutes && (
                            <p className="es-field-error text-[11px]">
                                {errors.grace_minutes}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="es-field-label text-[13px] font-medium">
                        Working Hours
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={inputCls("working_hours")}
                        value={data.working_hours}
                        onChange={set("working_hours")}
                        placeholder="Auto-calculated"
                    />
                    <div className="h-4">
                        {errors.working_hours && (
                            <p className="es-field-error text-[11px]">
                                {errors.working_hours}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="es-field-label text-[13px] font-medium">
                    Status
                </label>
                <div className="flex gap-2">
                    {["active", "inactive"].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setData((d) => ({ ...d, status: s }))}
                            className={`es-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${data.status === s
                                    ? s === "active"
                                        ? "es-status-toggle-active"
                                        : "es-status-toggle-inactive"
                                    : ""
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="es-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="es-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="es-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {isEdit ? "Update Shift" : "Create Shift"}
                </button>
            </div>
        </form>
    );
}