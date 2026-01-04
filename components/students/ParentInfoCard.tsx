interface ParentInfoCardProps {
  fatherName?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianCNIC?: string;
  guardianPhone?: string;
  guardianAddress?: string;
}

export function ParentInfoCard({
  fatherName,
  guardianName,
  guardianRelation,
  guardianCNIC,
  guardianPhone,
  guardianAddress,
}: ParentInfoCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2 text-right">
      <h3 className="text-sm font-semibold text-gray-800 mb-1">
        والد / سرپرست کی معلومات
      </h3>
      {fatherName && (
        <p className="text-xs text-gray-600">
          <span className="font-semibold">والد کا نام: </span>
          {fatherName}
        </p>
      )}
      {guardianName && (
        <p className="text-xs text-gray-600">
          <span className="font-semibold">سرپرست کا نام: </span>
          {guardianName}
        </p>
      )}
      {guardianRelation && (
        <p className="text-xs text-gray-600">
          <span className="font-semibold">رشتہ: </span>
          {guardianRelation}
        </p>
      )}
      {guardianCNIC && (
        <p className="text-xs text-gray-600">
          <span className="font-semibold">سرپرست کا شناختی کارڈ: </span>
          {guardianCNIC}
        </p>
      )}
      {guardianPhone && (
        <p className="text-xs text-gray-600">
          <span className="font-semibold">فون نمبر: </span>
          {guardianPhone}
        </p>
      )}
      {guardianAddress && (
        <p className="text-xs text-gray-600">
          <span className="font-semibold">پتہ: </span>
          {guardianAddress}
        </p>
      )}
      {!fatherName && !guardianName && !guardianPhone && (
        <p className="text-xs text-gray-400">
          والد / سرپرست کی معلومات ابھی محفوظ نہیں ہوئیں۔
        </p>
      )}
    </div>
  );
}
