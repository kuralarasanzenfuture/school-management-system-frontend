import { useState } from "react";
import { removeEmployeeSalaryStructure } from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice";
import { removeEmployeeSalaryStructureDetail } from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice";
import { useDispatch } from "react-redux";


export function SalaryDeleteModal({ isOpen, onClose, type = "structure", item = null }) {
    const dispatch = useDispatch();
    const [busy, setBusy] = useState(false);

    const isStructure = type === "structure";

    const handleDelete = async () => {
        if (!item?.id) return;
        setBusy(true);
        try {
            if (isStructure) {
                await dispatch(removeEmployeeSalaryStructure(item.id)).unwrap();
            } else {
                await dispatch(removeEmployeeSalaryStructureDetail(item.id)).unwrap();
            }
            onClose();
        } catch (err) { alert(err?.message ?? String(err)); }
        finally { setBusy(false); }
    };

    const title = isStructure ? "Delete Salary Structure" : "Remove Component";
    const desc = isStructure
        ? <>Delete <span className="font-semibold">"{item?.structure_name}"</span> for <span className="font-semibold">{item?.first_name} {item?.last_name}</span>? All component details will also be removed.</>
        : <>Remove <span className="font-semibold">{item?.component_name}</span> from <span className="font-semibold">"{item?.structure_name}"</span>?</>;

    return (
        <AnimatePresence>
            {isOpen && (
                <Overlay onClick={onClose}>
                    <Panel maxWidth="max-w-sm">
                        <div className="sm-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="sm-modal-title text-[15px] font-bold">{title}</h2>
                            <button type="button" onClick={onClose} className="sm-close-btn w-7 h-7 rounded-full flex items-center justify-center transition-colors"><X size={15} /></button>
                        </div>
                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="sm-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="sm-delete-icon" />
                            </div>
                            <p className="sm-delete-title text-[15px] font-semibold">Are you sure?</p>
                            <p className="sm-delete-desc text-[13px] leading-relaxed">{desc} This cannot be undone.</p>
                        </div>
                        <div className="sm-modal-footer flex justify-center gap-3 px-5 py-4">
                            <button type="button" onClick={onClose} className="sm-modal-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">Cancel</button>
                            <button type="button" disabled={busy} onClick={handleDelete}
                                className="sm-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]">
                                {busy ? "Deleting…" : isStructure ? "Delete" : "Remove"}
                            </button>
                        </div>
                    </Panel>
                </Overlay>
            )}
        </AnimatePresence>
    );
}
