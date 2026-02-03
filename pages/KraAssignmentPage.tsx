import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  employeeService,
  kpiRowService,
  selfAssessmentService,
} from "../services/localStorageService";
import { Employee, KpiRow, SelfAssessment } from "../types";
import PageHeader from "../components/ui/PageHeader";
import { Target, Plus, Trash2, Save, Eye } from "lucide-react";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ViewNotesModal from "../components/ViewNotesModal";
import Input from "../components/ui/Input";

interface KpiRowWithAssessment extends Partial<KpiRow> {
  assessment?: SelfAssessment;
}

interface KraGroup {
  id: string; // For React keys
  kra_name: string;
  kpis: KpiRowWithAssessment[];
}

const KraAssignmentPage: React.FC = () => {
  const { employee: manager, company, role } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [kraGroups, setKraGroups] = useState<KraGroup[]>([]);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Partial<SelfAssessment> | null>(null);

  useEffect(() => {
    if (manager?.id && company?.id) {
      const allCompanyEmployees = employeeService.getByCompanyId(company.id);
      const assignableEmployees =
        role === "admin"
          ? allCompanyEmployees.filter((e) => e.id !== manager.id)
          : employeeService.getByReportingManagerId(manager.id);
      setEmployees(assignableEmployees);
    }
  }, [manager, company, role]);

  useEffect(() => {
    if (selectedEmployeeId) {
      const existingKpis = kpiRowService.getByEmployeeId(selectedEmployeeId);
      const grouped = existingKpis.reduce(
        (acc, kpi) => {
          const kraName = kpi.kra_name || "Uncategorized";
          if (!acc[kraName]) acc[kraName] = [];
          acc[kraName].push({
            ...kpi,
            assessment: selfAssessmentService.getByKpiRowId(kpi.id),
          });
          return acc;
        },
        {} as Record<string, KpiRowWithAssessment[]>,
      );

      const groups: KraGroup[] = Object.entries(grouped).map(
        ([kra_name, kpis]) => ({
          id: Math.random().toString(),
          kra_name,
          kpis,
        }),
      );
      setKraGroups(groups);
    } else {
      setKraGroups([]);
    }
  }, [selectedEmployeeId]);

  const handleKraNameChange = (groupIndex: number, name: string) => {
    const updatedGroups = [...kraGroups];
    updatedGroups[groupIndex].kra_name = name;
    setKraGroups(updatedGroups);
  };

  const handleKpiChange = (
    groupIndex: number,
    kpiIndex: number,
    field: keyof KpiRow,
    value: any,
  ) => {
    const updatedGroups = [...kraGroups];
    updatedGroups[groupIndex].kpis[kpiIndex] = {
      ...updatedGroups[groupIndex].kpis[kpiIndex],
      [field]: value,
    };
    setKraGroups(updatedGroups);
  };

  const addKra = () =>
    setKraGroups([
      ...kraGroups,
      {
        id: Math.random().toString(),
        kra_name: "",
        kpis: [{ weight: 0, score: null }],
      },
    ]);
  const deleteKra = (groupIndex: number) =>
    setKraGroups(kraGroups.filter((_, i) => i !== groupIndex));

  const addKpi = (groupIndex: number) => {
    const updatedGroups = [...kraGroups];
    updatedGroups[groupIndex].kpis.push({ weight: 0, score: null });
    setKraGroups(updatedGroups);
  };
  const deleteKpi = (groupIndex: number, kpiIndex: number) => {
    const updatedGroups = [...kraGroups];
    updatedGroups[groupIndex].kpis = updatedGroups[groupIndex].kpis.filter(
      (_, i) => i !== kpiIndex,
    );
    setKraGroups(updatedGroups);
  };

  const handleSave = () => {
    if (!selectedEmployeeId) {
      alert("Please select an employee.");
      return;
    }
    const totalWeight = kraGroups
      .flatMap((g) => g.kpis)
      .reduce((sum, kpi) => sum + Number(kpi.weight || 0), 0);
    if (totalWeight !== 100) {
      alert(
        `Total weight of all KPIs must be 100%, but it is ${totalWeight}%.`,
      );
      return;
    }

    // Delete old rows
    const existingKpis = kpiRowService.getByEmployeeId(selectedEmployeeId);
    existingKpis.forEach((kpi) => kpiRowService.delete(kpi.id));

    // Create new ones
    const allKpis = kraGroups.flatMap((group, kraIndex) =>
      group.kpis.map((kpi, kpiIndex) => ({
        employee_id: selectedEmployeeId,
        kra_name: group.kra_name,
        kpi_detail: kpi.kpi_detail || "",
        weight: Number(kpi.weight || 0),
        target: kpi.target || "",
        actual: kpi.actual || "",
        // FIX: Fix TypeScript error by using a type-safe check for falsy values that is not 0.
        score: !kpi.score && kpi.score !== 0 ? null : Number(kpi.score),
        manager_remarks: kpi.manager_remarks || "",
        sort_order: kraIndex * 100 + kpiIndex,
      })),
    );

    allKpis.forEach((kpiData) => {
      if (kpiData.kra_name && kpiData.kpi_detail) {
        kpiRowService.create(kpiData as Omit<KpiRow, "id" | "created_at">);
      }
    });

    alert("KRAs saved successfully!");
  };

  const openNotesModal = (assessment: Partial<SelfAssessment> | undefined) => {
    if (assessment) {
      setSelectedAssessment(assessment);
      setIsNotesModalOpen(true);
    }
  };

  const closeNotesModal = () => {
    setIsNotesModalOpen(false);
    setSelectedAssessment(null);
  };

  const allKpis = kraGroups.flatMap((g) => g.kpis);
  const totalWeight = allKpis.reduce(
    (sum, row) => sum + Number(row.weight || 0),
    0,
  );
  const totalFinalScore = allKpis.reduce(
    (sum, row) =>
      sum + (Number(row.weight || 0) * Number(row.score || 0)) / 100,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="KRA Assignment"
        description="Assign and score KRAs for your employees."
        icon={Target}
      />

      <Card>
        <Select
          label="Select Employee"
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
        >
          <option value="">-- Select an Employee --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstname} {emp.lastname}
            </option>
          ))}
        </Select>
      </Card>

      {selectedEmployeeId && (
        <>
          {kraGroups.map((group, groupIndex) => (
            <Card key={group.id} className="!p-0">
              <div className="p-6 bg-gray-50 flex justify-between items-end gap-4 rounded-t-lg">
                <Input
                  label="Key Result Area (KRA)"
                  value={group.kra_name}
                  onChange={(e) =>
                    handleKraNameChange(groupIndex, e.target.value)
                  }
                  placeholder="e.g., Improve Customer Satisfaction"
                  containerClassName="flex-grow"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteKra(groupIndex)}
                >
                  <Trash2 size={16} className="mr-2" /> Delete KRA
                </Button>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 font-semibold">
                        Key Performance Indicator (KPI)
                      </th>
                      <th className="p-2 font-semibold w-20">Weight %</th>
                      <th className="p-2 font-semibold">Target</th>
                      <th className="p-2 font-semibold">Actual</th>
                      <th className="p-2 font-semibold w-20">Score %</th>
                      <th className="p-2 font-semibold w-24">Final Score</th>
                      <th className="p-2 font-semibold w-24">Notes</th>
                      <th className="p-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.kpis.map((kpi, kpiIndex) => (
                      <tr key={kpiIndex}>
                        <td className="p-1">
                          <input
                            className="w-full border rounded px-2 py-1"
                            value={kpi.kpi_detail || ""}
                            onChange={(e) =>
                              handleKpiChange(
                                groupIndex,
                                kpiIndex,
                                "kpi_detail",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            className="w-full border rounded px-2 py-1"
                            value={kpi.weight || ""}
                            onChange={(e) =>
                              handleKpiChange(
                                groupIndex,
                                kpiIndex,
                                "weight",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="p-1">
                          <input
                            className="w-full border rounded px-2 py-1"
                            value={kpi.target || ""}
                            onChange={(e) =>
                              handleKpiChange(
                                groupIndex,
                                kpiIndex,
                                "target",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="p-1">
                          <input
                            className="w-full border rounded px-2 py-1"
                            value={kpi.actual || ""}
                            onChange={(e) =>
                              handleKpiChange(
                                groupIndex,
                                kpiIndex,
                                "actual",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            className="w-full border rounded px-2 py-1"
                            value={kpi.score ?? ""}
                            onChange={(e) =>
                              handleKpiChange(
                                groupIndex,
                                kpiIndex,
                                "score",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="p-1 text-center font-semibold bg-gray-100 rounded">
                          {(
                            (Number(kpi.weight || 0) * Number(kpi.score || 0)) /
                            100
                          ).toFixed(2)}
                        </td>
                        <td className="p-1 text-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openNotesModal(kpi.assessment)}
                            disabled={!kpi.assessment || !kpi.assessment.id}
                          >
                            <Eye size={16} className="mr-1" /> View
                          </Button>
                        </td>
                        <td className="p-1 text-center">
                          <button
                            onClick={() => deleteKpi(groupIndex, kpiIndex)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addKpi(groupIndex)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add KPI
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex justify-between items-start mt-6">
            <Button variant="secondary" onClick={addKra}>
              <Plus className="w-4 h-4 mr-2" /> Add KRA
            </Button>

            <Card className="w-full max-w-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Total Weight:</span>
                <span
                  className={`font-bold text-lg ${totalWeight !== 100 ? "text-red-500" : "text-green-500"}`}
                >
                  {totalWeight}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Final Score:</span>
                <span className="font-bold text-lg text-blue-600">
                  {totalFinalScore.toFixed(2)}
                </span>
              </div>
              <Button onClick={handleSave} className="w-full mt-4">
                <Save className="w-4 h-4 mr-2" /> Save All Changes
              </Button>
            </Card>
          </div>
        </>
      )}
      <ViewNotesModal
        isOpen={isNotesModalOpen}
        onClose={closeNotesModal}
        assessment={selectedAssessment}
      />
    </div>
  );
};

export default KraAssignmentPage;
