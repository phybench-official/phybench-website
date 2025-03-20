// 状态标签映射
const statusMap = {
  PENDING: { label: "待审核", color: "bg-yellow-500" },
  RETURNED: { label: "已打回", color: "bg-orange-500" },
  APPROVED: { label: "已通过", color: "bg-green-500" },
  REJECTED: { label: "已拒绝", color: "bg-red-500" },
}

// 题目类型标签映射
const tagMap = {
  MECHANICS: { label: "力学", color: "bg-blue-500" },
  ELECTRICITY: { label: "电磁学", color: "bg-purple-500" },
  THERMODYNAMICS: { label: "热学", color: "bg-orange-500" },
  OPTICS: { label: "光学", color: "bg-yellow-500" },
  MODERN: { label: "近代物理", color: "bg-green-500" },
  ADVANCED: { label: "高等物理", color: "bg-indigo-500" },
  OTHER: { label: "其它", color: "bg-gray-500" },
}

export { tagMap, statusMap }