"use client";

import { Select, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  useFindOrCreateEducationMutation,
  useFindOrCreateServiceMutation,
  useLazySearchEducationsQuery,
  useLazySearchServicesQuery,
} from "../../redux/features/catalog/catalogApi";

/**
 * Multi-select with live search against catalog.
 * If the typed value is missing, creates it in DB (find-or-create).
 */
export default function CatalogSelect({
  mode = "multiple",
  type = "service", // service | education
  value,
  onChange,
  placeholder = "Search or add…",
  className = "w-full",
  disabled = false,
}) {
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);

  const [searchServices] = useLazySearchServicesQuery();
  const [searchEducations] = useLazySearchEducationsQuery();
  const [createService] = useFindOrCreateServiceMutation();
  const [createEducation] = useFindOrCreateEducationMutation();

  const load = async (q = "") => {
    setSearching(true);
    try {
      const res =
        type === "education"
          ? await searchEducations({ q, limit: 40 }).unwrap()
          : await searchServices({ q, limit: 40 }).unwrap();
      const list = (res?.data || []).map((item) => ({
        value: item.name,
        label: item.name,
      }));
      setOptions(list);
    } catch {
      setOptions([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const selectedValues = useMemo(() => {
    if (!value) return mode === "multiple" ? [] : undefined;
    if (mode === "multiple") {
      return Array.isArray(value) ? value : String(value).split(",").filter(Boolean);
    }
    return value;
  }, [value, mode]);

  const ensureExists = async (name) => {
    const clean = String(name || "").trim();
    if (!clean) return null;
    const hasToken =
      typeof window !== "undefined" && localStorage.getItem("user_token");
    if (!hasToken) {
      setOptions((prev) =>
        prev.some((o) => o.value.toLowerCase() === clean.toLowerCase())
          ? prev
          : [{ value: clean, label: clean }, ...prev]
      );
      return clean;
    }
    try {
      const res =
        type === "education"
          ? await createEducation(clean).unwrap()
          : await createService(clean).unwrap();
      const saved = res?.data?.name || clean;
      setOptions((prev) =>
        prev.some((o) => o.value.toLowerCase() === saved.toLowerCase())
          ? prev
          : [{ value: saved, label: saved }, ...prev]
      );
      return saved;
    } catch {
      return clean;
    }
  };

  const handleChange = async (next) => {
    if (mode === "multiple") {
      const arr = Array.isArray(next) ? next : [];
      // last item may be brand new typed value
      const normalized = [];
      for (const item of arr) {
        const saved = await ensureExists(item);
        if (saved && !normalized.some((n) => n.toLowerCase() === saved.toLowerCase())) {
          normalized.push(saved);
        }
      }
      onChange?.(normalized);
    } else {
      const saved = await ensureExists(next);
      onChange?.(saved || "");
    }
  };

  return (
    <Select
      showSearch
      allowClear
      mode={mode === "multiple" ? "tags" : "tags"}
      maxCount={mode === "multiple" ? undefined : 1}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      value={
        mode === "multiple"
          ? selectedValues
          : selectedValues
            ? [selectedValues].flat().filter(Boolean)
            : []
      }
      options={options}
      filterOption={false}
      onSearch={(q) => load(q)}
      onChange={async (next) => {
        const arr = Array.isArray(next) ? next : next ? [next] : [];
        const normalized = [];
        for (const item of arr) {
          const saved = await ensureExists(item);
          if (saved && !normalized.some((n) => n.toLowerCase() === saved.toLowerCase())) {
            normalized.push(saved);
          }
        }
        if (mode === "multiple") onChange?.(normalized);
        else onChange?.(normalized[0] || "");
      }}
      onFocus={() => load("")}
      notFoundContent={searching ? <Spin size="small" /> : "Type to add new"}
      tokenSeparators={[","]}
      optionFilterProp="label"
    />
  );
}
