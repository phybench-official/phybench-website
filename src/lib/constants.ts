// 状态标签映射
const statusMap = {
  PENDING: { label: "待审核", color: "bg-yellow-500" },
  RETURNED: { label: "已打回", color: "bg-orange-500" },
  APPROVED: { label: "已通过", color: "bg-green-500" },
  ARCHIVED: { label: "已入库", color: "bg-green-500" },
  REJECTED: { label: "已拒绝", color: "bg-red-500" },
};

// 翻译状态标签映射
const translatedStatusMap = {
  PENDING: { label: "翻译未审", color: "bg-yellow-500" },
  ARCHIVED: { label: "翻译已审", color: "bg-green-500" },
};

// 题目类型标签映射
const tagMap = {
  MECHANICS: { label: "力学", color: "bg-blue-500" },
  ELECTRICITY: { label: "电磁学", color: "bg-purple-500" },
  THERMODYNAMICS: { label: "热学", color: "bg-orange-700" },
  OPTICS: { label: "光学", color: "bg-yellow-700" },
  MODERN: { label: "近代物理", color: "bg-green-700" },
  ADVANCED: { label: "高等物理", color: "bg-indigo-600" },
  OTHER: { label: "其它", color: "bg-gray-600" },
};

export { tagMap, translatedStatusMap, statusMap };
