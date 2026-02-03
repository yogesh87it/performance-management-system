import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  kpiRowService,
  selfAssessmentService,
} from "../services/localStorageService";
import { KpiRow, SelfAssessment } from "../types";
import PageHeader from "../components/ui/PageHeader";
import { UserCheck, Edit2, Save } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

interface KpiView extends KpiRow {
  assessment: Partial<SelfAssessment>;
}

const MyKraPage: React.FC = () => {
  const { employee } = useAuth();
  const [kpiViews, setKpiViews] = useState<KpiView[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (employee?.id) {
      const kpis = kpiRowService.getByEmployeeId(employee.id);
      const views: KpiView[] = kpis.map((kpi) => ({
        ...kpi,
        assessment: selfAssessmentService.getByKpiRowId(kpi.id) || {
          kpi_row_id: kpi.id,
          employee_id: employee.id,
        },
      }));
      setKpiViews(views);
    }
  }, [employee]);

  const handleAssessmentChange = (
    kpiId: string,
    field: keyof SelfAssessment,
    value: string,
  ) => {
    setKpiViews(
      kpiViews.map((view) =>
        view.id === kpiId
          ? { ...view, assessment: { ...view.assessment, [field]: value } }
          : view,
      ),
    );
  };

  const handleSave = (view: KpiView) => {
    if (!employee?.id) return;

    const assessmentData = {
      ...view.assessment,
      kpi_row_id: view.id,
      employee_id: employee.id,
      action_taken: view.assessment.action_taken || "",
      accomplishment: view.assessment.accomplishment || "",
      notes: view.assessment.notes || "",
    };

    if (view.assessment.id) {
      selfAssessmentService.update(view.assessment.id, assessmentData);
    } else {
      const newAssessment = selfAssessmentService.create(assessmentData);
      setKpiViews(
        kpiViews.map((v) =>
          v.id === view.id ? { ...v, assessment: newAssessment } : v,
        ),
      );
    }
    setEditingId(null);
    alert("Assessment saved!");
  };

  const groupedKpiViews = useMemo(() => {
    return kpiViews.reduce(
      (acc, view) => {
        const kraName = view.kra_name || "Uncategorized";
        if (!acc[kraName]) acc[kraName] = [];
        acc[kraName].push(view);
        return acc;
      },
      {} as Record<string, KpiView[]>,
    );
  }, [kpiViews]);

  const kraNames = Object.keys(groupedKpiViews);
  const totalWeight = kpiViews.reduce(
    (sum, item) => sum + (item.weight || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My KRA"
        description="View your assigned KRAs and track your progress."
        icon={UserCheck}
      />

      <Card>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Performance Summary
          </h3>
          <div>
            <p className="text-sm text-gray-500 text-right">Total Weight</p>
            <p
              className={`text-2xl font-bold ${totalWeight !== 100 ? "text-red-500" : "text-blue-600"}`}
            >
              {totalWeight}%
            </p>
          </div>
        </div>
      </Card>

      {kraNames.length > 0 ? (
        kraNames.map((kraName) => (
          <Card key={kraName} className="!p-0">
            <div className="p-6 bg-gray-50 rounded-t-lg border-b">
              <h3 className="text-xl font-bold text-gray-800">{kraName}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {groupedKpiViews[kraName].map((view) => (
                <div key={view.id} className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 pb-4">
                    <div>
                      <p className="text-xs text-gray-500">KPI</p>
                      <p className="font-semibold">{view.kpi_detail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="font-semibold text-blue-600">
                        {view.weight}%
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Target</p>
                      <p>{view.target}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-700">
                        Self Assessment
                      </h4>
                      {editingId !== view.id && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingId(view.id)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <TextareaField
                        label="Action Taken"
                        value={view.assessment.action_taken || ""}
                        onChange={(e) =>
                          handleAssessmentChange(
                            view.id,
                            "action_taken",
                            e.target.value,
                          )
                        }
                        disabled={editingId !== view.id}
                      />
                      <TextareaField
                        label="Accomplishment"
                        value={view.assessment.accomplishment || ""}
                        onChange={(e) =>
                          handleAssessmentChange(
                            view.id,
                            "accomplishment",
                            e.target.value,
                          )
                        }
                        disabled={editingId !== view.id}
                      />
                      <TextareaField
                        label="Notes"
                        value={view.assessment.notes || ""}
                        onChange={(e) =>
                          handleAssessmentChange(
                            view.id,
                            "notes",
                            e.target.value,
                          )
                        }
                        disabled={editingId !== view.id}
                      />
                    </div>
                    {editingId === view.id && (
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="secondary"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => handleSave(view)}>
                          <Save className="w-4 h-4 mr-1" /> Save
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      ) : (
        <Card>
          <p className="text-center text-gray-500 py-8">
            No KRAs have been assigned to you yet.
          </p>
        </Card>
      )}
    </div>
  );
};

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      {...props}
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
    />
  </div>
);

export default MyKraPage;
