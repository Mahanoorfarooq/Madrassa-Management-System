import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdmissionForm from "@/components/AdmissionForm";
import type { AdmissionData } from "@/types/admission";
import { Printer as PrinterIcon, RefreshCw as RefreshCwIcon } from "lucide-react";

function toDDMMYYYY(d?: string | Date | null): string | undefined {
  if (!d) return undefined;
  const date = typeof d === "string" ? new Date(d) : d;
  if (!(date instanceof Date) || isNaN(date.getTime())) return undefined;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

export default function AdmissionPrintPage() {
  const [data, setData] = useState<AdmissionData | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const router = useRouter();
  const { id: qId, print: qPrint } = router.query as { id?: string; print?: string };

  async function fetchStudentData(id: string) {
    setLoading(true);
    try {
      const endpoint = id === 'me' ? '/api/students/me' : `/api/students/${encodeURIComponent(id)}`;
      const response = await fetch(endpoint, {
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || `Failed with ${response.status}`);
      }
      const json = await response.json();
      const student = json?.student || json; // /me may return {student}

      const formData: AdmissionData = {
        studentName: student?.urduName || student?.fullName,
        fatherName: student?.fatherName,
        dateOfBirth: toDDMMYYYY(student?.dateOfBirth),
        caste: undefined,
        profession: undefined,
        previousEducation: undefined,
        previousSchool: student?.previousSchool,
        class: student?.classId?.className || student?.className,
        homePhone: student?.contactNumber,
        personalPhone: student?.guardianPhone,
        dateOfEntry: toDDMMYYYY(student?.admissionDate || student?.formDate),
        address: student?.address,
        photoUrl: student?.photoUrl,
      };

      setData(formData);
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert((error as Error).message || "Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  }

  const handleFetchData = () => {
    if (studentId.trim()) {
      fetchStudentData(studentId.trim());
    } else {
      alert("Please enter a student ID");
    }
  };
  const handleClear = () => {
    setData(undefined);
    setStudentId("");
  };
  const handlePrint = () => {
    if (!data) return;
    // Ensure background images print
    window.print();
  };

  // Auto-load by query param ?id=... and optional ?print=1
  useEffect(() => {
    if (!router.isReady) return;
    if (qId && typeof qId === "string") {
      setStudentId(qId);
      fetchStudentData(qId).then(() => {
        if (qPrint === "1") {
          setTimeout(() => window.print(), 300);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, qId, qPrint]);

  return (
    <div className="min-h-screen bg-gray-800 py-8 px-4 flex flex-col items-center gap-8" dir="rtl">
      {/* Controls Section */}
      <div className="no-print w-full max-w-[210mm] bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">داخلہ فارم جنریٹر</h2>
          <p className="text-gray-600">طالب علم کا ID درج کریں اور پرنٹ کریں</p>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter Student ID"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!data ? (
            <button
              onClick={handleFetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? (
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCwIcon className="w-4 h-4" />
              )}
              {loading ? "Loading..." : "Fetch Data"}
            </button>
          ) : (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-colors"
            >
              Clear Form
            </button>
          )}
          <button
            onClick={handlePrint}
            disabled={!data}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            <PrinterIcon className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* The Admission Form */}
      <AdmissionForm data={data} />

      <div className="no-print text-gray-300 text-sm">
        پرنٹ سیٹنگز میں Background graphics آن کریں۔
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          html, body, #__next { height: auto; }
          body { background: #fff; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}
