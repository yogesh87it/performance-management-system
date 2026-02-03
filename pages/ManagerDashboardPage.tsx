import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  employeeService,
  kpiRowService,
  departmentService,
  selfAssessmentService,
} from "../services/localStorageService";
import { Employee, Department } from "../types";
import PageHeader from "../components/ui/PageHeader";
import {
  Users,
  Edit2,
  Save,
  ClipboardList,
  CheckCircle,
  Award,
  ArrowUpDown,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
  <Card className="!p-4 flex items-center">
    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  </Card>
);

type SortableKeys = keyof Employee | "score";

const ManagerDashboardPage: React.FC = () => {
  const { employee: manager, company, role } = useAuth();
  const [allReportees, setAllReportees] = useState<Employee[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingRecommendation, setEditingRecommendation] = useState<{
    id: string;
    text: string;
  } | null>(null);

  // Admin-specific state
  const [selectedDeptId, setSelectedDeptId] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    if (manager?.id && company?.id) {
      const allCompanyEmployees = employeeService.getByCompanyId(company.id);

      const directReportees =
        role === "admin"
          ? allCompanyEmployees.filter((e) => e.id !== manager.id)
          : employeeService.getByReportingManagerId(manager.id);

      setAllReportees(directReportees);
      setDepartments(departmentService.getByCompanyId(company.id));

      const employeeScores = directReportees.reduce(
        (acc, emp) => {
          const kpis = kpiRowService.getByEmployeeId(emp.id);
          if (kpis.length === 0) {
            acc[emp.id] = 0;
            return acc;
          }
          const totalScore = kpis.reduce(
            (sum, kpi) =>
              sum + (Number(kpi.weight || 0) * Number(kpi.score || 0)) / 100,
            0,
          );
          acc[emp.id] = parseFloat(totalScore.toFixed(2));
          return acc;
        },
        {} as Record<string, number>,
      );
      setScores(employeeScores);
    }
  }, [manager, company, role]);

  const reporteesWithScores = useMemo(
    () =>
      allReportees.map((emp) => ({
        ...emp,
        score: scores[emp.id] || 0,
      })),
    [allReportees, scores],
  );

  const filteredReportees = useMemo(() => {
    if (role !== "admin" || selectedDeptId === "all") {
      return reporteesWithScores;
    }
    return reporteesWithScores.filter((emp) => emp.dept_id === selectedDeptId);
  }, [reporteesWithScores, selectedDeptId, role]);

  const sortedReportees = useMemo(() => {
    let sortableItems = [...filteredReportees];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredReportees, sortConfig]);

  const stats = useMemo(() => {
    const reporteesToStat = filteredReportees;

    const krasAssignedCount = reporteesToStat.filter(
      (emp) => kpiRowService.getByEmployeeId(emp.id).length > 0,
    ).length;

    const krasCompletedCount = reporteesToStat.filter((emp) => {
      const kpis = kpiRowService.getByEmployeeId(emp.id);
      if (kpis.length === 0) return false;
      return kpis.every((kpi) => !!selfAssessmentService.getByKpiRowId(kpi.id));
    }).length;

    const managerScoredCount = reporteesToStat.filter((emp) => {
      const kpis = kpiRowService.getByEmployeeId(emp.id);
      if (kpis.length === 0) return false;
      return kpis.every((kpi) => typeof kpi.score === "number");
    }).length;

    return {
      reporteeCount: reporteesToStat.length,
      krasAssigned: krasAssignedCount,
      krasCompleted: krasCompletedCount,
      managerScored: managerScoredCount,
    };
  }, [filteredReportees]);

  const requestSort = (key: SortableKeys) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-blue-100 text-blue-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleEditRecommendation = (emp: Employee) => {
    setEditingRecommendation({
      id: emp.id,
      text: emp.manager_recommendation || "",
    });
  };

  const handleSaveRecommendation = () => {
    if (!editingRecommendation) return;
    employeeService.update(editingRecommendation.id, {
      manager_recommendation: editingRecommendation.text,
    });
    setAllReportees(
      allReportees.map((emp) =>
        emp.id === editingRecommendation.id
          ? { ...emp, manager_recommendation: editingRecommendation.text }
          : emp,
      ),
    );
    setEditingRecommendation(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          role === "admin"
            ? "Company Performance Overview"
            : "Manager Dashboard"
        }
        description={
          role === "admin"
            ? "View performance across all employees."
            : "View performance of your direct reports."
        }
        icon={Users}
      />
      {role === "admin" && (
        <Card>
          <div className="w-full md:w-1/3">
            <Select
              label="Filter by Department"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={
            role === "admin" && selectedDeptId === "all"
              ? "Total Employees"
              : "Reportees"
          }
          value={stats.reporteeCount}
          icon={Users}
        />
        <StatCard
          title="KRAs Assigned"
          value={stats.krasAssigned}
          icon={ClipboardList}
        />
        <StatCard
          title="Self-Assessments Completed"
          value={stats.krasCompleted}
          icon={CheckCircle}
        />
        <StatCard
          title="Manager Scoring Completed"
          value={stats.managerScored}
          icon={Award}
        />
      </div>
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Employee List ({sortedReportees.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => requestSort("id")}
                >
                  Employee ID{" "}
                  <ArrowUpDown size={12} className="inline-block ml-1" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => requestSort("firstname")}
                >
                  Name <ArrowUpDown size={12} className="inline-block ml-1" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => requestSort("personal_email")}
                >
                  Email <ArrowUpDown size={12} className="inline-block ml-1" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => requestSort("score")}
                >
                  Overall Score{" "}
                  <ArrowUpDown size={12} className="inline-block ml-1" />
                </th>
                <th className="px-4 py-2 min-w-[300px]">
                  Manager Recommendation
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedReportees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">{emp.id}</td>
                  <td className="px-4 py-2">
                    {emp.firstname} {emp.lastname}
                  </td>
                  <td className="px-4 py-2">{emp.personal_email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(emp.score)}`}
                    >
                      {emp.score === 0 ? "N/A" : emp.score}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {editingRecommendation?.id === emp.id ? (
                      <div className="flex items-start gap-2">
                        <textarea
                          value={editingRecommendation.text}
                          onChange={(e) =>
                            setEditingRecommendation({
                              ...editingRecommendation,
                              text: e.target.value,
                            })
                          }
                          className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="e.g., Promote, Bonus..."
                        />
                        <Button size="sm" onClick={handleSaveRecommendation}>
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 group">
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">
                          {emp.manager_recommendation || (
                            <span className="text-gray-400 italic">
                              No recommendation yet.
                            </span>
                          )}
                        </p>
                        {role !== "admin" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditRecommendation(emp)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedReportees.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No employees found.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ManagerDashboardPage;
