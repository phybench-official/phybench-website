"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tagMap } from "@/lib/constants";
import { useState } from "react";
import { FilterOptions } from "@/lib/types";

interface FilterDialogProps {
  onApplyFilter: (filters: FilterOptions) => void;
  onClearFilter: () => void;
  currentFilters: FilterOptions;
  isExam?: boolean;
}

export function FilterDialog({
  onApplyFilter,
  onClearFilter,
  currentFilters,
}: FilterDialogProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleApplyFilter = () => {
    onApplyFilter(filters);
    setDialogOpen(false);
  };

  const handleClearFilter = () => {
    const emptyFilters = {
      tag: null,
      status: null,
      nominated: null,
      title: null,
      translatedStatus: null,
    };
    setFilters(emptyFilters);
    onClearFilter();
    setDialogOpen(false);
  };

  // 当dialog打开时，同步当前筛选条件到本地状态
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setFilters(currentFilters);
    }
    setDialogOpen(open);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ListFilter size={18} />
          筛选
          {(currentFilters.tag ||
            currentFilters.status ||
            currentFilters.nominated ||
            currentFilters.title ||
            currentFilters.translatedStatus) && (
            <span className="ml-1 h-2 w-2 rounded-full bg-primary"></span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>筛选题目</DialogTitle>
          <DialogHeader>设置筛选条件来查找特定题目</DialogHeader>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tag" className="text-right">
              题目类型
            </Label>
            <Select
              value={filters.tag || ""}
              onValueChange={(value) =>
                setFilters({ ...filters, tag: value || null })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择题目类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {Object.entries(tagMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              题目状态
            </Label>
            <Select
              value={filters.status || ""}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value || null })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择题目状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="PENDING">待审核</SelectItem>
                <SelectItem value="RETURNED">已退回</SelectItem>
                <SelectItem value="APPROVED">已通过</SelectItem>
                <SelectItem value="REJECTED">已拒绝</SelectItem>
                <SelectItem value="ARCHIVED">已入库</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="translatedStatus" className="text-right">
              翻译状态
            </Label>
            <Select
              value={filters.translatedStatus || ""}
              onValueChange={(value) =>
                setFilters({ ...filters, translatedStatus: value || null })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择翻译状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="PENDING">翻译未审</SelectItem>
                <SelectItem value="ARCHIVED">翻译已审</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              题目名称
            </Label>
            <Input
              id="title"
              value={filters.title || ""}
              onChange={(e) =>
                setFilters({ ...filters, title: e.target.value || null })
              }
              placeholder="输入题目名称关键词"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nominated" className="text-right">
              提名好题
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Checkbox
                id="nominated"
                checked={filters.nominated === true}
                onCheckedChange={(checked) =>
                  setFilters({
                    ...filters,
                    nominated: checked === true ? true : null,
                  })
                }
              />
              <label
                htmlFor="nominated"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                仅显示提名为好题的题目
              </label>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClearFilter}>
            清空筛选
          </Button>
          <Button onClick={handleApplyFilter}>应用筛选</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
